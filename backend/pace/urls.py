from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from pace.api.profile import *
from pace.api.reference_data import *

urlpatterns = [
    # Profile endpoints
    path('profile/', ProfileAPIView.as_view(), name='fitness_profile'),
    path('profile/update/', UpdateProfileAPIView.as_view(), name='update_fitness_profile'),

    # Reference data endpoints
    path('equipment/', EquipmentListAPIView.as_view(), name='equipment_list'),
    path('muscle-group/', MuscleGroupListAPIView.as_view(), name='muscle_group_list'),
    path('environment/', WorkoutEnvironmentListAPIView.as_view(), name='environment_list'),
    path('training-style/', TrainingStyleListAPIView.as_view(), name='training_style_list'),
]
