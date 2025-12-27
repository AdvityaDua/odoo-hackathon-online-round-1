from rest_framework import serializers
from django.conf import settings
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'role']

    def validate(self, data):
        role = data.get('role')
        admin_secret = data.get('admin_secret')

        if role == 'admin':
            if not admin_secret:
                raise serializers.ValidationError(
                    {"admin_secret": "Admin secret is required."}
                )
            if admin_secret != settings.ADMIN_SECRET_KEY:
                raise serializers.ValidationError(
                    {"admin_secret": "Invalid admin secret."}
                )

        return data

    def create(self, validated_data):
        validated_data.pop('admin_secret', None)
        password = validated_data.pop('password')

        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'department']
        