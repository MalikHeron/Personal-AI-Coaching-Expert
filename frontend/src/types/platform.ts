export type Exercise = {
  id: string
  name: string
  category: "Upper" | "Lower" | "Core" | "Full Body"
  description?: string
}

export type Workout = {
  id: string
  name: string
  durationMinutes: number
  exercises: { exerciseId: string; sets: number; reps: number; restSec: number }[]
  lastCalories?: number
}