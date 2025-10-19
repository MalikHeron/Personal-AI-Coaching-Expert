from datetime import timedelta
from django.db.models import Sum, Avg
from django.db.models.functions import TruncDate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from pace.models import WorkoutSession, ExerciseSetLog
from pace.serializers import FitnessAnalyticsSerializer


class FitnessAnalyticsAPIView(APIView):
    """
    GET: Return a summary of the user's workout statistics, including:
    - Total number of workouts
    - Total time trained
    - Average form accuracy (overall)
    - Average accuracy over time (for charting)
    - Average accuracy per exercise
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # --- 1️⃣ Total number of workouts ---
        total_workouts = WorkoutSession.objects.filter(user=user, completed=True).count()

        # --- 2️⃣ Total time trained ---
        total_duration = (
            WorkoutSession.objects.filter(user=user, completed=True)
            .aggregate(Sum('duration'))['duration__sum']
            or timedelta(seconds=0)
        )

        # --- 3️⃣ Average accuracy (overall) ---
        avg_accuracy = (
            ExerciseSetLog.objects.filter(session__user=user)
            .aggregate(Avg('score'))['score__avg']
            or 0
        )

        # --- 4️⃣ Accuracy over time (for chart) ---
        accuracy_over_time = list(
            ExerciseSetLog.objects.filter(session__user=user)
            .annotate(date=TruncDate('session__date'))
            .values('date')
            .annotate(avg_accuracy=Avg('score'))
            .order_by('date')
        )

        # --- 5️⃣ Average accuracy per exercise ---
        accuracy_per_exercise = list(
            ExerciseSetLog.objects.filter(session__user=user)
            .values('exercise__name')
            .annotate(avg_accuracy=Avg('score'))
            .order_by('exercise__name')
        )

        # --- 🧾 Combine all results ---
        data = {
            "total_workouts": total_workouts,
            "total_time_trained": str(total_duration),
            "average_accuracy": round(avg_accuracy, 2),
            "accuracy_over_time": accuracy_over_time,
            "accuracy_per_exercise": accuracy_per_exercise,
        }

        serializer = FitnessAnalyticsSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)
