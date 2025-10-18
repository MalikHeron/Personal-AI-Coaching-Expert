from allauth.socialaccount.models import SocialAccount
import logging
from django.conf import settings
from django.contrib.auth import get_user_model, logout as auth_logout
from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


logger = logging.getLogger(__name__)
User = get_user_model()


class LogoutRedirectView(APIView):
    def get(self, request):
        user = request.user
        # Check if user has a Microsoft or Google social account
        from allauth.socialaccount.models import SocialAccount
        social = SocialAccount.objects.filter(user=user).first()
        auth_logout(request)
        frontend_url = settings.MICROSOFT_AUTH.get("FRONTEND_URL", "/")
        if social:
            if social.provider == "microsoft":
                microsoft_logout_url = f"{settings.MICROSOFT_AUTH['AUTHORITY']}/oauth2/v2.0/logout"
                return redirect(f"{microsoft_logout_url}?post_logout_redirect_uri={frontend_url}?clearSession=true")
            elif social.provider == "google":
                # Google logout is client-side, but redirect to frontend with a flag to clear Google session
                return redirect(f"{frontend_url}?clearSession=true&provider=google")
        # Default: regular Django logout
        return redirect(f"{frontend_url}?clearSession=true")


class UserInfoView(APIView):
    """
    API view that returns authenticated user's profile information.

    Retrieves basic user details such as ID, username, email, first name, and last name.
    If the user has a linked Google social account, includes additional Google profile data
    (name, email, picture, locale) in the response.

    Permissions:
        - Requires the user to be authenticated.

    Methods:
        get(request): Returns a JSON response containing user information.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": getattr(user, "first_name", ""),
            "last_name": getattr(user, "last_name", ""),
            "social_profiles": {}
        }
        social_accounts = SocialAccount.objects.filter(user=user)
        for social in social_accounts:
            provider = social.provider
            provider_data = {
                "picture": social.extra_data.get("picture"),
                "locale": social.extra_data.get("locale"),
            }
            data["social_profiles"][provider] = provider_data
        return Response(data)
