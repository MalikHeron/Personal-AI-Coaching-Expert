/* eslint-disable @typescript-eslint/no-explicit-any */
import getCookie from "../helpers/cookies";

// Import the API URL from the environment variables
const API_URL = import.meta.env.DEV
  ? import.meta.env.VITE_API_SERVER_DEV
  : import.meta.env.VITE_API_SERVER; // When running inside Docker, this will be used

export class WorkoutService {

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
      // Try to extract error details from the response
      let errorMsg = "Failed to update profile";
      try {
        const err = await response.json();
        if (err && typeof err === 'object') {
          errorMsg += ": " + JSON.stringify(err);
        }
      } catch {
        // Ignore JSON parsing errors
      }
      return [false, errorMsg];
    }
    return [true, null];
  }
}