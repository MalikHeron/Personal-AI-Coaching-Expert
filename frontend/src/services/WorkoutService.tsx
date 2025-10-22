/* eslint-disable @typescript-eslint/no-explicit-any */
import getCookie from "../helpers/cookies";

// Import the API URL from the environment variables
const API_URL = import.meta.env.DEV
  ? import.meta.env.VITE_API_SERVER_DEV
  : import.meta.env.VITE_API_SERVER; // When running inside Docker, this will be used

export class WorkoutService {

  async getWorkoutPlans(): Promise<any[]> {
    const cookies = getCookie("csrftoken");
    const response = await fetch(`${API_URL}/pace/plans/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": cookies,
      },
      credentials: "include",
    });
    if (!response.ok) {
      // Return empty array or handle error as needed
      return [];
    }
    const plans = await response.json();
    // Each plan should include exercises if backend serializer is set up
    return plans;
  }

  async updateProfile(data: any): Promise<[boolean, string | null]> {
    const cookies = getCookie("csrftoken");

    // Prepare the payload matching all FitnessProfileSerializer fields
    // Convert dateOfBirth to YYYY-MM-DD if it's a Date object
    let birthday = null;
    if (data.dateOfBirth instanceof Date && !isNaN(data.dateOfBirth)) {
      birthday = data.dateOfBirth.toISOString().slice(0, 10);
    } else if (typeof data.dateOfBirth === 'string') {
      birthday = data.dateOfBirth;
    }

    const payload = {
      display_name: data.displayName ?? null,
      pronouns: data.pronouns ?? null,
      custom_pronouns: data.customPronouns ?? null,
      birthday,
      height_cm: data.height ?? null,
      weight_kg: data.weight ?? null,
      body_fat_percentage: data.bodyFatPercentage ?? null,
      goals: Array.isArray(data.personalGoals) ? data.personalGoals.join(", ") : (data.personalGoals ?? null),
      medical_conditions: data.medicalConditions ?? null,
      fitness_level: data.fitnessLevel ?? null,
      exercise_frequency: data.exerciseFrequency ?? null,
      fitness_goal: data.fitnessGoal ?? null,
      target_weight_kg: data.targetWeight ?? null,
      gender: data.gender ?? null,
      preferred_training_style: data.preferredTrainingStyle ?? null,
    };

    const response = await fetch(`${API_URL}/pace/profile/update/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": cookies,
      },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    if (!response.ok) {
      try {
        const err = await response.json();
        throw new Error(err.error || err.detail || "Failed to update profile");
      } catch (error: unknown) {
        return [false, (error as Error).message];
      }
    }
    return [true, null];
  }

  async createWorkoutPlan(data: any): Promise<[boolean, number | undefined, string | undefined]> {
    const cookies = getCookie("csrftoken");
    const response = await fetch(`${API_URL}/pace/plans/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": cookies,
      },
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (!response.ok) {
      let errorMsg = "Failed to create workout plan";
      try {
        const err = await response.json();
        if (err && typeof err === 'object') {
          // Try to extract first error message
          const firstField = Object.keys(err)[0];
          if (firstField && Array.isArray(err[firstField]) && err[firstField].length > 0) {
            errorMsg = err[firstField][0];
          } else {
            errorMsg = JSON.stringify(err);
          }
        }
      } catch {
        // Ignore JSON parsing errors
      }
      return [false, undefined, errorMsg];
    }
    const result = await response.json();
    // Expect result to contain id
    return [true, result.id, undefined];
  }

  async addExercisesToPlan(planId: number, exercises: any[]): Promise<[boolean, string]> {
    const cookies = getCookie("csrftoken");
    const response = await fetch(`${API_URL}/pace/plans/${planId}/exercises/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": cookies,
      },
      body: JSON.stringify({ exercises }),
      credentials: "include",
    });
    if (!response.ok) {
      let errorMsg = "Failed to add exercises";
      try {
        const err = await response.json();
        if (err && typeof err === 'object') {
          const firstField = Object.keys(err)[0];
          if (firstField && Array.isArray(err[firstField]) && err[firstField].length > 0) {
            errorMsg = err[firstField][0];
          } else {
            errorMsg = JSON.stringify(err);
          }
        }
      } catch {
        // Ignore JSON parsing errors
      }
      return [false, errorMsg];
    }
    return [true, ""];
  }
}