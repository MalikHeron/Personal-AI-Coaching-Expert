from django.urls import path
from pace.api.profile import *
from pace.api.workout_plan import *
from pace.api.workout_plan import *
from pace.api.workout_log import *
from pace.api.analytics import *

urlpatterns = [
    # Profile endpoints
    path('profile/', ProfileAPIView.as_view(), name='fitness_profile'),
    path('profile/update/', UpdateProfileAPIView.as_view(), name='update_fitness_profile'),

    # Workout plan endpoints
    path("plans/", WorkoutPlanListCreateAPIView.as_view(), name="workoutplan-list-create"),
    path("plans/<int:pk>/", WorkoutPlanDetailAPIView.as_view(), name="workoutplan-detail"),
    path("plans/<int:plan_id>/exercises/", WorkoutPlanExerciseAPIView.as_view(), name="plan-add-exercises"),
    path("plans/<int:plan_id>/exercises/<int:exercise_id>/", WorkoutPlanExerciseAPIView.as_view(), name="plan-remove-exercise"),

    # Workout session endpoints
    path("sessions/", WorkoutSessionListCreateAPIView.as_view(), name="session-list-create"),
    path("sessions/<int:session_id>/", WorkoutSessionDetailAPIView.as_view(), name="session-detail"),

    # Workout session logs endpoints
    path("sessions/<int:session_id>/logs/", ExerciseSetLogListCreateAPIView.as_view(), name="session-log-list-create"),
    path("sessions/<int:session_id>/logs/<int:log_id>/", ExerciseSetLogDetailAPIView.as_view(), name="session-log-detail"),

    # Dashboard analytics endpoints
    path("analytics/", FitnessAnalyticsAPIView.as_view(), name="fitness-summary"),
]
