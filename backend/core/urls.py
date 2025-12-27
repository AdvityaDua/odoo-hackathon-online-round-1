from django.urls import path

from .views import (
    DepartmentViewSet,
    CompanyViewSet,
    EquipmentCategoryViewSet,
    EquipmentViewSet,
    WorkCenterViewSet,
    EquipmentSelectView,
    WorkCenterSelectView,
    CompanySelectView,
    DepartmentSelectView,
)
department_list = DepartmentViewSet.as_view({
    "get": "list",
    "post": "create",
})

department_detail = DepartmentViewSet.as_view({
    "get": "retrieve",
    "put": "update",
    "patch": "partial_update",
    "delete": "destroy",
})

company_list = CompanyViewSet.as_view({
    "get": "list",
    "post": "create",
})

company_detail = CompanyViewSet.as_view({
    "get": "retrieve",
    "put": "update",
    "patch": "partial_update",
    "delete": "destroy",
})

equipment_category_list = EquipmentCategoryViewSet.as_view({
    "get": "list",
    "post": "create",
})

equipment_category_detail = EquipmentCategoryViewSet.as_view({
    "get": "retrieve",
    "put": "update",
    "patch": "partial_update",
    "delete": "destroy",
})

equipment_list = EquipmentViewSet.as_view({
    "get": "list",
    "post": "create",
})

equipment_detail = EquipmentViewSet.as_view({
    "get": "retrieve",
    "put": "update",
    "patch": "partial_update",
    "delete": "destroy",
})

work_center_list = WorkCenterViewSet.as_view({
    "get": "list",
    "post": "create",
})

work_center_detail = WorkCenterViewSet.as_view({
    "get": "retrieve",
    "put": "update",
    "patch": "partial_update",
    "delete": "destroy",
})


urlpatterns = [
    path("departments/", department_list, name="department-list"),
    path("departments/<int:pk>/", department_detail, name="department-detail"),
    path("departments/select/", DepartmentSelectView.as_view(), name="department-select"),  # ✅ ADDED

    path("companies/", company_list, name="company-list"),
    path("companies/<int:pk>/", company_detail, name="company-detail"),
    path("companies/select/", CompanySelectView.as_view(), name="company-select"),

    path("equipment-categories/", equipment_category_list, name="equipment-category-list"),
    path("equipment-categories/<int:pk>/", equipment_category_detail, name="equipment-category-detail"),

    path("equipment/", equipment_list, name="equipment-list"),
    path("equipment/<int:pk>/", equipment_detail, name="equipment-detail"),
    path("equipment/select/", EquipmentSelectView.as_view(), name="equipment-select"),

    path("work-centers/", work_center_list, name="work-center-list"),
    path("work-centers/<int:pk>/", work_center_detail, name="work-center-detail"),
    path("work-centers/select/", WorkCenterSelectView.as_view(), name="work-center-select"),
]