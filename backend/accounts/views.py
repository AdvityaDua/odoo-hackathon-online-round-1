from rest_framework.views import APIView, Response, status
from .serializers import RegisterSerializer, UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {"message": "User registered successfully."},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        username = request.data.get("email")
        password = request.data.get("password")
        
        if not username or not password:
            return Response(
                {"error": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = User.objects.filter(email=username).first()
        if user is None:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not user.check_password(password):
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        serializer = UserSerializer(user)
        token = RefreshToken.for_user(user)
        response = Response(
            {
                "message": "Login successful.",
                "access": str(token.access_token),
                "user" : serializer.data,
            },
            status=status.HTTP_200_OK,
        )
        
        response.set_cookie(
            key="refresh",
            value=str(token),
            httponly=True,
            samesite='None',
            secure=True,
        )
        return response


class RefreshTokenView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh")
        if not refresh_token:
            return Response(
                {"error": "Refresh token not provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            access_token = str(token.access_token)
            user = User.objects.get(id=token['user_id'])
            serializer = UserSerializer(user)
            return Response(
                {"access": access_token,
                 "user": serializer.data
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"error": "Invalid refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

class LogoutView(APIView):
    def post(self, request):
        response = Response(
            {"message": "Logout successful."},
            status=status.HTTP_200_OK,
        )
        response.delete_cookie("refresh")
        return response