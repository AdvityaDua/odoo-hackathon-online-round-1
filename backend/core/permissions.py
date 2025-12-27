from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminForWriteElseRead(BasePermission):
    """
    Read-only access for all authenticated users.
    Write access only for admin users.
    """

    def has_permission(self, request, view):
        # Allow all safe (read-only) methods
        if request.method in SAFE_METHODS:
            return True

        # Write permissions only for admin
        user = request.user
        return (
            user
            and user.is_authenticated
            and getattr(user, "role", None) == "admin"
        )