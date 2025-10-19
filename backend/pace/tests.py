from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from datetime import date

from pace.models import (
    FitnessProfile,
    WorkoutPlan,
    WorkoutExercise,
    WorkoutSession,
    Exercise,
    ExerciseSetLog,
    DailyStreak,
    TrainingStyle,
    MuscleGroup
)

User = get_user_model()


class BaseTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="password")
        self.client.force_authenticate(user=self.user)

        # Create related objects
        self.training_style = TrainingStyle.objects.create(name="Strength")
        self.muscle_group = MuscleGroup.objects.create(name="Chest")
        self.exercise = Exercise.objects.create(
            name="Push-up",
            Training_style=self.training_style,
        )
        self.exercise.muscle_group.add(self.muscle_group)
        self.plan = WorkoutPlan.objects.create(user=self.user, name="Test Plan", training_style=self.training_style)
        self.workout_exercise = WorkoutExercise.objects.create(
            workout_plan=self.plan,
            exercise=self.exercise,
            order=1,
            sets=3,
            reps=10
        )


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


# -------------------------
# WorkoutSession & Set Logs Tests
# -------------------------
class WorkoutSessionTests(BaseTestCase):
    def test_create_session(self):
        session = WorkoutSession.objects.create(user=self.user, plan=self.plan, rest_period_seconds=60)
        self.assertEqual(session.plan, self.plan)
        self.assertEqual(session.completed, False)

    def test_create_set_log_valid(self):
        session = WorkoutSession.objects.create(user=self.user, plan=self.plan)
        log = ExerciseSetLog.objects.create(session=session, exercise=self.exercise, set_number=1, reps_completed=10)
        self.assertEqual(log.exercise, self.exercise)

    def test_create_set_log_invalid_exercise(self):
        session = WorkoutSession.objects.create(user=self.user, plan=self.plan)
        other_exercise = Exercise.objects.create(name="Squat")
        from django.core.exceptions import ValidationError
        log = ExerciseSetLog(session=session, exercise=other_exercise, set_number=1, reps_completed=10)
        with self.assertRaises(ValidationError):
            log.full_clean()  # triggers validation


# -------------------------
# DailyStreak Tests
# -------------------------
class DailyStreakTests(BaseTestCase):
    def test_streak_increment(self):
        streak = DailyStreak.objects.get_or_create(user=self.user, streak_count=2, last_active=timezone.localdate() - timedelta(days=1))
        streak.update_streak()
        self.assertEqual(streak.streak_count, 3)

    def test_streak_reset(self):
        streak = DailyStreak.objects.create(user=self.user, streak_count=5, last_active=timezone.localdate() - timedelta(days=3))
        streak.update_streak()
        self.assertEqual(streak.streak_count, 1)

    def test_streak_no_double_increment(self):
        streak = DailyStreak.objects.create(user=self.user, streak_count=4, last_active=timezone.localdate())
        streak.update_streak()
        self.assertEqual(streak.streak_count, 4)


