from django.db import models
from accounts.models import User, Department, Company



class EquipmentCategory(models.Model):
    name = models.CharField(max_length=100)
    default_technician = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="default_equipment_categories"
    )
    def __str__(self):
        return self.name


class WorkCenter(models.Model):
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=50, unique=True)

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="work_centers"
    )

    tag = models.CharField(max_length=100, blank=True)

    alternative_work_centers = models.ManyToManyField(
        "self",
        blank=True
    )

    cost_per_hour = models.DecimalField(max_digits=10, decimal_places=2)
    capacity = models.PositiveIntegerField(default=1)
    time_efficiency = models.DecimalField(max_digits=5, decimal_places=2)  # %
    oee_target = models.DecimalField(max_digits=5, decimal_places=2)       # %

    def __str__(self):
        return self.name


class Equipment(models.Model):
    name = models.CharField(max_length=150)
    serial_number = models.CharField(max_length=100, unique=True)
    
    purchase_date = models.DateField(null=True, blank=True)
    warranty_expiration = models.DateField(null=True, blank=True)
    
    last_maintenance_service_date = models.DateField(null=True, blank=True)

    maintenance_interval_days = models.PositiveIntegerField(null=True, blank=True)

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="equipment"
    )

    category = models.ForeignKey(
        EquipmentCategory,
        on_delete=models.PROTECT,
        related_name="equipment"
    )

    employee = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="owned_equipment"
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        related_name="equipment"
    )

    def __str__(self):
        return self.name