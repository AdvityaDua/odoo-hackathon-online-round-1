from rest_framework import serializers
from django.utils import timezone

from .models import MaintenanceRequest, MaintenanceAssignment, MaintenanceWorkLog
from core.models import MaintenanceTeam


class MaintenanceRequestCreateSerializer(serializers.ModelSerializer):
    """
    Used AFTER availability check.
    All scheduling + technician assignment MUST already be resolved.
    """

    class Meta:
        model = MaintenanceRequest
        fields = [
            "title",
            "description",
            "maintenance_type",
            "priority",
            "equipment",
            "work_center",
            "assigned_team",
            "assigned_technician",
            "scheduled_start",
            "duration_hours",
        ]

    def validate(self, data):
        # Scheduling is mandatory
        required = [
            "scheduled_start",
            "duration_hours",
            "assigned_technician",
            "work_center",
        ]
        for field in required:
            if not data.get(field):
                raise serializers.ValidationError(f"{field} is required.")

        if data["scheduled_start"] < timezone.now():
            raise serializers.ValidationError("Scheduled time cannot be in the past.")

        return data

    def create(self, validated_data):
        user = self.context["request"].user

        validated_data["created_by"] = user
        validated_data["company"] = user.company
        validated_data["department"] = user.department
        validated_data["status"] = "scheduled"

        return super().create(validated_data)


class MaintenanceRequestViewSerializer(serializers.ModelSerializer):
    equipment_name = serializers.CharField(source="equipment.name", read_only=True)
    work_center_name = serializers.CharField(source="work_center.name", read_only=True)
    technician_email = serializers.CharField(
        source="assigned_technician.email", read_only=True
    )
    team_name = serializers.CharField(source="assigned_team.name", read_only=True)

    class Meta:
        model = MaintenanceRequest
        fields = [
            "id",
            "title",
            "description",
            "maintenance_type",
            "priority",
            "status",
            "equipment",
            "equipment_name",
            "work_center",
            "work_center_name",
            "assigned_team",
            "team_name",
            "assigned_technician",
            "technician_email",
            "scheduled_start",
            "duration_hours",
            "created_at",
        ]


from maintenance.services import pick_technician_from_team


class MaintenanceReassignmentSerializer(serializers.Serializer):
    maintenance_id = serializers.IntegerField()
    new_team = serializers.PrimaryKeyRelatedField(
        queryset=MaintenanceTeam.objects.all()
    )
    reason = serializers.CharField()

    def validate(self, data):
        user = self.context["request"].user
        maintenance = MaintenanceRequest.objects.filter(
            id=data["maintenance_id"]
        ).first()

        if not maintenance:
            raise serializers.ValidationError("Maintenance request not found.")

        if maintenance.status not in ["scheduled", "in_progress"]:
            raise serializers.ValidationError(
                "Reassignment not allowed in current status."
            )

        # Technician can reassign only if currently assigned
        if maintenance.assigned_technician != user:
            raise serializers.ValidationError(
                "You are not assigned to this maintenance request."
            )

        data["maintenance"] = maintenance
        return data

    def save(self):
        request = self.context["request"]
        maintenance = self.validated_data["maintenance"]
        new_team = self.validated_data["new_team"]
        reason = self.validated_data["reason"]

        # -----------------------------
        # Close current assignment
        # -----------------------------
        MaintenanceAssignment.objects.filter(
            maintenance_request=maintenance,
            is_active=True
        ).update(is_active=False)

        # -----------------------------
        # Pick new technician
        # -----------------------------
        technician = pick_technician_from_team(
            team=new_team,
            start=maintenance.scheduled_start,
            duration=maintenance.duration_hours
        )

        if not technician:
            raise serializers.ValidationError(
                "No available technician in selected team."
            )

        # -----------------------------
        # Create new assignment
        # -----------------------------
        MaintenanceAssignment.objects.create(
            maintenance_request=maintenance,
            assigned_team=new_team,
            assigned_technician=technician,
            assigned_by=request.user,
            is_active=True
        )

        # -----------------------------
        # Update maintenance request
        # -----------------------------
        maintenance.assigned_team = new_team
        maintenance.assigned_technician = technician
        maintenance.priority = "critical"
        maintenance.save()

        return maintenance



class MaintenanceWorkLogCreateSerializer(serializers.ModelSerializer):
    maintenance_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = MaintenanceWorkLog
        fields = ["maintenance_id", "note", "status"]

    def validate(self, data):
        request = self.context["request"]
        technician = request.user

        maintenance = MaintenanceRequest.objects.filter(
            id=data["maintenance_id"]
        ).first()

        if not maintenance:
            raise serializers.ValidationError("Maintenance request not found.")

        if maintenance.status in ["completed", "cancelled"]:
            raise serializers.ValidationError(
                "Cannot add work log to completed or cancelled maintenance."
            )

        if maintenance.assigned_technician != technician:
            raise serializers.ValidationError(
                "You are not assigned to this maintenance request."
            )

        data["maintenance"] = maintenance
        return data

    def create(self, validated_data):
        maintenance = validated_data.pop("maintenance")
        validated_data.pop("maintenance_id", None)

        technician = self.context["request"].user

        log = MaintenanceWorkLog.objects.create(
            maintenance_request=maintenance,
            technician=technician,
            **validated_data
        )
        if log.status in ["in_progress", "blocked"]:
            maintenance.status = "in_progress"
            maintenance.priority = "critical"
        elif log.status == "completed":
            maintenance.status = "completed"

        maintenance.save()

        return log
    


class MaintenanceWorkLogViewSerializer(serializers.ModelSerializer):
    technician_email = serializers.CharField(
        source="technician.email",
        read_only=True
    )

    class Meta:
        model = MaintenanceWorkLog
        fields = [
            "id",
            "technician_email",
            "note",
            "status",
            "created_at",
        ]
        