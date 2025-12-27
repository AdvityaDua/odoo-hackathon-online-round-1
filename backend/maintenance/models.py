from django.db import models
from django.conf import settings
from core.models import (
    Equipment,
    WorkCenter,
    MaintenanceTeam,
)
from accounts.models import Department, Company, User

class MaintenanceRequest(models.Model):
    # ----------------------------- 
    # ENUMS
    # -----------------------------

    MAINTENANCE_TYPE_CHOICES = [
        ("preventive", "Preventive"),
        ("corrective", "Corrective"),
    ]

    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("critical", "Critical"),
    ]

    STATUS_CHOICES = [
        ("new", "New"),
        ("scheduled", "Scheduled"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]
    # -----------------------------
    # CORE FIELDS
    # -----------------------------

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    maintenance_type = models.CharField(
        max_length=20,
        choices=MAINTENANCE_TYPE_CHOICES
    )

    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default="medium"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="new"
    )

    # -----------------------------
    # RELATIONS
    # -----------------------------

    equipment = models.ForeignKey(
        Equipment,
        on_delete=models.CASCADE,
        related_name="maintenance_requests"
    )

    # Work Center = LOCATION where maintenance happens
    work_center = models.ForeignKey(
        WorkCenter,
        on_delete=models.PROTECT,
        related_name="maintenance_requests"
    )

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_maintenance_requests"
    )

    # -----------------------------
    # ASSIGNMENT
    # -----------------------------

    assigned_team = models.ForeignKey(
        MaintenanceTeam,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    assigned_technician = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_maintenance_requests",
        limit_choices_to={"role": "technician"}
    )

    # -----------------------------
    # SCHEDULING
    # -----------------------------

    scheduled_start = models.DateTimeField(null=True, blank=True)
    duration_hours = models.PositiveIntegerField(null=True, blank=True)

    # -----------------------------
    # TIMESTAMPS
    # -----------------------------

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # -----------------------------
    # META
    # -----------------------------

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.equipment.name})"


class MaintenanceAssignment(models.Model):
    maintenance_request = models.ForeignKey(
        "MaintenanceRequest",
        on_delete=models.CASCADE,
        related_name="assignments"
    )

    assigned_team = models.ForeignKey(
        MaintenanceTeam,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    assigned_technician = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={"role": "technician"}
    )

    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="made_assignments"
    )

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.maintenance_request.id} → {self.assigned_technician}"


class MaintenanceWorkLog(models.Model):
    maintenance_request = models.ForeignKey(
        "MaintenanceRequest",
        on_delete=models.CASCADE,
        related_name="work_logs"
    )

    technician = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={"role": "technician"}
    )

    note = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=[
            ("in_progress", "In Progress"),
            ("blocked", "Blocked"),
            ("completed", "Completed"),
        ]
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Log by {self.technician.email}"