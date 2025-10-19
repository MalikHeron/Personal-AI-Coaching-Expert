from django.db import models
from django.conf import settings
from datetime import date
from django.utils import timezone

user = settings.AUTH_USER_MODEL


class TrainingStyle(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class FitnessProfile(models.Model):
    """
    Onboarding & fitness-specific data (separate from identity).
    One-to-one with accounts.User.

    """
    FITNESS_LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    FITNESS_GOAL_CHOICES = [
        ("weight_loss", "Weight Loss"),
        ("muscle_gain", "Muscle Gain"),
        ("endurance", "Endurance"),
        ("flexibility", "Flexibility"),
        ("maintenance", "Maintenance"),
    ]

    PRONOUN_CHOICES = [
        ("he/him", "He/Him"),
        ("she/her", "She/Her"),
        ("they/them", "They/Them"),
        ("he/they", "He/They"),
        ("she/they", "She/They"),
        ("ze/hir", "Ze/Hir"),
        ("prefer_not_to_say", "Prefer not to say"),
        ("custom", "Custom"),
    ]

    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female")
    ]

    user = models.OneToOneField(user, on_delete=models.CASCADE)
    display_name = models.CharField(max_length=100, blank=True, null=True)
    pronouns = models.CharField(
        max_length=30, choices=PRONOUN_CHOICES, blank=True, null=True)
    custom_pronouns = models.CharField(max_length=50, blank=True, null=True)
    birthday = models.DateField(null=True, blank=True)
    height_cm = models.FloatField(null=True, blank=True)
    gender = models.CharField(
        max_length=10, blank=True, null=True, choices=GENDER_CHOICES)
    weight_kg = models.FloatField(null=True, blank=True)

    body_fat_percentage = models.FloatField(null=True, blank=True)
    goals = models.TextField(blank=True, null=True)
    medical_conditions = models.TextField(
        blank=True, null=True, help_text="Any relevant medical conditions or injuries")

    fitness_level = models.CharField(
        max_length=20, choices=FITNESS_LEVEL_CHOICES, blank=True, null=True)
    exercise_frequency = models.IntegerField(blank=True, null=True)
    fitness_goal = models.CharField(
        max_length=30, choices=FITNESS_GOAL_CHOICES, blank=True, null=True)
    target_weight_kg = models.FloatField(blank=True, null=True)
    preferred_training_style = models.ForeignKey(
        TrainingStyle, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def age(self):
        """Dynamically calculate age from birthday."""
        if not self.birthday:
            return None
        today = date.today()
        return today.year - self.birthday.year - (
            (today.month, today.day) < (self.birthday.month, self.birthday.day)
        )

    def __str__(self):
        return f"FitnessProfile of {self.user.username}"


class MuscleGroup(models.Model):
    """
    Represents a muscle group targeted by exercises.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class Exercise(models.Model):
    """
    Represents an exercise with its details.
    """
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    muscle_group = models.ManyToManyField(MuscleGroup, blank=True)
    video_demo_url = models.URLField(blank=True, null=True)
    Training_style = models.ForeignKey(
        TrainingStyle, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.name


class WorkoutPlan(models.Model):
    """
    A workout plan consisting of multiple exercises.
    """
    user = models.ForeignKey(user, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    exercises = models.ManyToManyField(Exercise, through='WorkoutExercise')
    training_style = models.ForeignKey(
        TrainingStyle, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.name} for {self.user.username}"


class WorkoutExercise(models.Model):
    """
    Through model to associate exercises with a workout plan, including order and reps/sets.
    """
    DIFFICULTY_LEVEL_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    workout_plan = models.ForeignKey(WorkoutPlan, on_delete=models.CASCADE)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(
        help_text="Order of the exercise in the workout")
    sets = models.PositiveIntegerField(null=True, blank=True)
    reps = models.PositiveIntegerField(null=True, blank=True)
    duration_seconds = models.PositiveIntegerField(
        null=True, blank=True, help_text="Duration in seconds if applicable")
    difficulty_level = models.CharField(
        max_length=10, choices=DIFFICULTY_LEVEL_CHOICES, blank=True, null=True)

    class Meta:
        unique_together = ('workout_plan', 'exercise', 'order')
        ordering = ['order']

    def __str__(self):
        return f"{self.exercise.name} in {self.workout_plan.name} (Order: {self.order})"


class WorkoutSession(models.Model):
    """
    A user's actual workout session (tracks performance).
    """
    user = models.ForeignKey(user, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    plan = models.ForeignKey(
        WorkoutPlan, on_delete=models.SET_NULL, null=True, blank=True)
    rest_period_seconds = models.PositiveIntegerField(null=True, blank=True)

    score = models.FloatField(null=True, blank=True)  # AI form score
    duration = models.DurationField(null=True, blank=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Session {self.date} - {self.user.username}"


class ExerciseSetLog(models.Model):
    session = models.ForeignKey(WorkoutSession, on_delete=models.CASCADE)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    set_number = models.PositiveIntegerField()
    reps_completed = models.PositiveIntegerField(null=True, blank=True)
    weight_kg = models.FloatField(null=True, blank=True)
    duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)

    class Meta:
        unique_together = ('session', 'exercise', 'set_number')
        ordering = ['session', 'exercise', 'set_number']

    def clean(self):
        """Ensure exercise belongs to the plan tied to the session."""
        if self.session.plan:
            plan_exercises = self.session.plan.exercises.all()
            if self.exercise not in plan_exercises:
                from django.core.exceptions import ValidationError
                raise ValidationError(
                    f"Exercise '{self.exercise.name}' is not part of the workout plan '{self.session.plan.name}'.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.exercise.name} - Set {self.set_number}"


class DailyStreak(models.Model):
    user = models.OneToOneField(user, on_delete=models.CASCADE)
    streak_count = models.PositiveIntegerField(default=0)
    last_active = models.DateField(null=True, blank=True)

    def update_streak(self):
        today = timezone.localdate()
        if self.last_active == today:
            # Already updated today
            return
        elif self.last_active == today - timezone.timedelta(days=1):
            # Consecutive day
            self.streak_count += 1
        else:
            # Streak broken
            self.streak_count = 1
        self.last_active = today
        self.save()

    def __str__(self):
        return f"{self.user.username} - {self.streak_count} day streak"
