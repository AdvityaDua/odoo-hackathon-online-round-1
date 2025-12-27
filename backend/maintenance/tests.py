from rest_framework.test import APITestCase
from rest_framework import status
from django.utils import timezone
from datetime import timedelta

from accounts.models import User
from core.models import (
    Company,
    Department,
    Equipment,
    EquipmentCategory,
    WorkCenter,
    MaintenanceTeam,
)
from maintenance.models import (
    MaintenanceRequest,
    MaintenanceAssignment,
    MaintenanceWorkLog,
)


class MaintenanceFlowTestCase(APITestCase):

    def setUp(self):
        # -----------------------------
        # Base Setup
        # -----------------------------
        self.company = Company.objects.create(
            name="GearGuard Industries",
            location="Ahmedabad"
        )

        self.department = Department.objects.create(name="Maintenance")

        # -----------------------------
        # Users
        # -----------------------------
        self.admin = User.objects.create_user(
            email="admin@test.com",
            password="admin123",
            role="admin",
            company=self.company,
            department=self.department
        )

        self.tech1 = User.objects.create_user(
            email="tech1@test.com",
            password="tech123",
            role="technician",
            company=self.company,
            department=self.department
        )

        self.tech2 = User.objects.create_user(
            email="tech2@test.com",
            password="tech123",
            role="technician",
            company=self.company,
            department=self.department
        )

        self.user = User.objects.create_user(
            email="user@test.com",
            password="user123",
            role="user",
            company=self.company,
            department=self.department
        )

        # -----------------------------
        # Equipment & WorkCenter
        # -----------------------------
        self.category = EquipmentCategory.objects.create(
            name="CNC",
            default_technician=self.tech1
        )

        self.equipment = Equipment.objects.create(
            name="CNC Machine #1",
            serial_number="CNC-001",
            company=self.company,
            category=self.category,
            department=self.department
        )

        self.work_center = WorkCenter.objects.create(
            name="Assembly Line A",
            code="ASM-A",
            company=self.company,
            cost_per_hour=500,
            capacity=2,
            time_efficiency=90,
            oee_target=95
        )

        # -----------------------------
        # Teams
        # -----------------------------
        self.team1 = MaintenanceTeam.objects.create(
            name="Mechanical Team",
            company=self.company
        )
        self.team1.members.add(self.tech1)

        self.team2 = MaintenanceTeam.objects.create(
            name="Electrical Team",
            company=self.company
        )
        self.team2.members.add(self.tech2)

        self.start_time = timezone.now() + timedelta(hours=2)

    # =====================================================
    # 1️⃣ Availability & Auto Assignment
    # =====================================================

    def test_availability_and_auto_assignment(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            "/api/maintenance/availability/",
            {
                "equipment": self.equipment.id,
                "maintenance_team": self.team1.id,
                "scheduled_start": self.start_time.isoformat(),
                "duration_hours": 2
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("assigned_technician", response.data)
        self.assertEqual(
            response.data["assigned_technician"]["email"],
            self.tech1.email
        )

    # =====================================================
    # 2️⃣ Create Maintenance Request
    # =====================================================

    def test_create_maintenance_request(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            "/api/maintenance/",
            {
                "title": "Motor Issue",
                "description": "Overheating observed",
                "maintenance_type": "corrective",
                "priority": "high",
                "equipment": self.equipment.id,
                "work_center": self.work_center.id,
                "assigned_team": self.team1.id,
                "assigned_technician": self.tech1.id,
                "scheduled_start": self.start_time.isoformat(),
                "duration_hours": 2
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            MaintenanceRequest.objects.count(),
            1
        )

    # =====================================================
    # 3️⃣ Technician Work Log & Escalation
    # =====================================================

    def test_worklog_and_priority_escalation(self):
        maintenance = MaintenanceRequest.objects.create(
            title="Bearing Issue",
            maintenance_type="corrective",
            priority="medium",
            status="scheduled",
            equipment=self.equipment,
            work_center=self.work_center,
            assigned_team=self.team1,
            assigned_technician=self.tech1,
            scheduled_start=self.start_time,
            duration_hours=2,
            company=self.company,
            department=self.department,
            created_by=self.user
        )

        self.client.force_authenticate(user=self.tech1)

        response = self.client.post(
            "/api/maintenance/worklog/",
            {
                "maintenance_id": maintenance.id,
                "note": "Inspection started",
                "status": "in_progress"
            },
            format="json"
        )

        maintenance.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(maintenance.status, "in_progress")
        self.assertEqual(maintenance.priority, "critical")

    # =====================================================
    # 4️⃣ Technician Reassignment
    # =====================================================

    def test_technician_reassignment(self):
        maintenance = MaintenanceRequest.objects.create(
            title="Electrical Fault",
            maintenance_type="corrective",
            priority="critical",
            status="in_progress",
            equipment=self.equipment,
            work_center=self.work_center,
            assigned_team=self.team1,
            assigned_technician=self.tech1,
            scheduled_start=self.start_time,
            duration_hours=2,
            company=self.company,
            department=self.department,
            created_by=self.user
        )

        MaintenanceAssignment.objects.create(
            maintenance_request=maintenance,
            assigned_team=self.team1,
            assigned_technician=self.tech1,
            assigned_by=self.admin,
            is_active=True
        )

        self.client.force_authenticate(user=self.tech1)

        response = self.client.post(
            "/api/maintenance/reassign/",
            {
                "maintenance_id": maintenance.id,
                "new_team": self.team2.id,
                "reason": "Electrical issue detected"
            },
            format="json"
        )

        maintenance.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            maintenance.assigned_technician,
            self.tech2
        )

    # =====================================================
    # 5️⃣ Visibility Rules
    # =====================================================

    def test_visibility_for_roles(self):
        maintenance = MaintenanceRequest.objects.create(
            title="Visibility Test",
            maintenance_type="preventive",
            priority="medium",
            status="scheduled",
            equipment=self.equipment,
            work_center=self.work_center,
            assigned_team=self.team1,
            assigned_technician=self.tech1,
            scheduled_start=self.start_time,
            duration_hours=2,
            company=self.company,
            department=self.department,
            created_by=self.user
        )

        # Technician sees it
        self.client.force_authenticate(user=self.tech1)
        response = self.client.get("/api/maintenance/")
        self.assertEqual(len(response.data), 1)

        # User sees it
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/maintenance/")
        self.assertEqual(len(response.data), 1)

        # Admin sees it
        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/maintenance/")
        self.assertEqual(len(response.data), 1)

    # =====================================================
    # 6️⃣ View Work Log Timeline
    # =====================================================

    def test_view_worklog_timeline(self):
        maintenance = MaintenanceRequest.objects.create(
            title="Timeline Test",
            maintenance_type="corrective",
            priority="high",
            status="scheduled",
            equipment=self.equipment,
            work_center=self.work_center,
            assigned_team=self.team1,
            assigned_technician=self.tech1,
            scheduled_start=self.start_time,
            duration_hours=2,
            company=self.company,
            department=self.department,
            created_by=self.user
        )

        # Create logs directly
        MaintenanceWorkLog.objects.create(
            maintenance_request=maintenance,
            technician=self.tech1,
            note="Started diagnosis",
            status="in_progress"
        )

        MaintenanceWorkLog.objects.create(
            maintenance_request=maintenance,
            technician=self.tech1,
            note="Issue resolved",
            status="completed"
        )

        self.client.force_authenticate(user=self.tech1)

        response = self.client.get(
            f"/api/maintenance/{maintenance.id}/worklogs/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        self.assertEqual(response.data[0]["status"], "in_progress")
        self.assertEqual(response.data[1]["status"], "completed")
    
        # =====================================================
    # 7️⃣ Prevent Unauthorized Technician Logging
    # =====================================================

    def test_worklog_rejected_for_unassigned_technician(self):
        maintenance = MaintenanceRequest.objects.create(
            title="Unauthorized Log Test",
            maintenance_type="corrective",
            priority="high",
            status="scheduled",
            equipment=self.equipment,
            work_center=self.work_center,
            assigned_team=self.team1,
            assigned_technician=self.tech1,
            scheduled_start=self.start_time,
            duration_hours=2,
            company=self.company,
            department=self.department,
            created_by=self.user
        )

        # tech2 is NOT assigned
        self.client.force_authenticate(user=self.tech2)
        response = self.client.post(
            "/api/maintenance/worklog/",
            {
                "maintenance_id": maintenance.id,
                "note": "Trying to log work",
                "status": "in_progress"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # =====================================================
    # 8️⃣ Prevent Work Log After Completion
    # =====================================================

    def test_worklog_not_allowed_after_completion(self):
        maintenance = MaintenanceRequest.objects.create(
            title="Completed Maintenance",
            maintenance_type="corrective",
            priority="critical",
            status="completed",
            equipment=self.equipment,
            work_center=self.work_center,
            assigned_team=self.team1,
            assigned_technician=self.tech1,
            scheduled_start=self.start_time,
            duration_hours=2,
            company=self.company,
            department=self.department,
            created_by=self.user
        )

        self.client.force_authenticate(user=self.tech1)

        response = self.client.post(
            "/api/maintenance/worklog/",
            {
                "maintenance_id": maintenance.id,
                "note": "Post completion log",
                "status": "completed"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)