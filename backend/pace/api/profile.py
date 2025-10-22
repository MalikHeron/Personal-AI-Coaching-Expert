from pace.serializers import FitnessProfileSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from pace.models import FitnessProfile

class ProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve the logged-in user's fitness profile info.
        """
        try:
            profile = FitnessProfile.objects.get(user=request.user)
        except FitnessProfile.DoesNotExist:
            return Response({"error": "Fitness profile not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = FitnessProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UpdateProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        """
        Update the logged-in user's fitness profile info.
        """
        try:
            profile = FitnessProfile.objects.get(user=request.user)
        except FitnessProfile.DoesNotExist:
            return Response({"error": "Fitness profile not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = FitnessProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
 