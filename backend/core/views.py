from rest_framework.views import APIView, Response, status
from .serializers import DepartmentSerializer
from rest_framework.permissions import AllowAny

class DepartmentView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        departments = [
            {"id": 1, "name": "Human Resources"},
            {"id": 2, "name": "Engineering"},
            {"id": 3, "name": "Marketing"},
        ]
        return Response(departments, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = DepartmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)