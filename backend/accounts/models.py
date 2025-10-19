# from django.contrib.auth.models import AbstractUser, Group
from django.db import models


# class CustomUser(AbstractUser):
#     email = models.EmailField(unique=True)
#     is_active = models.BooleanField(default=True)
#     is_staff = models.BooleanField(default=False)
#     groups = models.ManyToManyField(
#         Group,
#         verbose_name='groups',
#         blank=True,
#         help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
#         related_name='user_set',
#         related_query_name='user',
#     )

#     USERNAME_FIELD = 'email'
#     REQUIRED_FIELDS = []

#     def __str__(self):
#         return self.email
