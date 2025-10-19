export type Exercise = {
  id?: string
  name?: string
  description?: string
  order?: number
  sets?: number
  reps?: number
  rest_timer?: number
}

export type Workout = {
  id?: number 
  name?: string
  duration_minutes?: number
  difficulty_level?: "easy" | "medium" | "hard"
  exercises?: Exercise[]
}