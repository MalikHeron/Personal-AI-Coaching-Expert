from django.dispatch import receiver
from allauth.account.signals import user_signed_up
from django.dispatch import receiver
from pace.models import FitnessProfile

@receiver(user_signed_up)
def create_fitness_profile(sender, request, user, **kwargs):
    """
    Auto-create a FitnessProfile whenever a new user signs up
    (social or email/password).
    """
    FitnessProfile.objects.create(user=user)
