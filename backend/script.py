from datetime import timedelta
from django.utils import timezone

from maintenance.models import (
    MaintenanceRequest,
    MaintenanceAssignment,
    MaintenanceWorkLog,
)
from maintenance.services import pick_technician_from_team

from accounts.models import User
from core.models import (
    Equipment,
    WorkCenter,
    MaintenanceTeam,
)

print("🛠️ Seeding Maintenance Requests (FIXED)...")

now = timezone.now()

# =====================================================
# FETCH REQUIRED DATA
# =====================================================

user = User.objects.filter(role="user").first()
admin = User.objects.filter(role="admin").first()
technicians = User.objects.filter(role="technician")

equipments = list(Equipment.objects.select_related("company", "department"))
work_centers = list(WorkCenter.objects.select_related("company"))
teams = list(MaintenanceTeam.objects.select_related("company"))

assert user, "❌ No user found"
assert admin, "❌ No admin found"
assert equipments, "❌ No equipment found"
assert work_centers, "❌ No work centers found"
assert teams, "❌ No maintenance teams found"

# =====================================================
# CREATE MAINTENANCE REQUESTS
# =====================================================

maintenance_requests = []

for idx in range(5):
    equipment = equipments[idx % len(equipments)]
    work_center = work_centers[idx % len(work_centers)]
    team = teams[idx % len(teams)]

    scheduled_start = now + timedelta(days=idx + 1)
    duration = 2

    technician = pick_technician_from_team(
        team=team,
        start=scheduled_start,
        duration=duration
    )

    if not technician:
        print(f"⚠️ No technician available for team {team.name}")
        continue

    mr = MaintenanceRequest.objects.create(
        title=f"Routine Maintenance #{idx + 1}",
        description="Auto-generated demo maintenance",
        maintenance_type="preventive" if idx % 2 == 0 else "corrective",
        priority="medium",
        status="scheduled",

        # RELATIONS (SAFE & EXPLICIT)
        equipment=equipment,
        work_center=work_center,
        company=equipment.company,          # ✅ FIX
        department=equipment.department,    # ✅ SAFE
        created_by=user,

        assigned_team=team,
        assigned_technician=technician,

        scheduled_start=scheduled_start,
        duration_hours=duration,
    )

    # Assignment history
    MaintenanceAssignment.objects.create(
        maintenance_request=mr,
        assigned_team=team,
        assigned_technician=technician,
        assigned_by=admin,
        is_active=True,
    )

    maintenance_requests.append(mr)

print(f"✅ Created {len(maintenance_requests)} maintenance requests")

# =====================================================
# ADD WORK LOGS
# =====================================================

for mr in maintenance_requests:
    tech = mr.assigned_technician

    # Start work
    MaintenanceWorkLog.objects.create(
        maintenance_request=mr,
        technician=tech,
        note="Inspection started",
        status="in_progress",
    )

    mr.status = "in_progress"
    mr.priority = "critical"
    mr.save(update_fields=["status", "priority"])

    # Complete work
    MaintenanceWorkLog.objects.create(
        maintenance_request=mr,
        technician=tech,
        note="Maintenance completed successfully",
        status="completed",
    )

    mr.status = "completed"
    mr.save(update_fields=["status"])

print("✅ Work logs added and maintenance completed")

# =====================================================
# SUMMARY
# =====================================================

print("--------------------------------------------------")
print(f"Maintenance Requests: {MaintenanceRequest.objects.count()}")
print(f"Assignments: {MaintenanceAssignment.objects.count()}")
print(f"Work Logs: {MaintenanceWorkLog.objects.count()}")
print("--------------------------------------------------")
print("🎉 Maintenance demo data seeded successfully!")