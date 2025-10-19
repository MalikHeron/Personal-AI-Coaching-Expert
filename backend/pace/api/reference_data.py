from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from pace.models import MuscleGroup, TrainingStyle
from pace.serializers import (
    MuscleGroupSerializer, TrainingStyleSerializer
)


class MuscleGroupListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = MuscleGroup.objects.all()
        serializer = MuscleGroupSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TrainingStyleListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = TrainingStyle.objects.all()
        serializer = TrainingStyleSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
