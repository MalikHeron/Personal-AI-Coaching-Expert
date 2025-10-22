import os
from django.conf import settings
from django.contrib.auth import get_user_model
from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import login as auth_login, logout as auth_logout

User = get_user_model()


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Allow authentication using email or username.

    Handles cases where the client sends the email address in the 'username'
    field (as the frontend currently does) or provides an explicit 'email'
    field. If an email is supplied, we look up the corresponding user and
    replace the username attribute with the user's actual username so the
    underlying authenticate call succeeds.
    """

    def validate(self, attrs):
        # Normalize keys
        username_val = attrs.get('username')
        email_val = attrs.get('email')

        # If the client provided an 'email' field and not a username, find the
        # user and set attrs['username'] so parent serializer will authenticate.
        if email_val and not username_val:
            try:
                user = User.objects.get(email__iexact=email_val)
                attrs['username'] = user.get_username()
            except User.DoesNotExist:
                # leave as-is so the parent will raise an invalid credentials error
                pass

        # If the client erroneously sent the email in the username field
        # (e.g. 'user@example.com'), attempt lookup by email and rewrite
        # to the actual username for authentication.
        if username_val and '@' in username_val:
            try:
                user = User.objects.get(email__iexact=username_val)
                attrs['username'] = user.get_username()
            except User.DoesNotExist:
                # no user with that email - let parent handle the failure
                pass

        return super().validate(attrs)


def set_refresh_cookie(response, refresh_token):
    # Set HttpOnly secure cookie for refresh token
    cookie_name = os.getenv('JWT_REFRESH_COOKIE_NAME', 'refresh_token')
    secure = settings.SESSION_COOKIE_SECURE
    samesite = getattr(settings, 'SESSION_COOKIE_SAMESITE', 'Lax')
    response.set_cookie(
        cookie_name,
        refresh_token,
        httponly=True,
        secure=secure,
        samesite=samesite,
        path='/'
    )


class CookieTokenObtainPairView(TokenObtainPairView):
    permission_classes = (AllowAny,)
    serializer_class = EmailOrUsernameTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        tokens = serializer.validated_data
        refresh = tokens.get('refresh')
        access = tokens.get('access')

        user = request.user if request.user.is_authenticated else None
        # If authenticate via username/password, serializer has user
        user = getattr(serializer, 'user', user)

        # If authentication succeeded, also log the user into Django session
        # so DRF's SessionAuthentication will recognize the user on subsequent requests
        if user:
            try:
                auth_login(request, user)
            except Exception:
                # Don't fail the login flow if session login isn't possible in this environment
                pass

        data = {'access': access}
        if user:
            data['user'] = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': getattr(user, 'first_name', ''),
                'last_name': getattr(user, 'last_name', ''),
                'onboarding_completed': getattr(user, 'onboarding_completed', False)
            }

        response = Response(data)
        if refresh:
            set_refresh_cookie(response, str(refresh))
        return response


class CookieTokenRefreshView(TokenRefreshView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        # Allow refresh token in cookie if not provided in body
        cookie_name = os.getenv('JWT_REFRESH_COOKIE_NAME', 'refresh_token')
        if 'refresh' not in request.data:
            refresh_token = request.COOKIES.get(cookie_name)
            if refresh_token:
                mutable = request.data._mutable if hasattr(
                    request.data, '_mutable') else False
                try:
                    if hasattr(request.data, '_mutable'):
                        request.data._mutable = True
                    request.data['refresh'] = refresh_token
                finally:
                    if hasattr(request.data, '_mutable'):
                        request.data._mutable = mutable

        response = super().post(request, *args, **kwargs)
        # If new refresh token returned, set cookie
        if response.status_code == 200 and 'refresh' in response.data:
            set_refresh_cookie(response, response.data['refresh'])
        return response


class RegisterView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        data = request.data
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        email = data.get('email')
        username = data.get('username') or (
            email.split('@')[0] if email else '')
        password1 = data.get('password1')
        password2 = data.get('password2')

        if not first_name or not last_name or not email or not password1 or not password2:
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
        if password1 != password2:
            return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'User with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        # Create user and include optional first/last name
        user = User.objects.create_user(username=str(
            username), email=email, password=password1, first_name=first_name or '', last_name=last_name or '')

        # Issue tokens
        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)
        payload = {
            'access': access,
            'user': {
                'id': user.pk,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'onboarding_completed': getattr(user, 'onboarding_completed', False)
            }
        }
        # Issue tokens
        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)
        payload = {
            'access': access,
            'user': {
                'id': user.pk,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'onboarding_completed': getattr(user, 'onboarding_completed', False)
            }
        }
        response = Response(payload, status=status.HTTP_201_CREATED)
        set_refresh_cookie(response, str(refresh))
        return response


class LogoutView(APIView):
    """Simple logout endpoint: blacklist refresh token and clear cookie"""

    def post(self, request):
        cookie_name = os.getenv('JWT_REFRESH_COOKIE_NAME', 'refresh_token')
        refresh_token = request.COOKIES.get(cookie_name)
        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except Exception:
                pass
        # Also clear Django session authentication
        try:
            auth_logout(request)
        except Exception:
            pass
        response = Response({'message': 'logged out'},
                            status=status.HTTP_200_OK)
        response.delete_cookie(cookie_name, path='/')
        return response
