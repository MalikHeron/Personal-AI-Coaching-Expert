from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class CompleteOnboardingAPIView(APIView):
    """
    PATCH: Mark the logged-in user's onboarding as completed.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        if user.onboarding_completed:
            return Response(
                {"detail": "Onboarding already completed."},
                status=status.HTTP_200_OK
            )
        
        user.onboarding_completed = True
        user.save()
        return Response(
            {"detail": "Onboarding marked as completed."},
            status=status.HTTP_200_OK
        )
