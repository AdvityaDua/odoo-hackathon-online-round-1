# core/views.py

from django.db.models import Q
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import (
    Department,
    Company,
    EquipmentCategory,
    Equipment,
    WorkCenter,
    MaintenanceTeam,
)

from .serializers import DepartmentSerializer
from .serializers import CompanySerializer
from .serializers import EquipmentCategorySerializer
from .serializers import EquipmentSerializer
from .serializers import EquipmentViewSerializer
from .serializers import WorkCenterSerializer
from .serializers import MaintenanceEquipmentSelectSerializer
from .serializers import MaintenanceWorkCenterSelectSerializer
from .serializers import MaintenanceTeamSerializer
from .serializers import MaintenanceTeamViewSerializer
from .permissions import IsAdminForWriteElseRead



class DepartmentViewSet(ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdminForWriteElseRead]



class CompanyViewSet(ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAdminForWriteElseRead]


class EquipmentCategoryViewSet(ModelViewSet):
    queryset = EquipmentCategory.objects.all()
    serializer_class = EquipmentCategorySerializer
    permission_classes = [IsAdminForWriteElseRead]


class EquipmentViewSet(ModelViewSet):

    def get_queryset(self):
        user = self.request.user

        if user.role == "admin":
            return Equipment.objects.all()

        return Equipment.objects.filter(
            Q(employee=user) |
            Q(department=user.department)
        ).distinct()

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"]:
            return EquipmentViewSerializer
        return EquipmentSerializer

    permission_classes = [IsAdminForWriteElseRead]


class EquipmentSelectView(APIView):

    def get(self, request):
        user = request.user

        queryset = Equipment.objects.filter(
            Q(employee=user) |
            Q(department=user.department)
        ).distinct()

        serializer = MaintenanceEquipmentSelectSerializer(queryset, many=True)
        return Response(serializer.data)

class WorkCenterViewSet(ModelViewSet):

    def get_queryset(self):
        user = self.request.user

        if getattr(user, "role", None) == "admin":
            return WorkCenter.objects.all()

        return WorkCenter.objects.filter(
            company=user.company
        )

    serializer_class = WorkCenterSerializer
    permission_classes = [IsAdminForWriteElseRead]


class WorkCenterSelectView(APIView):

    def get(self, request):
        user = request.user

        queryset = WorkCenter.objects.filter(
            company=user.company
        )

        serializer = MaintenanceWorkCenterSelectSerializer(queryset, many=True)
        return Response(serializer.data)


class CompanySelectView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        queryset = Company.objects.all()
        serializer = CompanySerializer(queryset, many=True)
        return Response(serializer.data)


class DepartmentSelectView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        queryset = Department.objects.all()
        serializer = DepartmentSerializer(queryset, many=True)
        return Response(serializer.data)

class MaintenanceTeamViewSet(ModelViewSet):
    permission_classes = [IsAdminForWriteElseRead]

    def get_queryset(self):
        user = self.request.user

        if user.role == "admin":
            return MaintenanceTeam.objects.all()

        return MaintenanceTeam.objects.filter(company=user.company)

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"]:
            return MaintenanceTeamViewSerializer
        return MaintenanceTeamSerializer