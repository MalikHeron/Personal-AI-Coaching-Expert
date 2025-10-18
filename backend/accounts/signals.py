from allauth.socialaccount.signals import social_account_added, social_account_updated
from allauth.socialaccount.models import SocialToken
from django.dispatch import receiver
import requests
import os
import logging
from django.conf import settings


@receiver([social_account_added, social_account_updated])
def fetch_social_profile_photo(request, sociallogin, **kwargs):
    logger = logging.getLogger(__name__)
    user_id = sociallogin.account.user.id
    folder = "profile_photos"
    # Ensure the profile_photos folder exists
    profile_photos_path = os.path.join(settings.MEDIA_ROOT, folder)
    os.makedirs(profile_photos_path, exist_ok=True)
    filename = f"profile_photo_{user_id}.jpg"
    media_path = os.path.join(profile_photos_path, filename)
    provider = sociallogin.account.provider
    image_url = None

    if provider == "microsoft":
        token = SocialToken.objects.filter(account=sociallogin.account).first()
        if token:
            headers = {
                "Authorization": f"Bearer {token.token}",
                "Accept": "application/json"
            }
            photo_url = "https://graph.microsoft.com/v1.0/me/photo/$value"
            response = requests.get(photo_url, headers=headers)
            logger.info(
                f"Microsoft profile photo fetch status: {response.status_code}")
            if response.status_code == 200:
                with open(media_path, "wb") as f:
                    f.write(response.content)
                image_url = f"{settings.MEDIA_URL}{folder}/{filename}"
            else:
                logger.warning(
                    f"Failed to fetch Microsoft profile photo for user {user_id}: {response.status_code} - {response.text}")
    elif provider == "google":
        # Google photo URL is in extra_data
        google_photo_url = sociallogin.account.extra_data.get("picture")
        if google_photo_url:
            try:
                response = requests.get(google_photo_url)
                if response.status_code == 200:
                    with open(media_path, "wb") as f:
                        f.write(response.content)
                    image_url = f"{settings.MEDIA_URL}{folder}/{filename}"
                    logger.info(
                        f"Downloaded Google profile photo for user {user_id}")
                else:
                    logger.warning(
                        f"Failed to download Google profile photo for user {user_id}: {response.status_code}")
            except Exception as e:
                logger.error(
                    f"Error downloading Google profile photo for user {user_id}: {e}")

    # Save the local image URL in extra_data if downloaded
    if image_url:
        sociallogin.account.extra_data["picture"] = image_url
        sociallogin.account.save()
