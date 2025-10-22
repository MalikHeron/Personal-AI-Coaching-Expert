from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


def associate_existing_user_by_email(strategy, details, user=None, *args, **kwargs):
    """If a user with the same email exists, return it to the pipeline so
    social-auth will associate with that user instead of creating a new one.
    Returns {'user': user} when found, otherwise None.
    """
    if user:
        return None

    email = details.get('email')
    if not email:
        return None

    try:
        existing = User.objects.filter(email__iexact=email).first()
        if existing:
            logger.debug(
                f"Associating social account with existing user id={existing.pk} email={email}")
            return {'user': existing}
    except Exception as e:
        logger.exception(
            "Error looking up existing user by email in social pipeline")
    return None


def create_or_get_user(strategy, details, backend, user=None, *args, **kwargs):
    """Ensure we don't create a duplicate user during social pipeline.

    If a user is already present in the pipeline, return it. Otherwise,
    try to find an existing user by email and return that. If none exists,
    create a new user using the usual Django create_user helper.
    """
    try:
        if user:
            return {'user': user}

        email = details.get('email')
        username = details.get('username') or (
            email.split('@')[0] if email else None)

        if email:
            existing = User.objects.filter(email__iexact=email).first()
            if existing:
                logger.debug(
                    f"create_or_get_user: found existing user id={existing.pk} email={email}")
                return {'user': existing}

        # No existing user found — create one in a defensive way
        if not username:
            # fallback to a random-ish username to satisfy unique constraint
            username = strategy.storage.user.get_username(details) if hasattr(
                strategy, 'storage') else (email or 'user')

        new_user = User.objects.create_user(username=str(
            username), email=email or '', password=None)
        logger.info(
            f"create_or_get_user: created new user id={new_user.pk} email={new_user.email}")
        return {'user': new_user}
    except Exception:
        logger.exception("Error in create_or_get_user pipeline step")
        return None
