from django.contrib import admin
from pace.models import *


@admin.register(FitnessProfile)
class FitnessProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'fitness_level', 'fitness_goal']
    search_fields = ['user__username']


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']

@admin.register(WorkoutPlan)
class WorkoutPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'created_at', 'updated_at']
    search_fields = ['name', 'user__username']


@admin.register(WorkoutSession)
class WorkoutSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'plan', 'score', 'completed']
    search_fields = ['user__username', 'plan__name']


@admin.register(ExerciseSetLog)
class ExerciseSetLogAdmin(admin.ModelAdmin):
    list_display = ['session', 'exercise', 'set_number', 'reps_completed', 'weight_kg']
    search_fields = ['exercise__name', 'session__user__username']


@admin.register(DailyStreak)
class DailyStreakAdmin(admin.ModelAdmin):
    list_display = ['user', 'streak_count', 'last_active']
    search_fields = ['user__username']
