from rest_framework import serializers
from .models import CustomUser


class OnboardingCompletionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['onboarding_completed']
