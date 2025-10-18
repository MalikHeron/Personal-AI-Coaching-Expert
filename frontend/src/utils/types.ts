/**
 * Shared types for exercise tracking
 */

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export type Side = 'right' | 'left' | 'both';

export interface RepMetrics {
  duration: number;
  isGoodForm: boolean;
  depth?: number;
  angle?: number;
}

export interface ExerciseState {
  counter: number;
  feedback: string;
  currentAngle: number;
  goodRepsInARow: number;
  totalGoodReps: number;
  totalReps: number;
  repDurations: number[];
  stage: string | null;
}

export interface DualSideState {
  right: ExerciseState;
  left: ExerciseState;
}
