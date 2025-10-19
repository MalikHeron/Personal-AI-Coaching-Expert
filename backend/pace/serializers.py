from rest_framework import serializers
from pace.models import *

class FitnessProfileSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()

    class Meta:
        model = FitnessProfile
        fields = [
            'id', 'user', 'display_name', 'pronouns', 'custom_pronouns',
            'birthday', 'age', 'height_cm', 'weight_kg', 'body_fat_percentage',
            'goals', 'medical_conditions', 'fitness_level', 'exercise_frequency',
            'fitness_goal', 'target_weight_kg', 'gender',
            'preferred_training_style', 'created_at'
        ]
        read_only_fields = ['user', 'age', 'created_at']

    def get_age(self, obj):
        return obj.age
    


class TrainingStyleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingStyle
        fields = ['id', 'name', 'description']


class MuscleGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = MuscleGroup
        fields = ['id', 'name', 'description']


class ExerciseSerializer(serializers.ModelSerializer):
    #muscle_group = MuscleGroupSerializer(many=True, read_only=True)

    class Meta:
        model = Exercise
        fields = [
            'id', 'name', 'description', 'video_demo_url'
        ]

class WorkoutExerciseSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer(read_only=True)

    class Meta:
        model = WorkoutExercise
        fields = ['id', 'exercise', 'order', 'sets', 'reps', 'duration_seconds', 'difficulty_level']


class WorkoutPlanSerializer(serializers.ModelSerializer):
    exercises = WorkoutExerciseSerializer(source='workoutexercise_set', many=True, read_only=True)

    class Meta:
        model = WorkoutPlan
        fields = ['id', 'name', 'description', 'exercises', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class ExerciseSetLogSerializer(serializers.ModelSerializer):
    exercise_name = serializers.CharField(source="exercise.name", read_only=True)

    class Meta:
        model = ExerciseSetLog
        fields = [
            "id", "exercise", "exercise_name", "set_number",
            "reps_completed", "weight_kg", "duration_seconds", "score"
        ]


class WorkoutSessionSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source="plan.name", read_only=True)
    logs = ExerciseSetLogSerializer(source="exercisesetlog_set", many=True, read_only=True)

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


