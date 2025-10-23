from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Sum, Count
from pace.models import WorkoutSession, ExerciseSetLog, WorkoutPlan, Exercise
from django.db import IntegrityError
from pace.serializers import WorkoutSessionSerializer, ExerciseSetLogSerializer
from django.utils import timezone


class WorkoutSessionListCreateAPIView(APIView):
    """
    List all sessions for the logged-in user, or create a new session.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = WorkoutSession.objects.filter(user=request.user).order_by("-date")
        serializer = WorkoutSessionSerializer(sessions, many=True)
        return Response(serializer.data)

    def post(self, request):
        plan_id = request.data.get("plan_id")
        rest_period = request.data.get("rest_period_seconds")

        if not plan_id:
            return Response({"detail": "plan_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            plan = WorkoutPlan.objects.get(id=plan_id, user=request.user)
        except WorkoutPlan.DoesNotExist:
            return Response({"detail": "Workout plan not found."}, status=status.HTTP_404_NOT_FOUND)

        session = WorkoutSession.objects.create(
            user=request.user,
            plan=plan,
            rest_period_seconds=rest_period
        )

        serializer = WorkoutSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class WorkoutSessionDetailAPIView(APIView):
    """
    Retrieve, update (PATCH), or delete a specific session.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, session_id):
        try:
            return WorkoutSession.objects.get(id=session_id, user=self.request.user)
        except WorkoutSession.DoesNotExist:
            return None

    def get(self, request, session_id):
        session = self.get_object(session_id)
        if not session:
            return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = WorkoutSessionSerializer(session)
        return Response(serializer.data)

    def patch(self, request, session_id):
        session = self.get_object(session_id)
        if not session:
            return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = WorkoutSessionSerializer(session, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, session_id):
        session = self.get_object(session_id)
        if not session:
            return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)
        session.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)




class ExerciseSetLogListCreateAPIView(APIView):
    """
    List all set logs for a session, or create new logs.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        try:
            session = WorkoutSession.objects.get(id=session_id, user=request.user)
        except WorkoutSession.DoesNotExist:
            return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)

        logs = ExerciseSetLog.objects.filter(session=session)
        serializer = ExerciseSetLogSerializer(logs, many=True)
        return Response(serializer.data)

    def post(self, request, session_id):
        try:
            session = WorkoutSession.objects.get(id=session_id, user=request.user)
        except WorkoutSession.DoesNotExist:
            return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)

        if not session.plan:
            return Response({"detail": "This session has no associated plan."}, status=status.HTTP_400_BAD_REQUEST)

        # WorkoutPlan may not expose a related manager in all contexts; query Exercise
        # directly for exercises belonging to the plan to be robust.
        plan_exercise_ids = Exercise.objects.filter(workout_plan=session.plan).values_list("id", flat=True)
        data = request.data.get("sets", [])

        if not data:
            return Response({"detail": "No sets provided."}, status=status.HTTP_400_BAD_REQUEST)

        created_logs = []
        for item in data:
            exercise_id = item.get("exercise_id")
            # Normalize to int when possible (incoming payloads may be strings)
            try:
                exercise_id_int = int(exercise_id)
            except (TypeError, ValueError):
                return Response({"detail": f"Invalid exercise_id: {exercise_id}"}, status=status.HTTP_400_BAD_REQUEST)

            if exercise_id_int not in plan_exercise_ids:
                return Response(
                    {"detail": f"Exercise {exercise_id} is not part of the plan '{session.plan.name}'."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            set_number = item.get("set_number")
            defaults = {
                'reps_completed': item.get("reps_completed"),
                'weight_kg': item.get("weight_kg"),
                'duration_seconds': item.get("duration_seconds"),
                'score': item.get("score"),
            }

            # Use update_or_create to avoid UniqueViolation on duplicate (session, exercise, set_number)
            try:
                log, created = ExerciseSetLog.objects.update_or_create(
                    session=session,
                    exercise_id=exercise_id_int,
                    set_number=set_number,
                    defaults=defaults
                )
            except IntegrityError:
                # In case of a rare race condition, try to fetch existing log and update it
                try:
                    log = ExerciseSetLog.objects.get(session=session, exercise_id=exercise_id_int, set_number=set_number)
                    for k, v in defaults.items():
                        setattr(log, k, v)
                    log.save()
                except ExerciseSetLog.DoesNotExist:
                    # If still failing, return a 409 to indicate conflict
                    return Response({"detail": "Conflict creating set log. Please retry."}, status=status.HTTP_409_CONFLICT)

            created_logs.append(log)

        serializer = ExerciseSetLogSerializer(created_logs, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)



class ExerciseSetLogDetailAPIView(APIView):
    """
    Update (PATCH) or delete a single set log, tied to a session.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, session_id, log_id, user):
        try:
            return ExerciseSetLog.objects.get(
                id=log_id,
                session__id=session_id,
                session__user=user
            )
        except ExerciseSetLog.DoesNotExist:
            return None

    def patch(self, request, session_id, log_id):
        log = self.get_object(session_id, log_id, request.user)
        if not log:
            return Response({"detail": "Set log not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ExerciseSetLogSerializer(log, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, session_id, log_id):
        log = self.get_object(session_id, log_id, request.user)
        if not log:
            return Response({"detail": "Set log not found."}, status=status.HTTP_404_NOT_FOUND)
        log.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
