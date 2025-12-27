from datetime import timedelta
from django.db.models import Q

from .models import MaintenanceRequest


def is_technician_available(technician, start, duration):
    end = start + timedelta(hours=duration)

    return not MaintenanceRequest.objects.filter(
        assigned_technician=technician,
        scheduled_start__lt=end,
        scheduled_start__gte=start,
        status__in=["scheduled", "in_progress"],
    ).exists()


def pick_technician_from_team(team, start, duration):
    for technician in team.members.all():
        if is_technician_available(technician, start, duration):
            return technician
    return None