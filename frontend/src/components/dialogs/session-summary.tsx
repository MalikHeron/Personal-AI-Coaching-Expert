import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type SessionSummaryProps = {
  open: boolean;
  onClose: () => void;
  workoutName: string;
  totalReps: number;
  durationSeconds: number;
  formScore: number;
  setsCompleted: number;
  exercisesCompleted: number;
};

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function SessionSummaryDialog({ open, onClose, workoutName, totalReps, durationSeconds, formScore, setsCompleted, exercisesCompleted }: SessionSummaryProps) {
  console.log(`🎯 ===== SESSION SUMMARY DIALOG =====`);
  console.log(`  Open: ${open}`);
  console.log(`  Workout Name: ${workoutName}`);
  console.log(`  Total Reps: ${totalReps}`);
  console.log(`  Sets Completed: ${setsCompleted}`);
  console.log(`  Exercises Completed: ${exercisesCompleted}`);
  console.log(`  Form Score: ${formScore}%`);
  console.log(`  Duration: ${durationSeconds}s`);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Workout complete</DialogTitle>
          <DialogDescription>
            Here's your session summary for {workoutName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="p-3 rounded-md bg-muted">
            <div className="text-xs text-muted-foreground">Duration</div>
            <div className="text-lg font-semibold">{formatDuration(durationSeconds)}</div>
          </div>
          <div className="p-3 rounded-md bg-muted">
            <div className="text-xs text-muted-foreground">Form score</div>
            <div className="text-lg font-semibold">{formScore}%</div>
          </div>
          <div className="p-3 rounded-md bg-muted">
            <div className="text-xs text-muted-foreground">Total reps</div>
            <div className="text-lg font-semibold">{totalReps}</div>
          </div>
          <div className="p-3 rounded-md bg-muted">
            <div className="text-xs text-muted-foreground">Sets completed</div>
            <div className="text-lg font-semibold">{setsCompleted}</div>
          </div>
          <div className="p-3 rounded-md bg-muted col-span-2">
            <div className="text-xs text-muted-foreground">Exercises completed</div>
            <div className="text-lg font-semibold">{exercisesCompleted}</div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="cursor-pointer">Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
