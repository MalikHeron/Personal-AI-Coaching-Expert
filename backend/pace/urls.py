from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from pace.api.profile import *

urlpatterns = [
    # Profile endpoints
    path('profile/', ProfileAPIView.as_view(), name='fitness_profile'),
    path('profile/update/', UpdateProfileAPIView.as_view(), name='update_fitness_profile'),
]
