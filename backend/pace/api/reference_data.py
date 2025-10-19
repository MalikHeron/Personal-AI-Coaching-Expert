from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from pace.models import Equipment, MuscleGroup, WorkoutEnvironment, TrainingStyle
from pace.serializers import (
    EquipmentSerializer, MuscleGroupSerializer,
    WorkoutEnvironmentSerializer, TrainingStyleSerializer
)


class EquipmentListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Equipment.objects.all()
        serializer = EquipmentSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MuscleGroupListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = MuscleGroup.objects.all()
        serializer = MuscleGroupSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class WorkoutEnvironmentListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = WorkoutEnvironment.objects.all()
        serializer = WorkoutEnvironmentSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TrainingStyleListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = TrainingStyle.objects.all()
        serializer = TrainingStyleSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
