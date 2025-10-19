from django.contrib import admin
from pace.models import *


@admin.register(FitnessProfile)
class FitnessProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'display_name', 'fitness_level', 'fitness_goal', 'preferred_training_style']
    search_fields = ['user__username', 'display_name']


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_bodyweight']
    search_fields = ['name']


@admin.register(WorkoutEnvironment)
class WorkoutEnvironmentAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(TrainingStyle)
class TrainingStyleAdmin(admin.ModelAdmin): 
    list_display = ['name']
    search_fields = ['name']   
