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
import useAudio from './use-audio';
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

  // Track consecutive visibility failures
  const visibilityFailCount = useRef(0);
  const lastVisibilityWarning = useRef(0);

  // Track consecutive form failures
  const kneeOverToesFailCount = useRef(0);
  const chestUpFailCount = useRef(0);
  const lastKneeWarning = useRef(0);
  const lastChestWarning = useRef(0);

  // Track current rep start time for accurate duration calculation
  const currentRepStartTime = useRef<number | null>(null);

  // Utilities
  const feedbackManager = useFeedbackThrottle(setFeedback);
  const repTracker = useRepTracker();
  const workoutTimer = useWorkoutTimer();
  const { play } = useAudio();

  /**
   * Process squat for one leg
   */
  type Landmark = { x: number; y: number; z?: number; visibility?: number };

  const processSquat = useCallback(
    (landmarks: Landmark[]) => {
      const hipIndex = leg === 'right' ? 24 : 23;
      const kneeIndex = leg === 'right' ? 26 : 25;
      const ankleIndex = leg === 'right' ? 28 : 27;

      // Check visibility with lower threshold (0.5 instead of 0.8)
      const isVisible = checkLandmarkVisibility(landmarks, [hipIndex, kneeIndex, ankleIndex], 0.5);

      if (!isVisible) {
        visibilityFailCount.current += 1;

        // Only warn after 30 consecutive failures (~1 second at 30fps)
        // AND only if we haven't warned in the last 5 seconds
        const now = Date.now();
        if (visibilityFailCount.current > 30 && now - lastVisibilityWarning.current > 5000) {
          feedbackManager.setFeedback('Ensure your full body is visible to the camera.');
          play('visibility');
          lastVisibilityWarning.current = now;
        }
        return;
      } else {
        // Reset fail count when visibility is good
        visibilityFailCount.current = 0;
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

      // Form checks with debouncing
      let newFeedback = '';
      const shoulderIndex = leg === 'right' ? 12 : 11;
      const shoulder = landmarks[shoulderIndex];
      const now = Date.now();

      // Check if knees go past toes (only warn if consistently bad)
      const kneeOverToes = Math.abs(knee.x - ankle.x) > 0.1; // More lenient threshold
      if (kneeOverToes && stageRef.current === 'squatting') {
        kneeOverToesFailCount.current += 1;

        // Only warn after 45 consecutive failures (~1.5 seconds at 30fps)
        // AND only if we haven't warned in the last 8 seconds
        if (kneeOverToesFailCount.current > 45 && now - lastKneeWarning.current > 8000) {
          newFeedback += 'Keep knees behind toes! ';
          play('knees_behind_toes');
          lastKneeWarning.current = now;
        }
      } else {
        kneeOverToesFailCount.current = 0;
      }

      // Check back angle (chest up) (only warn if consistently bad)
      const backAngle = Math.abs(shoulder.y - hip.y);
      if (backAngle < 0.12 && stageRef.current === 'squatting') { // More lenient threshold
        chestUpFailCount.current += 1;

        // Only warn after 45 consecutive failures (~1.5 seconds at 30fps)
        // AND only if we haven't warned in the last 8 seconds
        if (chestUpFailCount.current > 45 && now - lastChestWarning.current > 8000) {
          newFeedback += 'Keep chest up! ';
          play('chest_up');
          lastChestWarning.current = now;
        }
      } else {
        chestUpFailCount.current = 0;
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

          // Calculate CURRENT rep duration accurately
          const repDuration = currentRepStartTime.current
            ? (Date.now() - currentRepStartTime.current) / 1000
            : 0;

          // Debug logging
          console.log(`Squat completed: ${repDuration.toFixed(2)}s, depth: ${depthAchieved}° - ${wasDeepEnough ? 'DEEP ENOUGH' : 'NOT DEEP'}`);

          // More lenient: count rep if depth is good OR duration is good
          const isGoodRep = (repDuration >= 2.0 && wasDeepEnough) && !newFeedback;

          if (repDuration < 2.0) {
            newFeedback += 'Slow down! ';
            play('slow_down');
          } else if (!wasDeepEnough && depthAchieved !== null && depthAchieved >= 120) {
            newFeedback += 'Go deeper! ';
            play('go_deeper');
          } else if (isGoodRep) {
            newFeedback += 'Perfect squat! ';
            play('perfect_squat');
            if (repTracker.goodRepsInARow >= 2) {
              newFeedback = 'Excellent form!';
              play('excellent_form');
            }
          }

          repTracker.completeRep(isGoodRep);
          const count = repTracker.incrementCounter();

          stageRef.current = 'standing';
          minAngleRef.current = null;
          currentRepStartTime.current = null; // Reset for next rep

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
        currentRepStartTime.current = Date.now(); // Track start time here
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
    [leg, feedbackManager, repTracker, workoutTimer, onRepComplete, play]
  );

  /**
   * Process pose results from MediaPipe
   */
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  type PoseResults = {
    image?: HTMLVideoElement | HTMLImageElement | ImageBitmap | HTMLCanvasElement | null;
    poseLandmarks?: Landmark[] | undefined;
  };

  const onPoseResults = useCallback(
    (results: PoseResults) => {
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
  setupCanvas(canvas, ctx, results.image ?? null);

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
    processingRef: isActiveRef,
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
