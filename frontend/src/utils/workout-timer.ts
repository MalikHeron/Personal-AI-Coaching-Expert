/**
 * Workout timing utilities
 */

import { useRef, useState, useCallback } from 'react';

export interface WorkoutTimer {
  startTime: number | null;
  endTime: number | null;
  totalDuration: number;
  start: () => void;
  end: () => void;
  reset: () => void;
}

/**
 * Hook for tracking overall workout duration
 */
export function useWorkoutTimer(): WorkoutTimer {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);

  const start = useCallback(() => {
    if (!startTimeRef.current) {
      const now = Date.now();
      startTimeRef.current = now;
      setStartTime(now);
      endTimeRef.current = null;
      setEndTime(null);
    }
  }, []);

  const end = useCallback(() => {
    if (startTimeRef.current && !endTimeRef.current) {
      const now = Date.now();
      endTimeRef.current = now;
      setEndTime(now);
    }
  }, []);

  const reset = useCallback(() => {
    startTimeRef.current = null;
    endTimeRef.current = null;
    setStartTime(null);
    setEndTime(null);
  }, []);

  const totalDuration =
    startTimeRef.current && !endTimeRef.current
      ? (Date.now() - startTimeRef.current) / 1000
      : startTimeRef.current && endTimeRef.current
      ? (endTimeRef.current - startTimeRef.current) / 1000
      : 0;

  return {
    startTime,
    endTime,
    totalDuration,
    start,
    end,
    reset,
  };
}
