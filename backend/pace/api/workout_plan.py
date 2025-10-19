from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from pace.models import WorkoutPlan, WorkoutExercise, Exercise
from pace.serializers import WorkoutPlanSerializer, WorkoutExerciseSerializer
from django.db import models

class WorkoutPlanListCreateAPIView(APIView):
    """
    GET: List all workout plans for the logged-in user.
    POST: Create a new workout plan.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        plans = WorkoutPlan.objects.filter(user=request.user)
        serializer = WorkoutPlanSerializer(plans, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data.copy()
        data['user'] = request.user.id
        serializer = WorkoutPlanSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WorkoutPlanDetailAPIView(APIView):
    """
    GET: Retrieve a specific workout plan.
    PUT/PATCH: Update the plan.
    DELETE: Delete the plan.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return WorkoutPlan.objects.get(pk=pk, user=user)
        except WorkoutPlan.DoesNotExist:
            return None

    def get(self, request, pk):
        plan = self.get_object(pk, request.user)
        if not plan:
            return Response({"detail": "Workout plan not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = WorkoutPlanSerializer(plan)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        plan = self.get_object(pk, request.user)
        if not plan:
            return Response({"detail": "Workout plan not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = WorkoutPlanSerializer(plan, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        plan = self.get_object(pk, request.user)
        if not plan:
            return Response({"detail": "Workout plan not found."}, status=status.HTTP_404_NOT_FOUND)
        plan.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    


class WorkoutPlanExerciseAPIView(APIView):
    """
    Manage exercises within a workout plan.
    Supports:
      - POST → Add exercise(s) with correct order shifting
      - PUT → Update an exercise's details or order
      - DELETE → Remove an exercise and reindex the plan
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, plan_id):
        try:
            plan = WorkoutPlan.objects.get(id=plan_id, user=request.user)
        except WorkoutPlan.DoesNotExist:
            return Response({"detail": "Workout plan not found."}, status=status.HTTP_404_NOT_FOUND)

        exercises_data = request.data.get("exercises", [])
        if not exercises_data:
            return Response({"detail": "No exercises provided."}, status=status.HTTP_400_BAD_REQUEST)

        created_exercises = []

        for item in exercises_data:
            exercise_id = item.get("exercise_id")
            sets = item.get("sets")
            reps = item.get("reps")
            order = item.get("order")

            try:
                exercise = Exercise.objects.get(id=exercise_id)
            except Exercise.DoesNotExist:
                return Response({"detail": f"Exercise with id {exercise_id} not found."}, status=status.HTTP_404_NOT_FOUND)

            # If no order given, append to end
            if order is None:
                max_order = WorkoutExercise.objects.filter(workout_plan=plan).aggregate(models.Max('order'))['order__max'] or 0
                order = max_order + 1
            else:
                # Shift down existing exercises if order conflicts
                WorkoutExercise.objects.filter(
                    workout_plan=plan,
                    order__gte=order
                ).update(order=models.F('order') + 1)

            workout_exercise = WorkoutExercise.objects.create(
                workout_plan=plan,
                exercise=exercise,
                sets=sets,
                reps=reps,
                order=order
            )
            created_exercises.append(workout_exercise)

        serializer = WorkoutExerciseSerializer(created_exercises, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # ---- Update Exercise ----
    def put(self, request, plan_id, exercise_id):
        try:
            plan = WorkoutPlan.objects.get(id=plan_id, user=request.user)
        except WorkoutPlan.DoesNotExist:
            return Response({"detail": "Workout plan not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            workout_exercise = WorkoutExercise.objects.get(workout_plan=plan, exercise_id=exercise_id)
        except WorkoutExercise.DoesNotExist:
            return Response({"detail": "Exercise not found in this plan."}, status=status.HTTP_404_NOT_FOUND)

        sets = request.data.get("sets", workout_exercise.sets)
        reps = request.data.get("reps", workout_exercise.reps)
        duration_seconds = request.data.get("duration_seconds", workout_exercise.duration_seconds)
        new_order = request.data.get("order", workout_exercise.order)

        # Reordering logic
        if new_order != workout_exercise.order:
            current_order = workout_exercise.order
            if new_order < current_order:
                WorkoutExercise.objects.filter(
                    workout_plan=plan,
                    order__gte=new_order,
                    order__lt=current_order
                ).update(order=models.F('order') + 1)
            else:
                WorkoutExercise.objects.filter(
                    workout_plan=plan,
                    order__gt=current_order,
                    order__lte=new_order
                ).update(order=models.F('order') - 1)
            workout_exercise.order = new_order

        workout_exercise.sets = sets
        workout_exercise.reps = reps
        workout_exercise.duration_seconds = duration_seconds
        workout_exercise.save()

        serializer = WorkoutExerciseSerializer(workout_exercise)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ---- Delete Exercise ----
    def delete(self, request, plan_id, exercise_id):
        try:
            plan = WorkoutPlan.objects.get(id=plan_id, user=request.user)
        except WorkoutPlan.DoesNotExist:
            return Response({"detail": "Workout plan not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            workout_exercise = WorkoutExercise.objects.get(workout_plan=plan, exercise_id=exercise_id)
        except WorkoutExercise.DoesNotExist:
            return Response({"detail": "Exercise not found in this plan."}, status=status.HTTP_404_NOT_FOUND)

        deleted_order = workout_exercise.order
        workout_exercise.delete()

        # Shift up remaining exercises
        WorkoutExercise.objects.filter(
            workout_plan=plan,
            order__gt=deleted_order
        ).update(order=models.F('order') - 1)

        return Response({"detail": "Exercise removed and order reindexed."}, status=status.HTTP_204_NO_CONTENT)

