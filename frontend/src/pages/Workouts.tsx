import { useMemo, useState, useEffect } from "react"
import { Play, Shuffle } from "lucide-react"
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
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Exercise, Workout } from "@/types/platform"
import NewWorkoutDialog from "@/components/dialogs/new-workout-dialog"
import { WorkoutService } from "@/services/WorkoutService"
import { SessionService, Session } from "@/services/SessionService"
import { toast } from "sonner"
import { DelayedComponent } from "@/components/ui/delayed-component"
import { Spinner } from "@/components/ui/spinner"
import { SearchBar } from "@/components/ui/search-bar"

// Sample exercise catalog (you will replace with real DB or API)
const EXERCISES: Exercise[] = [
  { id: "squat", name: "Squats", },
  { id: "curl", name: "Bicep Curls" },
]

export default function Workouts() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [query, setQuery] = useState("");
  const [refreshToggle, setRefreshToggle] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchWorkouts() {
    setIsLoading(true);
    const plans = await new WorkoutService().getWorkoutPlans();
    setWorkouts(plans);
    try {
      const sessions = await SessionService.listSessions();
      // Sort by date desc and take last 3 completed
      const recent = sessions
        .filter(s => s.completed)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);
      setRecentSessions(recent);
    } catch (e) {
      console.error('Failed to load recent sessions', e);
      setRecentSessions([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchWorkouts();
  }, [])

  const filteredWorkouts = useMemo(() => {
    return workouts.filter((w) => {
      if (query && !w.name?.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [workouts, query])

  function quickStart() {
    // pick a random workout and navigate/start
    const pick = workouts[Math.floor(Math.random() * workouts.length)]
    if (pick && pick.id) {
      startWorkout(pick.id)
    }
  }

  function startWorkout(id: number) {
    const picked = workouts.find((w) => w.id === id)
    if (!picked) return

    // Map the workout exercises to the format expected by the Workout component
    const workoutData = picked.exercises?.map((e) => {
      const exercise = EXERCISES.find((ex) => ex.name === e.name)
      return {
        name: exercise?.name || e.name,
        reps: e.reps,
        sets: e.sets,
        restTimer: e.rest_timer,
      }
    })
    // Navigate to workout page with workout data
    navigate("/home/session", { state: { workouts: workoutData, workoutName: picked.name, workoutPlanId: picked.id, planExercises: picked.exercises } })
  }

  useEffect(() => {
    fetchWorkouts();
  }, [refreshToggle]);

  return (
    <>
      <div className="p-2">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Workouts</h1>
            <p className="text-sm text-muted-foreground">Build, save and start workouts</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <NewWorkoutDialog setRefreshToggle={setRefreshToggle} />

            <Button size='sm' className='cursor-pointer' onClick={quickStart}>
              <Shuffle />
              Quick Start
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="flex ml-auto justify-start mb-6">
          <SearchBar
            placeholder="Search workouts..."
            value={query}
            onChange={(e) => setQuery(e)}
            onClear={() => setQuery("")}
          />
        </div>

        {isLoading ? (
          // Show loading spinner while fetching workouts
          <DelayedComponent
            children={
              <div className='flex w-full items-center justify-center gap-2 p-6'>
                <Spinner className='size-4' />
                <p className='text-sm'>Loading workouts...</p>
              </div>
            }
            componentName={"Home"}
            delay={300}
          />
        ) : (
          <>
            {/* Workout grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkouts.map((w) => (
                <Card key={w.id} className="hover:shadow-lg transition">
                  <CardHeader>
                    <CardTitle>{w.name}</CardTitle>
                    <CardDescription>{w.duration_minutes} min • {w.exercises?.length} exercises</CardDescription>
                  </CardHeader>
                  <CardContent className="grow">
                    <div className="flex flex-col gap-2">
                      {w.exercises?.slice(0, 3).map((e, idx) => {
                        const ex = EXERCISES.find((x) => x.name === e.name)
                        return (
                          <div key={idx} className="flex justify-between text-sm">
                            <div className="truncate">{ex?.name ?? e.name}</div>
                            <div className="text-muted-foreground">{e.sets}×{e.reps}</div>
                          </div>
                        )
                      })}
                      {(w.exercises && w.exercises.length > 3) && (
                        <div className="text-sm text-muted-foreground">+{w.exercises.length - 3} more</div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex w-full gap-3">
                      <Button className="cursor-pointer flex-1" onClick={() => startWorkout(w.id!)}>
                        <Play />
                        Start Workout
                      </Button>
                      <Button variant="outline" disabled className="cursor-pointer w-28" onClick={() => toast("Edit workout — implement")}>Edit</Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Recent activity / tips */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Last 3 workouts</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {recentSessions.map((s) => {
                  const duration = s.duration ? s.duration : '00:00:00'
                  type Log = { reps_completed?: number | null }
                  const logs = (s as unknown as { logs?: Log[] }).logs
                  const reps = Array.isArray(logs) ? logs.reduce((acc: number, l: Log) => acc + (l.reps_completed ?? 0), 0) : undefined
                  return (
                    <li key={s.id} className="flex justify-between">
                      <div>
                        <div className="font-medium">{s.plan_name ?? 'Session'}</div>
                        <div className="text-sm text-muted-foreground">{duration} • {s.completed ? 'completed' : 'in progress'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">{typeof reps === 'number' ? reps : '—'} reps</div>
                      </div>
                    </li>
                  )
                })}
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
      </div >
    </>
  )
}
