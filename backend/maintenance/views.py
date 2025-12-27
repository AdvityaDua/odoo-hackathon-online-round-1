from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from datetime import timedelta
from django.utils import timezone
from django.db.models import Q

from .models import MaintenanceRequest, MaintenanceWorkLog
from .serializers import (
    MaintenanceRequestCreateSerializer,
    MaintenanceRequestViewSerializer,
    MaintenanceReassignmentSerializer,
    MaintenanceWorkLogCreateSerializer,
    MaintenanceWorkLogViewSerializer
)
from .services import pick_technician_from_team

from core.models import WorkCenter, MaintenanceTeam


class MaintenanceAvailabilityView(APIView):
    """
    PRE-CREATION VIEW
    - Auto-assign technician
    - Return available work centers
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data

        equipment = data.get("equipment")
        team_id = data.get("maintenance_team")
        start = data.get("scheduled_start")
        duration = data.get("duration_hours")

        if not all([equipment, team_id, start, duration]):
            return Response(
                {"error": "equipment, maintenance_team, scheduled_start and duration_hours are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        scheduled_start = timezone.datetime.fromisoformat(start)
        duration = int(duration)
        scheduled_end = scheduled_start + timedelta(hours=duration)

        team = MaintenanceTeam.objects.filter(id=team_id).first()
        if not team:
            return Response(
                {"error": "Invalid maintenance team"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        technician = pick_technician_from_team(team, scheduled_start, duration)
        if not technician:
            return Response(
                {"error": "No available technician in selected team"},
                status=status.HTTP_409_CONFLICT,
            )

        busy_work_centers = MaintenanceRequest.objects.filter(
            scheduled_start__lt=scheduled_end,
            scheduled_start__gte=scheduled_start,
            status__in=["scheduled", "in_progress"],
        ).values_list("work_center_id", flat=True)

        available_work_centers = WorkCenter.objects.filter(
            company=request.user.company
        ).exclude(id__in=busy_work_centers)

        return Response(
            {
                "assigned_technician": {
                    "id": technician.id,
                    "email": technician.email,
                },
                "available_work_centers": [
                    {
                        "id": wc.id,
                        "name": wc.name,
                        "code": wc.code,
                    }
                    for wc in available_work_centers
                ],
            },
            status=status.HTTP_200_OK,
        )


class MaintenanceRequestViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "admin":
            return MaintenanceRequest.objects.all()

        if user.role == "technician":
            return MaintenanceRequest.objects.filter(
                Q(assigned_technician=user)
                | Q(assigned_team__members=user)
            )

        return MaintenanceRequest.objects.filter(
            Q(created_by=user) | Q(department=user.department)
        )

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"]:
            return MaintenanceRequestViewSerializer
        return MaintenanceRequestCreateSerializer


class MaintenanceReassignmentView(APIView):
    """
    Allows a technician to request reassignment
    by switching maintenance team.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "technician":
            return Response(
                {"error": "Only technicians can reassign maintenance."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = MaintenanceReassignmentSerializer(
            data=request.data,
            context={"request": request}
        )

        serializer.is_valid(raise_exception=True)
        maintenance = serializer.save()

        return Response(
            {
                "message": "Maintenance reassigned successfully.",
                "new_technician": maintenance.assigned_technician.email,
                "new_team": maintenance.assigned_team.name,
            },
            status=status.HTTP_200_OK
        )



class MaintenanceWorkLogCreateView(APIView):
    """
    Technician adds progress updates.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "technician":
            return Response(
                {"error": "Only technicians can add work logs."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = MaintenanceWorkLogCreateSerializer(
            data=request.data,
            context={"request": request},
        )

        serializer.is_valid(raise_exception=True)
        log = serializer.save()

        return Response(
            {
                "message": "Work log added successfully.",
                "status": log.status,
            },
            status=status.HTTP_201_CREATED,
        )

class MaintenanceWorkLogListView(APIView):

    def get(self, request, maintenance_id):
        logs = MaintenanceWorkLog.objects.filter(
            maintenance_request_id=maintenance_id
        ).order_by("created_at")

        serializer = MaintenanceWorkLogViewSerializer(logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)