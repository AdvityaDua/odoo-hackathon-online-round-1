from .models import Department, Company, EquipmentCategory, WorkCenter, Equipment
from rest_framework import serializers

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name']


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["id", "name", "location", "created_at"]
        read_only_fields = ["created_at"]


class EquipmentCategorySerializer(serializers.ModelSerializer):
    default_technician_detail = serializers.SerializerMethodField()

    class Meta:
        model = EquipmentCategory
        fields = [
            "id",
            "name",
            "default_technician",
            "default_technician_detail",
        ]

    def get_default_technician_detail(self, obj):
        if obj.default_technician:
            return {
                "id": obj.default_technician.id,
                "email": obj.default_technician.email,
                "role": obj.default_technician.role,
            }
        return None


class WorkCenterSerializer(serializers.ModelSerializer):
    alternative_work_centers = serializers.PrimaryKeyRelatedField(
        queryset=WorkCenter.objects.all(),
        many=True,
        required=False
    )

    class Meta:
        model = WorkCenter
        fields = [
            "id",
            "name",
            "code",
            "company",
            "tag",
            "alternative_work_centers",
            "cost_per_hour",
            "capacity",
            "time_efficiency",
            "oee_target",
        ]


class EquipmentSerializer(serializers.ModelSerializer):
    company_detail = serializers.SerializerMethodField()
    category_detail = serializers.SerializerMethodField()
    employee_detail = serializers.SerializerMethodField()
    department_detail = serializers.SerializerMethodField()

    class Meta:
        model = Equipment
        fields = [
            "id",
            "name",
            "serial_number",
            "purchase_date",
            "warranty_expiration",
            "last_maintenance_service_date",
            "maintenance_interval_days",
            "company",
            "company_detail",
            "category",
            "category_detail",
            "employee",
            "employee_detail",
            "department",
            "department_detail",
        ]

    def get_company_detail(self, obj):
        return {
            "id": obj.company.id,
            "name": obj.company.name,
            "location": obj.company.location,
        }

    def get_category_detail(self, obj):
        return {
            "id": obj.category.id,
            "name": obj.category.name,
        }

    def get_employee_detail(self, obj):
        if obj.employee:
            return {
                "id": obj.employee.id,
                "email": obj.employee.email,
                "role": obj.employee.role,
            }
        return None

    def get_department_detail(self, obj):
        if obj.department:
            return {
                "id": obj.department.id,
                "name": obj.department.name,
            }
        return None


class MaintenanceEquipmentSelectSerializer(serializers.ModelSerializer):
    company = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()

    class Meta:
        model = Equipment
        fields = [
            "id",
            "name",
            "serial_number",
            "company",
            "category",
        ]
        read_only_fields = fields

    def get_company(self, obj):
        return {
            "id": obj.company.id,
            "name": obj.company.name,
        }

    def get_category(self, obj):
        return {
            "id": obj.category.id,
            "name": obj.category.name,
        }


class MaintenanceWorkCenterSelectSerializer(serializers.ModelSerializer):
    company_id = serializers.IntegerField(source="company.id", read_only=True)
    company_name = serializers.CharField(source="company.name", read_only=True)
    company_location = serializers.CharField(source="company.location", read_only=True)

    class Meta:
        model = WorkCenter
        fields = [
            "id",
            "name",
            "code",
            "company_id",
            "company_name",
            "company_location",
        ]

class EquipmentViewSerializer(serializers.ModelSerializer):
    company = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    employee = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()

    class Meta:
        model = Equipment
        fields = [
            "id",
            "name",
            "serial_number",
            "purchase_date",
            "warranty_expiration",
            "last_maintenance_service_date",
            "maintenance_interval_days",
            "company",
            "category",
            "employee",
            "department",
        ]
        read_only_fields = fields 

    def get_company(self, obj):
        return {
            "id": obj.company.id,
            "name": obj.company.name,
            "location": obj.company.location,
        }

    def get_category(self, obj):
        return {
            "id": obj.category.id,
            "name": obj.category.name,
        }

    def get_employee(self, obj):
        if obj.employee:
            return {
                "id": obj.employee.id,
                "email": obj.employee.email,
                "role": obj.employee.role,
            }
        return None

    def get_department(self, obj):
        if obj.department:
            return {
                "id": obj.department.id,
                "name": obj.department.name,
            }
        return None