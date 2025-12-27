from rest_framework.test import APITestCase
from rest_framework import status

from accounts.models import User
from core.models import (
    Department,
    Company,
    EquipmentCategory,
    Equipment,
    WorkCenter,
)


class CoreViewsTestCase(APITestCase):

    def setUp(self):
        self.company1 = Company.objects.create(
            name="GearGuard Industries",
            location="Ahmedabad Plant"
        )

        self.company2 = Company.objects.create(
            name="GearGuard R&D",
            location="Pune"
        )

        self.department1 = Department.objects.create(name="Production")
        self.department2 = Department.objects.create(name="Maintenance")

        self.admin = User.objects.create_user(
            email="admin@test.com",
            password="admin123",
            role="admin",
            department=self.department2,
            company=self.company1   
        )

        self.technician = User.objects.create_user(
            email="tech@test.com",
            password="tech123",
            role="technician",
            department=self.department2,
            company=self.company1   
        )

        self.user = User.objects.create_user(
            email="user@test.com",
            password="user123",
            role="user",
            department=self.department1,
            company=self.company1  
        )


        self.category = EquipmentCategory.objects.create(
            name="CNC Machines",
            default_technician=self.technician
        )

        self.equipment = Equipment.objects.create(
            name="CNC Machine #12",
            serial_number="CNC-12-XYZ",
            company=self.company1,
            category=self.category,
            employee=self.user,
            department=self.department1,
            maintenance_interval_days=180
        )

        self.work_center = WorkCenter.objects.create(
            name="Assembly Line A",
            code="ASM-A",
            company=self.company1,
            cost_per_hour=450,
            capacity=3,
            time_efficiency=85,
            oee_target=90
        )


    def test_department_list_access(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/core/departments/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_department_create_admin_only(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post("/api/core/departments/", {"name": "IT"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.admin)
        response = self.client.post("/api/core/departments/", {"name": "IT"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


    def test_company_list_public(self):
        response = self.client.get("/api/core/companies/select/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)


    def test_equipment_category_list(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/core/equipment-categories/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)


    def test_equipment_visibility_for_user(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/core/equipment/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_equipment_admin_sees_all(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/core/equipment/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_equipment_create_admin_only(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post("/api/core/equipment/", {})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)



    def test_work_center_visibility_by_company(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/core/work-centers/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


    def test_equipment_select(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/core/equipment/select/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_work_center_select(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/core/work-centers/select/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)