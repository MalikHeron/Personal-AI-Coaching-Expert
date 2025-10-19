import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { SelectTrigger, SelectValue, SelectContent, SelectItem, Select } from "@/components/ui/select"
import { useState } from "react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Exercise, Workout } from "@/types/platform"
import { Plus } from "lucide-react"

// Sample exercise catalog (you will replace with real DB or API)
const EXERCISES: Exercise[] = [
  { id: "squat", name: "Squats", category: "Lower" },
  { id: "curl", name: "Bicep Curls", category: "Upper" },
]

export default function NewWorkoutDialog() {
  // New workout modal state
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [newName, setNewName] = useState("");
  const [draftExercises, setDraftExercises] = useState<Workout["exercises"]>([]);

  const [openCreate, setOpenCreate] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<string>(EXERCISES[0].id);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(12);
  const [rest, setRest] = useState(45);

  function addDraftExercise() {
    setDraftExercises((d) => [...d, { exerciseId: selectedExercise, sets, reps, restSec: rest }])
  }

  function saveNewWorkout() {
    if (!newName || draftExercises.length === 0) return
    const newWorkout: Workout = {
      id: `w-${Date.now()}`,
      name: newName,
      durationMinutes: Math.max(5, draftExercises.length * 5),
      exercises: draftExercises,
    }
    setWorkouts((w) => [newWorkout, ...w])
    // reset
    setNewName("")
    setDraftExercises([])
    setOpenCreate(false)
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
            <Label className="mb-2">Planned exercises</Label>
            <div className="space-y-2">
              {draftExercises.length === 0 && <div className="text-sm text-muted-foreground">No exercises added yet</div>}
              {draftExercises.map((d, i) => {
                const ex = EXERCISES.find((x) => x.id === d.exerciseId)
                return (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{ex?.name}</div>
                      <div className="text-sm text-muted-foreground">{d.sets}×{d.reps} • rest {d.restSec}s</div>
                    </div>
                    <Button variant="ghost" onClick={() => setDraftExercises((s) => s.filter((_, idx) => idx !== i))}>Remove</Button>
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