from django.urls import path
from accounts.api.auth import LogoutRedirectView, UserInfoView

urlpatterns = [
    # Auth & core routes
    path("logout/", LogoutRedirectView.as_view(), name="logout"),

    # User info endpoint
    path("user-info/", UserInfoView.as_view(), name="user-info"),
]
