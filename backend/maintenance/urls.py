from django.urls import path

from .views import (
    MaintenanceRequestViewSet,
    MaintenanceAvailabilityView,
    MaintenanceReassignmentView,
    MaintenanceWorkLogCreateView,
    MaintenanceWorkLogListView,
)

maintenance_list = MaintenanceRequestViewSet.as_view({
    "get": "list",
    "post": "create",
})

maintenance_detail = MaintenanceRequestViewSet.as_view({
    "get": "retrieve",
    "put": "update",
    "patch": "partial_update",
})

urlpatterns = [
    path("", maintenance_list, name="maintenance-list"),
    path("<int:pk>/", maintenance_detail, name="maintenance-detail"),
    path(
        "availability/",
        MaintenanceAvailabilityView.as_view(),
        name="maintenance-availability",
    ),
    path(
        "reassign/",
        MaintenanceReassignmentView.as_view(),
        name="maintenance-reassign",
    ),
    path(
        "worklog/",
        MaintenanceWorkLogCreateView.as_view(),
        name="maintenance-worklog-create",
    ),
    path(
        "<int:maintenance_id>/worklogs/",
        MaintenanceWorkLogListView.as_view(),
        name="maintenance-worklog-list",
    ),
]