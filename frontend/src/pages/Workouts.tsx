import { useMemo, useState } from "react"
import { Play, Shuffle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Exercise, Workout } from "@/types/platform"
import NewWorkoutDialog from "@/components/dialogs/new-workout-dialog"

// Sample exercise catalog (you will replace with real DB or API)
const EXERCISES: Exercise[] = [
  { id: "squat", name: "Squats", category: "Lower" },
  { id: "curl", name: "Bicep Curls", category: "Upper" },
]

const SAMPLE_WORKOUTS: Workout[] = [
  {
    id: "w-1",
    name: "Full Body Blast",
    durationMinutes: 20,
    exercises: [
      { exerciseId: "squat", sets: 3, reps: 15, restSec: 10 },
      { exerciseId: "curl", sets: 2, reps: 20, restSec: 10 },
    ],
    lastCalories: 180,
  },
  {
    id: "w-2",
    name: "Full Body",
    durationMinutes: 25,
    exercises: [
      { exerciseId: "curl", sets: 4, reps: 10, restSec: 60 },
      { exerciseId: "squat", sets: 4, reps: 10, restSec: 45 },
    ],
    lastCalories: 220,
  },
]

export default function Workouts() {
  const navigate = useNavigate()
  const [workouts, setWorkouts] = useState<Workout[]>(SAMPLE_WORKOUTS)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<"All" | Exercise["category"] | "Saved">("All")

  const filteredWorkouts = useMemo(() => {
    return workouts.filter((w) => {
      if (query && !w.name.toLowerCase().includes(query.toLowerCase())) return false
      if (filter === "All") return true
      if (filter === "Saved") return true // placeholder — you can track favorites
      // filter by exercise category
      const hasCategory = w.exercises.some((e) => {
        const ex = EXERCISES.find((x) => x.id === e.exerciseId)
        return ex?.category === filter
      })
      return hasCategory
    })
  }, [workouts, query, filter])

  function quickStart() {
    // pick a random workout and navigate/start
    const pick = workouts[Math.floor(Math.random() * workouts.length)]
    startWorkout(pick.id)
  }

  function startWorkout(id: string) {
    const picked = workouts.find((w) => w.id === id)
    if (!picked) return

    // Map the workout exercises to the format expected by the Workout component
    const workoutData = picked.exercises.map((e) => {
      const exercise = EXERCISES.find((ex) => ex.id === e.exerciseId)
      return {
        name: exercise?.name || e.exerciseId,
        reps: e.reps,
        sets: e.sets,
        restTimer: e.restSec,
        difficulty: "Intermediate" as const // You can make this dynamic later
      }
    })
    console.log("Sending over: ", workoutData);
    // Navigate to workout page with workout data
    navigate("/demo", { state: { workouts: workoutData, workoutName: picked.name } })
  }

  return (
    <div className="p-2">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Workouts</h1>
          <p className="text-sm text-muted-foreground">Build, save and start workouts</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="w-40" size="sm">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Upper">Upper Body</SelectItem>
              <SelectItem value="Lower">Lower Body</SelectItem>
              <SelectItem value="Core">Core</SelectItem>
              <SelectItem value="Full Body">Full Body</SelectItem>
            </SelectContent>
          </Select>

          <NewWorkoutDialog />

          <Button size='sm' className='cursor-pointer' onClick={quickStart}>
            <Shuffle />
            Quick Start
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex ml-auto justify-start mb-6">
        <Input
          className="justify-end sm:w-64 md:w-80"
          placeholder="Search workouts or exercises..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Workout grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkouts.map((w) => (
          <Card key={w.id} className="hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>{w.name}</CardTitle>
              <CardDescription>{w.durationMinutes} min • {w.exercises.length} exercises</CardDescription>
            </CardHeader>
            <CardContent className="grow">
              <div className="flex flex-col gap-2">
                {w.exercises.slice(0, 3).map((e, idx) => {
                  const ex = EXERCISES.find((x) => x.id === e.exerciseId)
                  return (
                    <div key={idx} className="flex justify-between text-sm">
                      <div className="truncate">{ex?.name ?? e.exerciseId}</div>
                      <div className="text-muted-foreground">{e.sets}×{e.reps}</div>
                    </div>
                  )
                })}
                {w.exercises.length > 3 && (
                  <div className="text-sm text-muted-foreground">+{w.exercises.length - 3} more</div>
                )}
                <div className="pt-2 flex items-center gap-3">
                  <Badge variant="outline">Last: {w.lastCalories ?? "—"} kcal</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex w-full gap-3">
                <Button className="cursor-pointer flex-1" onClick={() => startWorkout(w.id)}>
                  <Play />
                  Start Workout
                </Button>
                <Button variant="outline" className="cursor-pointer w-28" onClick={() => alert("Edit workout — implement")}>Edit</Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Recent activity / tips */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Last 3 workouts</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {workouts.slice(0, 3).map((w) => (
                <li key={w.id} className="flex justify-between">
                  <div>
                    <div className="font-medium">{w.name}</div>
                    <div className="text-sm text-muted-foreground">{w.durationMinutes} min • {w.exercises.length} ex</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{w.lastCalories ?? "—"} kcal</div>
                    <div className="text-sm text-muted-foreground">{w.exercises.reduce((acc, cur) => acc + cur.reps * cur.sets, 0)} reps</div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tips</CardTitle>
            <CardDescription>Improve tracking with MediaPipe</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Ensure full body is visible to the camera</li>
              <li>Use plain backgrounds and good lighting</li>
              <li>Remove loose clothing that hides key joints</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
