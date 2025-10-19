from django.urls import path,include
from accounts.api.auth import LogoutRedirectView, UserInfoView
from accounts.api.onboarding import CompleteOnboardingAPIView

urlpatterns = [
    # Auth & core routes
    path("logout/", LogoutRedirectView.as_view(), name="logout"),

    # User info endpoint
    path("user-info/", UserInfoView.as_view(), name="user-info"),

    path('auth/', include('dj_rest_auth.urls')),           # login/logout/password reset

    path('auth/register/', include('dj_rest_auth.registration.urls')),  # signup

    # Onboarding endpoints
    path("onboarding/complete/", CompleteOnboardingAPIView.as_view(), name="complete-onboarding"),
]
