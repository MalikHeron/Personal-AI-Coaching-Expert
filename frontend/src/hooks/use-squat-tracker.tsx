import { useRef, useState, useCallback } from 'react';
import useMediaPipe from './use-media-pipe';
import {
  calculateAngle,
  checkLandmarkVisibility,
  useFeedbackThrottle,
  useRepTracker,
  useWorkoutTimer,
  setupCanvas,
  drawPoseLandmarks,
  drawAngleBadge,
  completeCanvas,
} from './../utils';

type LegSide = 'right' | 'left' | 'both';

/**
 * Streamlined squat tracker using modular utilities
 */
export function useSquatTracker(
  videoRef: React.MutableRefObject<HTMLVideoElement | null>,
  isActive: boolean = false,
  onRepComplete?: (count: number, isGood: boolean) => void,
  leg: LegSide = 'right'
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  // State
  const [feedback, setFeedback] = useState('');
  const [currentKneeAngle, setCurrentKneeAngle] = useState(0);
  const stageRef = useRef<'standing' | 'squatting' | null>(null);
  const minAngleRef = useRef<number | null>(null);

  // Utilities
  const feedbackManager = useFeedbackThrottle(setFeedback);
  const repTracker = useRepTracker();
  const workoutTimer = useWorkoutTimer();

  /**
   * Process squat for one leg
   */
  const processSquat = useCallback(
    (landmarks: any[]) => {
      const hipIndex = leg === 'right' ? 24 : 23;
      const kneeIndex = leg === 'right' ? 26 : 25;
      const ankleIndex = leg === 'right' ? 28 : 27;

      // Check visibility
      if (!checkLandmarkVisibility(landmarks, [hipIndex, kneeIndex])) {
        feedbackManager.setFeedback('Ensure your full body is visible to the camera.');
        return;
      }

      // Get landmarks
      const hip = landmarks[hipIndex];
      const knee = landmarks[kneeIndex];
      const ankle = landmarks[ankleIndex];

      // Calculate knee angle
      const angle = calculateAngle(
        { x: hip.x, y: hip.y },
        { x: knee.x, y: knee.y },
        { x: ankle.x, y: ankle.y }
      );

      setCurrentKneeAngle(Math.round(angle));

      // Track minimum angle during squat (depth)
      if (stageRef.current === 'squatting') {
        if (minAngleRef.current === null || angle < minAngleRef.current) {
          minAngleRef.current = angle;
        }
      }

      // Form checks
      let newFeedback = '';
      const shoulderIndex = leg === 'right' ? 12 : 11;
      const shoulder = landmarks[shoulderIndex];

      // Check if knees go past toes
      const kneeOverToes = Math.abs(knee.x - ankle.x) > 0.08;
      if (kneeOverToes && stageRef.current === 'squatting') {
        newFeedback += 'Keep knees behind toes! ';
      }

      // Check back angle (chest up)
      const backAngle = Math.abs(shoulder.y - hip.y);
      if (backAngle < 0.15 && stageRef.current === 'squatting') {
        newFeedback += 'Keep chest up! ';
      }

      // Rep counting logic
      // More lenient thresholds for better detection
      const STANDING_THRESHOLD = 140; // Reduced from 150 for easier detection
      const SQUATTING_THRESHOLD = 120; // Increased from 110 for earlier detection
      const DEPTH_THRESHOLD = 110; // Increased from 100 for more realistic depth

      if (angle > STANDING_THRESHOLD) {
        // Standing position
        if (stageRef.current === 'squatting') {
          // Coming up from squat - rep complete!
          const depthAchieved = minAngleRef.current;
          const wasDeepEnough = depthAchieved !== null && depthAchieved < DEPTH_THRESHOLD;

          const repDuration =
            repTracker.repDurations.length > 0
              ? repTracker.repDurations[repTracker.repDurations.length - 1]
              : 0;

          // More lenient: count rep if depth is good OR duration is good
          const isGoodRep = (repDuration >= 1.0 && wasDeepEnough) || (repDuration >= 1.5 && depthAchieved !== null && depthAchieved < 120);

          if (repDuration < 2) {
            newFeedback += 'Slow down! ';
          } else if (!wasDeepEnough && depthAchieved !== null && depthAchieved >= 120) {
            newFeedback += 'Go deeper! ';
          } else if (isGoodRep && !newFeedback) {
            newFeedback += 'Perfect squat! ';
            if (repTracker.goodRepsInARow >= 2) {
              newFeedback = 'Excellent form!';
            }
          }

          repTracker.completeRep(isGoodRep);
          const count = repTracker.incrementCounter();

          stageRef.current = 'standing';
          minAngleRef.current = null;

          if (onRepComplete) {
            onRepComplete(count, isGoodRep);
          }
        } else if (!stageRef.current) {
          // Initial standing position
          stageRef.current = 'standing';
          if (repTracker.counter === 0) {
            workoutTimer.start();
          }
        }
      } else if (angle < SQUATTING_THRESHOLD && (stageRef.current === 'standing' || stageRef.current === null)) {
        // Going into squat - allow transition even if no stage is set
        const wasNullBefore = stageRef.current === null;
        stageRef.current = 'squatting';
        repTracker.startRep();
        minAngleRef.current = angle;
        // Start workout timer if first movement detected
        if (repTracker.counter === 0 && wasNullBefore) {
          workoutTimer.start();
        }
      }

      // Update feedback
      if (newFeedback.trim()) {
        feedbackManager.setFeedback(newFeedback.trim());
      }
    },
    [leg, feedbackManager, repTracker, workoutTimer, onRepComplete]
  );

  /**
   * Process pose results from MediaPipe
   */
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const onPoseResults = useCallback(
    (results: any) => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;

      // Reuse context instead of creating new one each frame
      if (!ctxRef.current) {
        ctxRef.current = canvas.getContext('2d', {
          alpha: false,
          desynchronized: true,
          willReadFrequently: false
        });
      }
      const ctx = ctxRef.current;
      if (!ctx) return;

      // Setup and clear canvas
      setupCanvas(canvas, ctx, results.image);

      // Draw pose
      if (results.poseLandmarks) {
        drawPoseLandmarks(ctx, canvas, results.poseLandmarks);

        // Draw knee angle
        const hipIdx = leg === 'right' ? 24 : 23;
        const kneeIdx = leg === 'right' ? 26 : 25;
        const ankleIdx = leg === 'right' ? 28 : 27;

        drawAngleBadge(
          ctx,
          canvas,
          results.poseLandmarks,
          hipIdx,
          kneeIdx,
          ankleIdx,
          leg === 'right' ? '#00CFFF' : '#FFB300'
        );

        // Process tracking if active
        if (isActiveRef.current) {
          processSquat(results.poseLandmarks);
        }
      }

      completeCanvas(ctx);
    },
    [canvasRef, isActiveRef, processSquat, leg]
  );

  // Use MediaPipe hook
  const { startTracking, stopTracking } = useMediaPipe({
    videoRef,
    onPoseResults,
  });

  // Reset function
  const resetCounter = useCallback(() => {
    stageRef.current = null;
    minAngleRef.current = null;
    repTracker.reset();
    feedbackManager.clearFeedback();
    setCurrentKneeAngle(0);
  }, [repTracker, feedbackManager]);

  // Mark workout end
  const markWorkoutEnd = useCallback(() => {
    workoutTimer.end();
  }, [workoutTimer]);

  return {
    canvasRef,
    counter: repTracker.counter,
    stage: stageRef.current,
    feedback,
    currentKneeAngle,
    goodRepsInARow: repTracker.goodRepsInARow,
    startTracking,
    stopTracking,
    resetCounter,
    totalDuration: workoutTimer.totalDuration,
    avgRepSpeed: repTracker.avgRepSpeed,
    overallAccuracy: repTracker.overallAccuracy,
    markWorkoutEnd,
    startTime: workoutTimer.startTime,
    endTime: workoutTimer.endTime,
  };
}

export default useSquatTracker;
