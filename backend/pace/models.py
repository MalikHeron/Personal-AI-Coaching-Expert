from django.db import models
from django.conf import settings
from datetime import date
from django.utils import timezone
# Create your models here.

user = settings.AUTH_USER_MODEL

class WorkoutEnvironment(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name
    
class TrainingStyle(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name  

class Equipment(models.Model):
    """
    Represents a type of exercise equipment.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    is_bodyweight = models.BooleanField(default=False)

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
        ("female","Female")
    ]


    user = models.OneToOneField(user, on_delete=models.CASCADE)
    display_name = models.CharField(max_length=100, blank=True, null=True)
    pronouns = models.CharField(max_length=30, choices=PRONOUN_CHOICES, blank=True, null=True)
    custom_pronouns = models.CharField(max_length=50, blank=True, null=True)
    birthday = models.DateField(null=True, blank=True)
    height_cm = models.FloatField(null=True, blank=True)
    gender = models.CharField(max_length=10, blank=True, null=True, choices=GENDER_CHOICES)
    weight_kg = models.FloatField(null=True, blank=True)

    body_fat_percentage = models.FloatField(null=True, blank=True)
    goals = models.TextField(blank=True, null=True)
    medical_conditions = models.TextField(blank=True, null=True, help_text="Any relevant medical conditions or injuries")

    fitness_level = models.CharField(max_length=20, choices=FITNESS_LEVEL_CHOICES, blank=True, null=True)
    exercise_frequency = models.IntegerField(blank=True, null=True)
    fitness_goal = models.CharField(max_length=30, choices=FITNESS_GOAL_CHOICES, blank=True, null=True)
    target_weight_kg = models.FloatField(blank=True, null=True)
    workout_location_preference = models.ManyToManyField(WorkoutEnvironment, blank=True)
    preferred_training_style = models.ForeignKey(TrainingStyle, on_delete=models.SET_NULL, null=True, blank=True)
    available_equipment = models.ManyToManyField(Equipment, blank=True)
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
    

