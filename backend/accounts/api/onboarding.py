from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth import get_user_model

from accounts.serializers import OnboardingCompletionSerializer

User = get_user_model()


class CompleteOnboardingAPIView(APIView):
    """
    PATCH: Mark the logged-in user's onboarding as completed.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        try:
            # Ensure idempotent completion regardless of request payload
            serializer = OnboardingCompletionSerializer(
                instance=request.user,
                data={"onboarding_completed": True},
                partial=True,
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(
                {"message": "Onboarding marked as completed.",
                    "onboarding_completed": True},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
