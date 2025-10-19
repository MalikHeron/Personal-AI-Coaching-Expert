import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { SelectTrigger, SelectValue, SelectContent, SelectItem, Select } from "@/components/ui/select"
import { useState } from "react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Exercise, Workout } from "@/types/platform"
import { Plus } from "lucide-react"
import { IconMinus } from "@tabler/icons-react"
import { toast } from "sonner"
import { WorkoutService } from "@/services/WorkoutService"

// Exercise templates for selection
const EXERCISES: Exercise[] = [
  {
    id: "squat",
    name: "Squats",
    order: 0,
    sets: 0,
    reps: 0,
    rest_timer: 15
  },
  {
    id: "curl",
    name: "Bicep Curls",
    order: 0,
    sets: 0,
    reps: 0,
    rest_timer: 30
  },
]

export default function NewWorkoutDialog() {
  // New workout modal state
  const [newName, setNewName] = useState("");
  const [draftExercises, setDraftExercises] = useState<Exercise[]>([]);

  const [openCreate, setOpenCreate] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<string>(EXERCISES[0].id);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(12);
  const [rest, setRest] = useState(45);

  function addDraftExercise() {
    const exerciseTemplate = EXERCISES.find(ex => ex.id === selectedExercise);
    if (!exerciseTemplate) return;
    setDraftExercises((d) => [
      ...d,
      {
        id: exerciseTemplate.id,
        name: exerciseTemplate.name,
        sets,
        reps,
        rest_timer: rest,
        order: d.length + 1
      }
    ]);
  }

  async function saveNewWorkout() {
    if (!newName || draftExercises.length === 0) return;
    // Estimate duration: (sets * reps * avg seconds per rep) + (sets * rest_timer) for each exercise
    const AVG_SECONDS_PER_REP = 2;
    let totalSeconds = 0;
    let totalVolume = 0;
    let totalRest = 0;
    draftExercises.forEach(ex => {
      const sets = ex.sets || 0;
      const reps = ex.reps || 0;
      const rest = ex.rest_timer || 0;
      totalSeconds += (sets * reps * AVG_SECONDS_PER_REP) + (sets * rest);
      totalVolume += sets * reps;
      totalRest += sets * rest;
    });
    const duration_minutes = Math.max(5, Math.round(totalSeconds / 60));
    const avgRest = draftExercises.length > 0 ? totalRest / draftExercises.length : 0;

    // Difficulty logic
    let difficulty_level: "easy" | "medium" | "hard" = "easy";
    if (totalVolume >= 120 && avgRest <= 30) {
      difficulty_level = "hard";
    } else if (totalVolume >= 60 && avgRest <= 60) {
      difficulty_level = "medium";
    }

    const newWorkout: Workout = {
      name: newName,
      duration_minutes,
      difficulty_level,
    };

    try {
      const workoutService = new WorkoutService();
      // 1. Save workout plan
      const planResult = await workoutService.createWorkoutPlan(newWorkout);
      if (!planResult.success || !planResult.planId) {
        toast.error("Failed to save workout: " + (planResult.error ?? "Unknown error"));
        return;
      }
      // 2. Save exercises with plan id
      // Map exercises to API format
      const exercisesPayload = draftExercises.map((ex) => ({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        rest_timer: ex.rest_timer,
        order: ex.order,
      }));
      const exResult = await workoutService.addExercisesToPlan(planResult.planId, exercisesPayload);
      if (!exResult.success) {
        toast.error("Workout plan saved, but failed to add exercises: " + (exResult.error ?? "Unknown error"));
        return;
      }
      toast.success("Workout and exercises saved successfully!");
      // reset form
      setNewName("");
      setDraftExercises([]);
      setOpenCreate(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error saving workout: ${error.message}`);
        return;
      }
    }
  }

  return (
    <Dialog open={openCreate} onOpenChange={setOpenCreate}>
      <DialogTrigger asChild>
        <Button variant="outline" size='sm' className='cursor-pointer' onClick={() => setOpenCreate(true)}>
          <Plus />
          New Workout
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-11/12 overflow-auto">
        <DialogHeader>
          <DialogTitle>Create New Workout</DialogTitle>
          <DialogDescription>Pick exercises and set reps/sets</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label>Workout name</Label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. 20 min upper body" />
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Exercise</Label>
                <Select value={selectedExercise} onValueChange={(v) => setSelectedExercise(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXERCISES.map((ex) => (
                      <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Sets</Label>
                <Input type="number" value={String(sets)} onChange={(e) => setSets(Number(e.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Reps</Label>
                <Input type="number" value={String(reps)} onChange={(e) => setReps(Number(e.target.value))} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Rest (sec)</Label>
                <Input type="number" value={String(rest)} onChange={(e) => setRest(Number(e.target.value))} />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={addDraftExercise}>Add Exercise</Button>
            <Button variant="ghost" onClick={() => { setDraftExercises([]) }}>Clear</Button>
          </div>

          <div>
            <Label className="mb-2 mt-6">Planned exercises</Label>
            <div className="space-y-2">
              {draftExercises.length === 0 && <div className="text-sm text-muted-foreground">No exercises added yet</div>}
              {draftExercises.map((d, i) => {
                const ex = EXERCISES.find((x) => x.id === d.id);
                return (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{ex?.name}</div>
                      <div className="text-sm text-muted-foreground">{d.sets}×{d.reps} • rest {d.rest_timer}s</div>
                    </div>
                    <Button variant="ghost" onClick={() => setDraftExercises((s) => s.filter((_, idx) => idx !== i))}>
                      <IconMinus />
                      Remove
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={saveNewWorkout}>Save Workout</Button>
          <Button variant="outline" onClick={() => setOpenCreate(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}