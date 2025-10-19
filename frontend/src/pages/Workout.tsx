import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, ChevronLeftIcon, TrendingUp } from "lucide-react";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import { IconPlayerPauseFilled, IconPlayerPlayFilled, IconPlayerStopFilled } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import useCamera from "@/hooks/use-camera";
import { Spinner } from "@/components/ui/spinner";
import useExerciseTracker from "@/hooks/use-exercise-tracker";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DashboardService } from '../services/DashboardService';

type Workout = {
  name: string;
  reps: number;
  sets: number;
  restTimer?: number;
  difficulty: "Easy" | "Intermediate" | "Hard";
};

export default function Workout({ workouts: defaultWorkouts = [] }: { workouts?: Workout[] }) {
  const location = useLocation();
  const state = location.state as { workouts?: Workout[], workoutName?: string } | null;

  // Use workouts from navigation state if available, otherwise use prop
  const workouts = state?.workouts || defaultWorkouts;
  const workoutName = state?.workoutName || "Upper Body Strength";
  // State variables
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);
  const [currentWorkoutIndex, setCurrentWorkoutIndex] = useState(0);
  const [currentRep, setCurrentRep] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);

  // Use refs to track the actual current values
  const currentRepRef = useRef(0);
  const currentSetRef = useRef(1);

  // Keep refs in sync with state
  useEffect(() => {
    currentRepRef.current = currentRep;
  }, [currentRep]);

  useEffect(() => {
    currentSetRef.current = currentSet;
  }, [currentSet]);

  const [workoutDuration, setWorkoutDuration] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState("--");
  const [accumulatedElapsed, setAccumulatedElapsed] = useState(0);
  const [setStartTime, setSetStartTime] = useState<number | null>(null);
  const [setDuration, setSetDuration] = useState("--");
  const [accumulatedSetElapsed, setAccumulatedSetElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const [betweenSetTimer, setBetweenSetTimer] = useState(0);
  const [isBetweenSets, setIsBetweenSets] = useState(false);

  // API-related state
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const sessionStartTimeRef = useRef<string | null>(null);

  // Derived values
  const currentWorkout: Workout = workouts[currentWorkoutIndex] || {
    name: "Bicep Curl",
    reps: 10,
    sets: 2,
    restTimer: 10,
    difficulty: "Easy"
  };

  // Hooks
  const { videoRef, isCameraOn: cameraActive, error: cameraError, isLoading } = useCamera();
  const {
    canvasRef,
    counter: trackedReps,
    feedback,
    goodRepsInARow,
    avgRepSpeed,
    overallAccuracy,
    markWorkoutEnd,
    startTracking,
    stopTracking,
    resetCounter,
  } = useExerciseTracker(
    currentWorkout.name,
    videoRef,
    isWorkoutActive && !isBetweenSets,
    handleRepComplete,
    "right"
  );

  const repPercentage = useMemo(() =>
    currentWorkout.reps > 0 ? Math.round((currentRep / currentWorkout.reps) * 100) : 0,
    [currentRep, currentWorkout.reps]
  );

  const formScore = useMemo(() =>
    trackedReps > 0 ? Math.round((goodRepsInARow / trackedReps) * 100) : 100,
    [goodRepsInARow, trackedReps]
  );

  const tempoLabel = useMemo(() => {
    if (avgRepSpeed > 0) {
      if (avgRepSpeed >= 1.5) return "Slow";
      if (avgRepSpeed >= 1.0) return "Good";
      return "Fast";
    }
    return "--";
  }, [avgRepSpeed]);

  // Effects
  useEffect(() => {
    if (setStartTime) {
      setSetDuration(new Date(Date.now() - setStartTime).toISOString().substr(14, 5));
    } else {
      setSetDuration("--");
    }
  }, [tick, setStartTime]);

  useEffect(() => {
    if ((setStartTime !== null || accumulatedSetElapsed > 0) && (isWorkoutActive || accumulatedSetElapsed > 0)) {
      setSetDuration(
        new Date(accumulatedSetElapsed + (isWorkoutActive && setStartTime !== null ? (Date.now() - setStartTime) : 0))
          .toISOString()
          .substr(14, 5)
      );
    } else {
      setSetDuration("--");
    }
  }, [tick, setStartTime, isWorkoutActive, accumulatedSetElapsed]);

  useEffect(() => {
    if ((workoutDuration !== null || accumulatedElapsed > 0) && (isWorkoutActive || accumulatedElapsed > 0)) {
      setElapsedTime(
        new Date(accumulatedElapsed + (isWorkoutActive && workoutDuration !== null ? (Date.now() - workoutDuration) : 0))
          .toISOString()
          .substr(14, 5)
      );
    } else {
      setElapsedTime("--");
    }
  }, [tick, workoutDuration, isWorkoutActive, accumulatedElapsed]);

  useEffect(() => {
    if (isWorkoutActive) {
      const interval = setInterval(() => setTick((t) => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [isWorkoutActive]);

  useEffect(() => {
    if (isWorkoutActive) {
      const totalRepsCompleted = (currentSet - 1) * currentWorkout.reps + currentRep;
      if (trackedReps > totalRepsCompleted) {
        const repsInCurrentSet = trackedReps % currentWorkout.reps;
        setCurrentRep(repsInCurrentSet === 0 ? currentWorkout.reps : repsInCurrentSet);
      }
    }
  }, [trackedReps, isWorkoutActive, currentSet, currentWorkout.reps, currentRep]);

  // Between-set timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isBetweenSets) {
      interval = setInterval(() => {
        setBetweenSetTimer((prev) => {
          if (prev <= 1) {
            // Timer reached 0, end the rest period
            setIsBetweenSets(false);
            setCurrentRep(0);
            setAccumulatedSetElapsed(0);
            setSetStartTime(Date.now());
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBetweenSets]);

  // Handlers
  async function handleRepComplete(repCount: number) {
    if (repCount === 0 && !started) {
      setStarted(true);
    }

    // Use ref to get ACTUAL current rep value
    const newRep = currentRepRef.current + 1;
    console.log("✓ Rep completed! newRep:", newRep, "Target:", currentWorkout.reps);

    // Update state AND ref
    setCurrentRep(newRep);
    currentRepRef.current = newRep;

    // Check if ALL reps in this set are done
    if (newRep >= currentWorkout.reps) {
      // Get ACTUAL current set value from ref
      const currentSetValue = currentSetRef.current;
      console.log("✓ SET COMPLETE! Current set:", currentSetValue, "Total sets:", currentWorkout.sets);

      // Reset for next set
      setSetStartTime(null);
      setAccumulatedSetElapsed(0);
      setCurrentRep(0);
      currentRepRef.current = 0;
      resetCounter();
      setStarted(false);

      // Check if ALL sets are done
      if (currentSetValue >= currentWorkout.sets) {
        console.log("✓✓✓ ALL SETS DONE! Moving to next workout.");
        markWorkoutEnd();
        setTimeout(() => {
          moveToNextWorkout();
        }, 1000);
      } else {
        // Move to next set
        const nextSet = currentSetValue + 1;
        console.log("→ Moving to set", nextSet, "after rest");
        setCurrentSet(nextSet);
        currentSetRef.current = nextSet;
        setIsBetweenSets(true);
        setBetweenSetTimer(currentWorkout.restTimer || 30);
      }
    }
  }

  const finishWorkout = useCallback(async () => {
    setIsWorkoutActive(false);
    stopTracking();
    setSetStartTime(null);

    // Update the workout session in the database
    if (currentSessionId && sessionStartTimeRef.current) {
      try {
        const endTime = new Date().toISOString();
        const totalDurationSeconds = Math.floor((new Date(endTime).getTime() - new Date(sessionStartTimeRef.current).getTime()) / 1000);

        await DashboardService.patchWorkoutSession(currentSessionId, {
          total_duration: totalDurationSeconds,
          total_reps: trackedReps,
          form_score: formScore,
          date: endTime
        });
        console.log("✓ Workout session updated in database");
      } catch (error) {
        console.error("Failed to update workout session:", error);
      }
    }

    alert("Workout session ended.");
    setStarted(false);
    setSetDuration("--");
    setAccumulatedSetElapsed(0);
    markWorkoutEnd();

    // Reset session state
    setCurrentSessionId(null);
    sessionStartTimeRef.current = null;

    setTimeout(() => {
      if (videoRef.current) videoRef.current.srcObject = null;
      if (canvasRef.current) {
        canvasRef.current.width = 0;
        canvasRef.current.height = 0;
      }
    }, 1000);
  }, [stopTracking, markWorkoutEnd, videoRef, canvasRef, currentSessionId, trackedReps, formScore]);

  const moveToNextWorkout = useCallback(() => {
    const nextIndex = currentWorkoutIndex + 1;
    console.log(`moveToNextWorkout() called. currentIndex: ${currentWorkoutIndex}, nextIndex: ${nextIndex}, totalWorkouts: ${workouts.length}`);

    if (nextIndex < workouts.length) {
      console.log(`  Moving to workout ${nextIndex}: ${workouts[nextIndex].name}`);
      setCurrentWorkoutIndex(nextIndex);
      setCurrentRep(0);
      setCurrentSet(1);
      // RESET THE REFS TOO!
      currentRepRef.current = 0;
      currentSetRef.current = 1;
      resetCounter();
      setStarted(false);
    } else {
      console.log(`  All workouts complete! Calling finishWorkout()`);
      finishWorkout();
    }
  }, [currentWorkoutIndex, workouts, resetCounter, finishWorkout]);

  useEffect(() => {
    if (isWorkoutActive) {
      startTracking();
      // Set the start time for the current set
      setSetStartTime((prev) => prev === null ? Date.now() : prev);
      // Only set workoutDuration if it's null (i.e., workout just started)
      setWorkoutDuration((prev) => prev === null ? Date.now() : prev);
    }
  }, [finishWorkout, isWorkoutActive, startTracking, started]);

  // Create workout session when workout starts
  useEffect(() => {
    async function createSession() {
      if (isWorkoutActive && !currentSessionId) {
        try {
          const startTime = new Date().toISOString();
          sessionStartTimeRef.current = startTime;

          const session = await DashboardService.createWorkoutSession({
            workout_name: workoutName,
            total_duration: 0,
            total_reps: 0,
            form_score: 0,
            date: startTime
          });

          setCurrentSessionId(session.id!);
          console.log("✓ Workout session created:", session.id);
        } catch (error) {
          console.error("Failed to create workout session:", error);
        }
      }
    }

    createSession();
  }, [isWorkoutActive, currentSessionId, workoutName]);

  // Pause/resume elapsed time logic
  useEffect(() => {
    if (!isWorkoutActive && workoutDuration !== null) {
      // Pausing: accumulate elapsed time
      setAccumulatedElapsed((prev) => prev + (Date.now() - workoutDuration));
      setWorkoutDuration(null);
    } else if (isWorkoutActive && workoutDuration === null) {
      // Resuming: set workoutDuration to now
      setWorkoutDuration(Date.now());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWorkoutActive]);

  // Pause/resume set timer logic
  useEffect(() => {
    if (!isWorkoutActive && setStartTime !== null) {
      // Pausing: accumulate set elapsed time
      setAccumulatedSetElapsed((prev) => prev + (Date.now() - setStartTime));
      setSetStartTime(null);
    } else if (isWorkoutActive && setStartTime === null && currentRep !== 0) {
      // Resuming: set setStartTime to now (do not reset accumulatedSetElapsed)
      setSetStartTime(Date.now());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWorkoutActive]);

  useEffect(() => {
    const videoEl = videoRef.current;
    const canvasEl = canvasRef.current;
    return () => {
      stopTracking();
      if (videoEl) videoEl.srcObject = null;
      if (canvasEl) {
        canvasEl.width = 0;
        canvasEl.height = 0;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-4 overflow-y-auto">
      <div className="flex items-center justify-between p-4">
        <Button variant='outline' className="cursor-pointer" onClick={() => navigate('/')}>
          <ChevronLeftIcon />
          Back to Home
        </Button>

        <div className="flex gap-2">
          {isWorkoutActive ? (
            <Button variant='outline' className="cursor-pointer" onClick={() => setIsWorkoutActive(false)}>
              <IconPlayerPauseFilled />
              Pause
            </Button>
          ) : (
            <Button variant='outline' className="cursor-pointer" onClick={() => setIsWorkoutActive(true)}>
              <IconPlayerPlayFilled />
              Start
            </Button>
          )}
          <Button variant='outline' className="cursor-pointer" onClick={finishWorkout}>
            <IconPlayerStopFilled className="text-red-500" />
            End session
          </Button>
        </div>
      </div>

      <div className="block md:flex h-screen gap-6 space-y-4">
        {/* Left: Workout Video */}
        <div className="flex-1 flex h-[480px] md:h-[720px] items-center justify-center rounded-2xl overflow-hidden shadow-lg">
          {isLoading && !cameraActive && <Spinner className="size-8" />}
          {cameraActive &&
            <>
              <video
                ref={videoRef}
                className="h-[480px] md:h-[720px] w-full object-cover"
                autoPlay
                playsInline
                muted
                style={{ display: 'none' }}
              />

              {/* Canvas with pose detection overlay - VISIBLE */}
              <canvas
                ref={canvasRef}
                className="h-[480px] md:h-[720px] w-full object-cover"
              />
            </>
          }
          {cameraError && (
            <div className="flex items-center justify-center w-full h-full z-10">
              <div className="text-red-500 text-sm bg-card rounded px-4 py-2 text-center">
                {cameraError}
              </div>
            </div>
          )}
        </div>

        {/* Right: Stat Cards */}
        <div className="md:w-1/3 flex flex-col gap-4 pb-3 overflow-y-auto">
          {/* Active Exercise Tracker Card */}
          <Card className="shadow-md">
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Exercise</div>
                  <div className="font-medium">{currentWorkout.name}</div>
                </div>
                <AnimatedCircularProgressBar
                  className="size-12 text-sm"
                  value={repPercentage}
                  gaugePrimaryColor="rgb(34 197 94)"
                  gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
                />
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="p-2 bg-muted rounded-md shadow-sm">
                  <div className="text-xs text-muted-foreground">Reps Completed</div>
                  <div className="font-semibold">{currentRep} / {currentWorkout.reps}</div>
                </div>
                <div className="p-2 bg-muted rounded-md shadow-sm">
                  <div className="text-xs text-muted-foreground">Sets Completed</div>
                  <div className="font-semibold">{currentSet}/ {currentWorkout.sets}</div>
                </div>
                <div className="p-2 bg-muted rounded-md shadow-sm">
                  <div className="text-xs text-muted-foreground">Duration</div>
                  <div className="font-semibold">{setDuration} mins</div>
                </div>
                <div className="p-2 bg-muted rounded-md shadow-sm">
                  <div className="text-xs text-muted-foreground">Rest Timer</div>
                  <div className="font-semibold">{currentWorkout.restTimer} secs</div>
                </div>
              </div>

              <div className="mt-4 text-sm text-muted-foreground">Tip: Slow the descent 10% to increase tension and improve depth.</div>
            </CardContent>
          </Card>

          {/* Form Analysis Card */}
          <Card className="shadow-md gap-1">
            <CardHeader>
              <CardTitle className="text-md font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" /> Form Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className='flex flex-col gap-2'>
                <div className="flex justify-between text-sm">
                  <span>Form Score</span>
                  <span className="font-medium text-muted-foreground">{formScore}%</span>
                </div>
                <Progress value={formScore} className="h-2" />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="p-2 bg-muted rounded-md shadow-sm">
                  <div className="text-xs text-muted-foreground">Avg. Rep Speed</div>
                  <div className="font-semibold">{avgRepSpeed > 0 ? avgRepSpeed.toFixed(2) + 's' : '--'}</div>
                </div>
                <div className="p-2 bg-muted rounded-md shadow-sm">
                  <div className="text-xs text-muted-foreground">Tempo</div>
                  <div className={
                    tempoLabel === 'Good' ? 'font-medium text-green-400' :
                      tempoLabel === 'Slow' ? 'font-medium text-yellow-500' :
                        tempoLabel === 'Fast' ? 'font-medium text-red-500' : 'font-medium text-muted-foreground'
                  }>
                    {tempoLabel}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-sm">Feedback</div>
                <div className="font-md min-h-14 text-muted-foreground">{feedback || 'No feedback available'}</div>
              </div>
            </CardContent>
          </Card>

          {/* Session Overview Card */}
          <Card className="shadow-md gap-1">
            <CardHeader>
              <CardTitle className="text-md font-semibold flex items-center gap-2 justify-between">
                <div className="flex gap-2 items-center">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  Session Overview
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm ">
                <span>Workout Name</span>
                <span className="font-medium text-muted-foreground">{workoutName}</span>
              </div>
              <div className="flex justify-between text-sm ">
                <span>Total Exercises</span>
                <span className="font-medium text-muted-foreground">{workouts.length}</span>
              </div>
              <div className="flex justify-between text-sm ">
                <span>Elapsed Time</span>
                <span className="font-medium text-muted-foreground">{elapsedTime} / 20:00</span>
              </div>
              <div className="flex justify-between text-sm ">
                <span>Overall Accuracy</span>
                <span className="font-medium text-muted-foreground">{overallAccuracy}%</span>
              </div>
              <div className="flex justify-between text-sm ">
                <span>Difficulty</span>
                <span className={`font-medium ${currentWorkout.difficulty === "Easy" ? "text-green-500" : currentWorkout.difficulty === "Intermediate" ? "text-orange-500" : "text-red-500"}`}>{currentWorkout.difficulty}</span>
              </div>
            </CardContent>
          </Card>

          {/* Between Set Timer Overlay */}
          {isBetweenSets && (
            <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-black/80 to-blue-900/80 z-50">
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-lg">Next set starts in</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col space-y-4 items-center">
                  <div className="relative flex items-center justify-center">
                    <AnimatedCircularProgressBar
                      className="size-24"
                      value={((currentWorkout.restTimer || 30) - betweenSetTimer) / (currentWorkout.restTimer || 30) * 100}
                      showValue={false}
                      gaugePrimaryColor="rgb(59 130 246)"
                      gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
                    />
                    <span className="absolute text-3xl font-bold">
                      {betweenSetTimer}
                    </span>
                  </div>
                  <div className="text-muted-foreground dark:text-zinc-200 font-medium mt-2">Take a breather, hydrate, and get ready!</div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}