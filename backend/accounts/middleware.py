import threading
from threading import local

_thread_locals = local()
_user = threading.local()


def get_current_thread_user():
    """Get current user from thread local storage"""
    return getattr(_thread_locals, 'user', None)


def set_current_user(user):
    """Set current user in thread local storage"""
    _thread_locals.user = user


def get_current_user():
    return getattr(_user, 'value', get_current_thread_user())


class CurrentUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        _user.value = request.user
        response = self.get_response(request)
        return response
