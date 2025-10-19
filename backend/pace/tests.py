from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from datetime import date
from pace.models import *

User = get_user_model()


class BaseTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="password")
        self.client.force_authenticate(user=self.user)

        # Create related objects
        self.equipment = Equipment.objects.create(name="Dumbbell")
        self.environment = WorkoutEnvironment.objects.create(name="Gym")
        self.training_style = TrainingStyle.objects.create(name="Strength")
        self.muscle_group = MuscleGroup.objects.create(name="Chest")
        self.exercise = Exercise.objects.create(
            name="Push-up",
            Training_style=self.training_style,
        )
        self.exercise.muscle_group.add(self.muscle_group)


# -------------------------
# FitnessProfile Tests
# -------------------------
class FitnessProfileTests(BaseTestCase):
    def test_create_profile(self):
        profile = FitnessProfile.objects.create(user=self.user, display_name="Tester", birthday=date(2000, 1, 1))
        self.assertEqual(profile.user.username, "testuser")
        self.assertEqual(profile.display_name, "Tester")

    def test_age_property_calculation(self):
        profile = FitnessProfile.objects.create(user=self.user, birthday=date(2000, 1, 1))
        today = timezone.localdate()
        expected_age = today.year - 2000
        if today.month < 1 or (today.month == 1 and today.day < 1):
            expected_age -= 1
        self.assertEqual(profile.age, expected_age)
