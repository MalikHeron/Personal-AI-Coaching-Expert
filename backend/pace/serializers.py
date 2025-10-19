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
            'fitness_goal', 'target_weight_kg', 'workout_location_preference',
            'preferred_training_style', 'available_equipment', 'created_at'
        ]
        read_only_fields = ['user', 'age', 'created_at']

    def get_age(self, obj):
        return obj.age
    


class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = ['id', 'name', 'description', 'is_bodyweight']


class TrainingStyleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingStyle
        fields = ['id', 'name', 'description']


class WorkoutEnvironmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutEnvironment
        fields = ['id', 'name', 'description']


class MuscleGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = MuscleGroup
        fields = ['id', 'name', 'description']


class ExerciseSerializer(serializers.ModelSerializer):
    muscle_group = MuscleGroupSerializer(many=True, read_only=True)
    equipment = EquipmentSerializer(many=True, read_only=True)

    class Meta:
        model = Exercise
        fields = [
            'id', 'name', 'description', 'muscle_group', 
            'difficulty_level', 'equipment', 'video_demo_url'
        ]
