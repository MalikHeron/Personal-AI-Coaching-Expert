from django.contrib import admin
from pace.models import *


@admin.register(FitnessProfile)
class FitnessProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'display_name', 'fitness_level', 'fitness_goal', 'preferred_training_style']
    search_fields = ['user__username', 'display_name']



@admin.register(TrainingStyle)
class TrainingStyleAdmin(admin.ModelAdmin): 
    list_display = ['name']
    search_fields = ['name']   


@admin.register(MuscleGroup)
class MuscleGroupAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']
    filter_horizontal = ['muscle_group']

# Inline model for WorkoutExercise in WorkoutPlan
class WorkoutExerciseInline(admin.TabularInline):
    model = WorkoutExercise
    extra = 1


@admin.register(WorkoutPlan)
class WorkoutPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'created_at', 'updated_at']
    inlines = [WorkoutExerciseInline]
    search_fields = ['name', 'user__username']


admin.register(WorkoutSession)
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
