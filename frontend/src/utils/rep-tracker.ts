/**
 * Rep counting and metrics tracking utilities
 */

import { useRef, useState, useCallback } from 'react';

export interface RepTrackerState {
  counter: number;
  goodRepsInARow: number;
  totalGoodReps: number;
  totalReps: number;
  repDurations: number[];
  avgRepSpeed: number;
  overallAccuracy: number;
}

export interface RepTrackerActions {
  startRep: () => void;
  completeRep: (isGoodForm: boolean) => void;
  reset: () => void;
  incrementCounter: () => number;
}

export interface RepTracker extends RepTrackerState, RepTrackerActions {}

/**
 * Hook for tracking rep counts, durations, and accuracy
 */
export function useRepTracker(): RepTracker {
  const [counter, setCounter] = useState(0);
  const [goodRepsInARow, setGoodRepsInARow] = useState(0);
  const [totalGoodReps, setTotalGoodReps] = useState(0);
  const [totalReps, setTotalReps] = useState(0);
  const [repDurations, setRepDurations] = useState<number[]>([]);

  const counterRef = useRef(0);
  const goodRepsRef = useRef(0);
  const totalGoodRepsRef = useRef(0);
  const totalRepsRef = useRef(0);
  const repStartTimeRef = useRef<number | null>(null);

  const startRep = useCallback(() => {
    repStartTimeRef.current = Date.now();
  }, []);

  const completeRep = useCallback((isGoodForm: boolean) => {
    const duration = repStartTimeRef.current
      ? (Date.now() - repStartTimeRef.current) / 1000
      : 0;

    setRepDurations((prev) => [...prev, duration]);

    totalRepsRef.current += 1;
    setTotalReps(totalRepsRef.current);

    if (isGoodForm) {
      goodRepsRef.current += 1;
      totalGoodRepsRef.current += 1;
      setGoodRepsInARow(goodRepsRef.current);
      setTotalGoodReps(totalGoodRepsRef.current);
    } else {
      goodRepsRef.current = 0;
      setGoodRepsInARow(0);
    }

    repStartTimeRef.current = null;
  }, []);

  const incrementCounter = useCallback(() => {
    counterRef.current += 1;
    setCounter(counterRef.current);
    return counterRef.current;
  }, []);

  const reset = useCallback(() => {
    counterRef.current = 0;
    goodRepsRef.current = 0;
    totalGoodRepsRef.current = 0;
    totalRepsRef.current = 0;
    repStartTimeRef.current = null;

    setCounter(0);
    setGoodRepsInARow(0);
    setTotalGoodReps(0);
    setTotalReps(0);
    setRepDurations([]);
  }, []);

  const avgRepSpeed =
    repDurations.length > 0
      ? repDurations.reduce((a, b) => a + b, 0) / repDurations.length
      : 0;

  const overallAccuracy =
    totalReps > 0 ? Math.round((totalGoodReps / totalReps) * 100) : 100;

  return {
    counter,
    goodRepsInARow,
    totalGoodReps,
    totalReps,
    repDurations,
    avgRepSpeed,
    overallAccuracy,
    startRep,
    completeRep,
    incrementCounter,
    reset,
  };
}
