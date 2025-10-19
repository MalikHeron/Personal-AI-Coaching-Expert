from rest_framework import serializers
from pace.models import *


class FitnessProfileSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()

    class Meta:
        model = FitnessProfile
        fields = [
            'id', 'user', 'pronouns',
            'birthday', 'age', 'height_cm', 'weight_kg', 'body_fat_percentage',
            'goals', 'medical_conditions', 'fitness_level', 'exercise_frequency',
            'fitness_goal', 'target_weight_kg', 'gender', 'created_at'
        ]
        read_only_fields = ['user', 'age', 'created_at']

    def get_age(self, obj):
        return obj.age


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ['id', 'name', 'order', 'sets',
                  'reps', 'rest_timer']


class WorkoutPlanSerializer(serializers.ModelSerializer):
    exercises = ExerciseSerializer(many=True, read_only=True)

    class Meta:
        model = WorkoutPlan
        fields = ['id', 'name', 'description',
                  'created_at', 'updated_at', 'duration_minutes', 'difficulty_level', 'exercises']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ExerciseSetLogSerializer(serializers.ModelSerializer):
    exercise_name = serializers.CharField(
        source="exercise.name", read_only=True)

    class Meta:
        model = ExerciseSetLog
        fields = [
            "id", "exercise", "exercise_name", "set_number",
            "reps_completed", "weight_kg", "duration_seconds", "score"
        ]


class WorkoutSessionSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source="plan.name", read_only=True)
    logs = ExerciseSetLogSerializer(
        source="exercisesetlog_set", many=True, read_only=True)

    class Meta:
        model = WorkoutSession
        fields = [
            "id", "date", "plan", "plan_name", "rest_period_seconds",
            "score", "duration", "completed", "logs"
        ]


class DailyStreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyStreak
        fields = ['id', 'streak_count', 'last_active']


class FitnessAnalyticsSerializer(serializers.Serializer):
    total_workouts = serializers.IntegerField()
    total_time_trained = serializers.CharField()
    average_accuracy = serializers.FloatField()
    accuracy_over_time = serializers.ListField()
    accuracy_per_exercise = serializers.ListField()
