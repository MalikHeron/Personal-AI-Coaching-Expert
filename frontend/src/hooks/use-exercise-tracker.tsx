import { RefObject } from 'react';
import useBicepCurlTracker from './use-bicep-tracker';
import useSquatTracker from './use-squat-tracker';

/**
 * Unified exercise tracking hook that selects the appropriate tracker
 * based on the workout/exercise name
 */

type ExerciseType = 'bicep-curl' | 'squat' | 'unknown';

interface UnifiedExerciseTracker {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  counter: number;
  feedback: string;
  goodRepsInARow: number;
  avgRepSpeed: number;
  overallAccuracy: number;
  startTracking: () => void | Promise<void>;
  stopTracking: () => void;
  resetCounter: () => void;
  markWorkoutEnd: () => void;
  currentAngle?: number;
  currentKneeAngle?: number;
  stage?: 'up' | 'down' | 'standing' | 'squatting' | null;
}

/**
 * Determines the exercise type from the workout name
 */
function getExerciseType(workoutName: string): ExerciseType {
  const name = workoutName.toLowerCase();

  if (name.includes('bicep') || name.includes('curl')) {
    return 'bicep-curl';
  }

  if (name.includes('squat')) {
    return 'squat';
  }

  // Default to bicep curl for unknown exercises
  return 'unknown';
}

/**
 * Custom hook that dynamically selects and returns the appropriate exercise tracker
 * @param workoutName - Name of the current workout/exercise
 * @param videoRef - Reference to the video element
 * @param isActive - Whether tracking is currently active
 * @param onRepComplete - Callback when a rep is completed
 * @param arm - Which arm to track (for bicep curls)
 * @returns Unified exercise tracker interface
 */
export function useExerciseTracker(
  workoutName: string,
  videoRef: RefObject<HTMLVideoElement | null>,
  isActive: boolean,
  onRepComplete?: (count: number, isGoodForm: boolean) => void,
  arm: 'right' | 'left' | 'both' = 'right'
): UnifiedExerciseTracker {
  const exerciseType = getExerciseType(workoutName);

  // Use bicep curl tracker
  const bicepCurlTracker = useBicepCurlTracker(
    videoRef,
    exerciseType === 'bicep-curl' ? isActive : false,
    exerciseType === 'bicep-curl' ? onRepComplete : undefined,
    arm
  );

  // Use squat tracker
  const squatTracker = useSquatTracker(
    videoRef,
    exerciseType === 'squat' ? isActive : false,
    exerciseType === 'squat' ? onRepComplete : undefined,
    'right' // default to right leg
  );

  // Return the appropriate tracker based on exercise type
  if (exerciseType === 'bicep-curl') {
    return {
      canvasRef: bicepCurlTracker.canvasRef,
      counter: bicepCurlTracker.counter,
      feedback: bicepCurlTracker.feedback,
      goodRepsInARow: bicepCurlTracker.goodRepsInARow,
      avgRepSpeed: bicepCurlTracker.avgRepSpeed,
      overallAccuracy: bicepCurlTracker.overallAccuracy,
      startTracking: bicepCurlTracker.startTracking,
      stopTracking: bicepCurlTracker.stopTracking,
      resetCounter: bicepCurlTracker.resetCounter,
      markWorkoutEnd: bicepCurlTracker.markWorkoutEnd,
      currentAngle: bicepCurlTracker.currentAngle,
      stage: bicepCurlTracker.stage,
    };
  }

  if (exerciseType === 'squat') {
    return {
      canvasRef: squatTracker.canvasRef,
      counter: squatTracker.counter,
      feedback: squatTracker.feedback,
      goodRepsInARow: squatTracker.goodRepsInARow,
      avgRepSpeed: squatTracker.avgRepSpeed || 0,
      overallAccuracy: squatTracker.overallAccuracy,
      startTracking: squatTracker.startTracking,
      stopTracking: squatTracker.stopTracking,
      resetCounter: squatTracker.resetCounter,
      markWorkoutEnd: squatTracker.markWorkoutEnd,
      currentKneeAngle: squatTracker.currentKneeAngle,
      stage: squatTracker.stage,
    };
  }

  // Default to bicep curl for unknown exercises
  return {
    canvasRef: bicepCurlTracker.canvasRef,
    counter: bicepCurlTracker.counter,
    feedback: bicepCurlTracker.feedback,
    goodRepsInARow: bicepCurlTracker.goodRepsInARow,
    avgRepSpeed: bicepCurlTracker.avgRepSpeed,
    overallAccuracy: bicepCurlTracker.overallAccuracy,
    startTracking: bicepCurlTracker.startTracking,
    stopTracking: bicepCurlTracker.stopTracking,
    resetCounter: bicepCurlTracker.resetCounter,
    markWorkoutEnd: bicepCurlTracker.markWorkoutEnd,
    currentAngle: bicepCurlTracker.currentAngle,
    stage: bicepCurlTracker.stage,
  };
}

export default useExerciseTracker;
