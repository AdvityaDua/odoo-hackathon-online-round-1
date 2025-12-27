from django.db import models
from core.models import Department
from django.contrib.auth.models import AbstractUser, BaseUserManager

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user


ROLE_CHOICES = [
    ('admin', 'Admin'),
    ('technician', 'Technician'),
    ('user', 'User'),
]

class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    
    objects = CustomUserManager()
    USERNAME_FIELD = 'email'
    
    REQUIRED_FIELDS = []
    
    def __str__(self):
        return self.email