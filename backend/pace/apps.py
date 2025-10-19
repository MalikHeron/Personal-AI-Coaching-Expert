from django.apps import AppConfig


class PaceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'pace'

    def ready(self):
        import pace.signals  
