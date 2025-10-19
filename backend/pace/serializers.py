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