# -------------------------
# WorkoutSession API Tests
# -------------------------
class WorkoutSessionAPITests(BaseTestCase):
    def test_create_session_api(self):
        response = self.client.post("/api/pace/sessions/", {"plan_id": self.plan.id, "rest_period_seconds": 60})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["plan"], self.plan.id)

    def test_create_set_log_api(self):
        session = WorkoutSession.objects.create(user=self.user, plan=self.plan)
        data = {
            "sets": [
                {"exercise_id": self.exercise.id, "set_number": 1, "reps_completed": 10}
            ]
        }
        response = self.client.post(f"/api/pace/sessions/{session.id}/logs/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["exercise"], self.exercise.id)


# -------------------------
# ExerciseSetLog Detail API Tests (PATCH & DELETE)
# -------------------------
class ExerciseSetLogDetailAPITests(BaseTestCase):
    def setUp(self):
        super().setUp()
        self.session = WorkoutSession.objects.create(user=self.user, plan=self.plan)
        self.log = ExerciseSetLog.objects.create(
            session=self.session, exercise=self.exercise, set_number=1, reps_completed=10
        )

    def test_patch_set_log(self):
        data = {"reps_completed": 12, "weight_kg": 20}
        response = self.client.patch(f"/api/pace/logs/{self.log.id}/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.log.refresh_from_db()
        self.assertEqual(self.log.reps_completed, 12)
        self.assertEqual(self.log.weight_kg, 20)

    def test_delete_set_log(self):
        response = self.client.delete(f"/api/pace/logs/{self.log.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        with self.assertRaises(ExerciseSetLog.DoesNotExist):
            ExerciseSetLog.objects.get(id=self.log.id)

    def test_patch_invalid_log(self):
        response = self.client.patch("/api/pace/logs/9999/", {"reps_completed": 5}, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_invalid_log(self):
        response = self.client.delete("/api/pace/logs/9999/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


# -------------------------
# UpdateProfile API Tests
# -------------------------
class UpdateProfileAPITests(BaseTestCase):
    def test_put_update_profile(self):
        # Create initial profile
        profile = FitnessProfile.objects.create(user=self.user, display_name="Old Name", fitness_goal="weight_loss")
        data = {
            "display_name": "New Name",
            "fitness_goal": "muscle_gain",
            "height_cm": 180,
            "weight_kg": 75
        }
        response = self.client.put("/api/pace/profile/update/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        profile.refresh_from_db()
        self.assertEqual(profile.display_name, "New Name")
        self.assertEqual(profile.fitness_goal, "muscle_gain")
        self.assertEqual(profile.height_cm, 180)
        self.assertEqual(profile.weight_kg, 75)

    def test_put_partial_update_profile(self):
        profile = FitnessProfile.objects.create(user=self.user, display_name="Partial Name")
        data = {"display_name": "Updated Partial"}
        response = self.client.put("/api/pace/profile/update/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        profile.refresh_from_db()
        self.assertEqual(profile.display_name, "Updated Partial")

    # def test_put_invalid_profile(self):
    #     data = {"height_cm": -10}  # Invalid height
    #     response = self.client.put("/api/pace/profile/update/", data, format="json")
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST) 



# -------------------------
# WorkoutSession API Tests
# -------------------------
class WorkoutSessionAPITests(BaseTestCase):
    def setUp(self):
        super().setUp()
        # Ensure the user has a plan
        self.plan = WorkoutPlan.objects.create(user=self.user, name="Test Plan")
        self.exercise1 = Exercise.objects.create(name="Push Up")
        self.exercise2 = Exercise.objects.create(name="Squat")
        # Add exercises to plan through WorkoutExercise
        WorkoutExercise.objects.create(workout_plan=self.plan, exercise=self.exercise1, order=1, sets=3, reps=10)
        WorkoutExercise.objects.create(workout_plan=self.plan, exercise=self.exercise2, order=2, sets=3, reps=15)

    def test_create_workout_session(self):
        data = {"plan_id": self.plan.id, "rest_period_seconds": 60}
        response = self.client.post("/api/pace/sessions/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(WorkoutSession.objects.filter(user=self.user).count(), 1)
        session = WorkoutSession.objects.get(user=self.user)
        self.assertEqual(session.plan, self.plan)
        self.assertEqual(session.rest_period_seconds, 60)

    def test_create_workout_session_invalid_plan(self):
        data = {"plan_id": 999}
        response = self.client.post("/api/pace/sessions/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


# -------------------------
# ExerciseSetLog List/Create API Tests
# -------------------------
class ExerciseSetLogListCreateAPITests(BaseTestCase):
    def setUp(self):
        super().setUp()
        self.plan = WorkoutPlan.objects.create(user=self.user, name="Test Plan")
        self.exercise1 = Exercise.objects.create(name="Push Up")
        self.exercise2 = Exercise.objects.create(name="Squat")
        WorkoutExercise.objects.create(workout_plan=self.plan, exercise=self.exercise1, order=1, sets=3, reps=10)
        WorkoutExercise.objects.create(workout_plan=self.plan, exercise=self.exercise2, order=2, sets=3, reps=15)
        self.session = WorkoutSession.objects.create(user=self.user, plan=self.plan)

    def test_create_multiple_set_logs(self):
        payload = {
            "sets": [
                {"exercise_id": self.exercise1.id, "set_number": 1, "reps_completed": 10, "weight_kg": 0},
                {"exercise_id": self.exercise1.id, "set_number": 2, "reps_completed": 10, "weight_kg": 0},
                {"exercise_id": self.exercise2.id, "set_number": 1, "reps_completed": 15, "weight_kg": 0},
            ]
        }
        response = self.client.post(f"/api/pace/sessions/{self.session.id}/logs/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ExerciseSetLog.objects.filter(session=self.session).count(), 3)

    def test_create_set_log_invalid_exercise(self):
        payload = {
            "sets": [
                {"exercise_id": 999, "set_number": 1, "reps_completed": 10}
            ]
        }
        response = self.client.post(f"/api/pace/sessions/{self.session.id}/logs/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_set_logs_for_session(self):
        # Create a log
        log = ExerciseSetLog.objects.create(session=self.session, exercise=self.exercise1, set_number=1, reps_completed=10)
        response = self.client.get(f"/api/pace/sessions/{self.session.id}/logs/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["reps_completed"], 10)
