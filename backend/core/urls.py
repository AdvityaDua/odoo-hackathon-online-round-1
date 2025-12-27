from django.urls import path
from .views import DepartmentView

urlpatterns = [
    path('departments/', DepartmentView.as_view(), name='department-list'),
]
