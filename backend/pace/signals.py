from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from pace.models import FitnessProfile, ExerciseSetLog, WorkoutSession, DailyStreak 

# Works for all CustomUser creations (manual, admin, scripts)
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_fitness_profile_for_user(sender, instance, created, **kwargs):
    # Only create a profile for newly created users
    if created and not getattr(instance, '_deleting', False):
        # Avoid duplicates
        if not hasattr(instance, 'fitnessprofile'):
            FitnessProfile.objects.create(user=instance)


@receiver(post_save, sender=ExerciseSetLog)
def mark_session_completed(sender, instance, **kwargs):
    session = instance.session
    plan = session.plan

    if not plan:
        return  # No plan linked, cannot auto-complete

    # Get all exercise IDs in the plan
    plan_exercise_ids = list(plan.exercises.values_list("id", flat=True))

    # Check if all exercises in the plan have at least one set logged
    logged_exercise_ids = list(
        ExerciseSetLog.objects.filter(session=session)
        .values_list("exercise_id", flat=True)
        .distinct()
    )

    if set(plan_exercise_ids).issubset(set(logged_exercise_ids)):
        # All exercises have been logged → mark session completed
        if not session.completed:
            session.completed = True
            session.save()


@receiver(post_save, sender=WorkoutSession)
def update_daily_streak(sender, instance, created, **kwargs):
    """
    Update user's streak when a session is completed.
    """
    if instance.completed:
        streak, _ = DailyStreak.objects.get_or_create(user=instance.user)
        streak.update_streak()
