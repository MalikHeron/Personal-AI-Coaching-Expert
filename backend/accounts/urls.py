from django.urls import path, include
from accounts.api.auth import LogoutRedirectView, UserInfoView
from accounts.api.onboarding import CompleteOnboardingAPIView
from accounts.api.jwt_views import (
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    RegisterView,
    LogoutView,
)

urlpatterns = [
    # Auth & core routes
    path("logout/", LogoutRedirectView.as_view(), name="logout"),

    # User info endpoint
    path("user-info/", UserInfoView.as_view(), name="user-info"),

    # JWT token endpoints (cookie-friendly)
    path('auth/token/', CookieTokenObtainPairView.as_view(),
         name='token_obtain_pair'),
    path('auth/token/refresh/',
         CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/logout/', LogoutView.as_view(), name='jwt_logout'),

    # Onboarding endpoints
    path("onboarding/complete/", CompleteOnboardingAPIView.as_view(),
         name="complete-onboarding"),
]
