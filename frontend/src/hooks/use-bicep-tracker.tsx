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

type ArmSide = 'right' | 'left' | 'both';

/**
 * Streamlined bicep curl tracker using modular utilities
 */
export function useBicepCurlTracker(
  videoRef: React.MutableRefObject<HTMLVideoElement | null>,
  isActive: boolean = false,
  onRepComplete?: (count: number, isGood: boolean) => void,
  arm: ArmSide = 'right'
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isActiveRef = useRef<boolean>(isActive);
  isActiveRef.current = isActive;

  // State
  const [feedback, setFeedback] = useState('');
  const [currentAngle, setCurrentAngle] = useState(0);
  const stageRef = useRef<'up' | 'down' | null>(null);

  // Track consecutive visibility failures
  const visibilityFailCount = useRef(0);
  const lastVisibilityWarning = useRef(0);

  // Track consecutive form failures
  const elbowExtensionFailCount = useRef(0);
  const rangeOfMotionFailCount = useRef(0);
  const lastElbowWarning = useRef(0);
  const lastRangeWarning = useRef(0);

  // Track current rep start time for accurate duration calculation
  const currentRepStartTime = useRef<number | null>(null);

  // Small smoothing + hysteresis to avoid jitter around thresholds
  const smoothedAngleRef = useRef<number | null>(null);
  const downFramesRef = useRef(0);
  const upFramesRef = useRef(0);
  const CONSECUTIVE_FRAMES = 3; // require 3 consecutive frames to flip state
  const SMOOTHING_ALPHA = 0.3; // exponential smoothing weight for new angle

  // Utilities
  const feedbackManager = useFeedbackThrottle(setFeedback);
  const repTracker = useRepTracker();
  const workoutTimer = useWorkoutTimer();

  // Audio helpers (must be called inside hook body)
  const { play } = useAudio();

  /**
   * Process bicep curl for one arm
   */
  type Landmark = { x: number; y: number; z?: number; visibility?: number };
  const processBicepCurl = useCallback(
    (landmarks: Landmark[]) => {
      // Defensive: ensure landmark array exists and has content
      if (!landmarks || !Array.isArray(landmarks) || landmarks.length === 0) return;

      const shoulderIndex = arm === 'right' ? 12 : 11;
      const elbowIndex = arm === 'right' ? 14 : 13;
      const wristIndex = arm === 'right' ? 16 : 15;

      if (arm === 'both') {
        // Hook is intended to track a single arm. Default to right if 'both' passed.
        // This avoids unexpected index selection and miscalculations.
        // If you want both-arms tracking, use two instances of the hook or implement
        // separate handling here.
        console.warn("useBicepCurlTracker: 'both' arm mode currently defaults to 'right'. Use two trackers for both arms.");
      }

      // Check visibility with lower threshold (0.5 instead of 0.8)
      const isVisible = checkLandmarkVisibility(landmarks, [shoulderIndex, elbowIndex, wristIndex], 0.5);

      if (!isVisible) {
        visibilityFailCount.current += 1;

        // Only warn after 30 consecutive failures (~1 second at 30fps)
        // AND only if we haven't warned in the last 5 seconds
        const now = Date.now();
        if (visibilityFailCount.current > 30 && now - lastVisibilityWarning.current > 5000) {
          feedbackManager.setFeedback('Ensure your full arm is visible to the camera.');
          play('full_arm_visibility');
          lastVisibilityWarning.current = now;
        }
        return;
      } else {
        // Reset fail count when visibility is good
        visibilityFailCount.current = 0;
      }

      // Get landmarks and guard against missing values
      const shoulder = landmarks[shoulderIndex];
      const elbow = landmarks[elbowIndex];
      const wrist = landmarks[wristIndex];
      if (!shoulder || !elbow || !wrist) return;
      if (typeof shoulder.x !== 'number' || typeof shoulder.y !== 'number') return;
      if (typeof elbow.x !== 'number' || typeof elbow.y !== 'number') return;
      if (typeof wrist.x !== 'number' || typeof wrist.y !== 'number') return;

      // Calculate raw angle and guard against invalid results
      const rawAngle = calculateAngle(
        { x: shoulder.x, y: shoulder.y },
        { x: elbow.x, y: elbow.y },
        { x: wrist.x, y: wrist.y }
      );
      if (!isFinite(rawAngle)) return;

      // Exponential smoothing to reduce jitter around thresholds
      const prev = smoothedAngleRef.current;
      const smoothed = prev == null ? rawAngle : SMOOTHING_ALPHA * rawAngle + (1 - SMOOTHING_ALPHA) * prev;
      smoothedAngleRef.current = smoothed;
      setCurrentAngle(Math.round(smoothed));

      // Form checks with debouncing
      let newFeedback = '';
      // Use Euclidean distances and make checks scale-invariant by normalizing
      // to the full arm length (shoulder -> wrist). MediaPipe landmarks are
      // normalized to the image, so these ratios work across different camera
      // distances and resolutions.
      const armLength = Math.hypot(wrist.x - shoulder.x, wrist.y - shoulder.y);
      const shoulderToElbowDistance = Math.hypot(elbow.x - shoulder.x, elbow.y - shoulder.y);
      const elbowToWristDistance = Math.hypot(wrist.x - elbow.x, wrist.y - elbow.y);

      // If armLength is extremely small (bad detection), bail out to avoid div-by-zero
      if (armLength < 1e-6) return;

      const relShoulderToElbow = shoulderToElbowDistance / armLength; // ratio
      const relElbowToWrist = elbowToWristDistance / armLength; // ratio
      const now = Date.now();

      // Check elbow extension (only warn if consistently bad)
      // Use scale-invariant thresholds (tuned conservatively)
      // If the elbow is relatively far from the shoulder (large relShoulderToElbow)
      // it may indicate overextension.
      if (relShoulderToElbow > 0.6) {
        elbowExtensionFailCount.current += 1;

        // Only warn after consecutive failures and debounce warnings
        if (elbowExtensionFailCount.current > 45 && now - lastElbowWarning.current > 8000) {
          newFeedback += 'Avoid overextending your elbow! ';
          play('elbow_extension');
          lastElbowWarning.current = now;
        }
      } else {
        elbowExtensionFailCount.current = 0;
      }

      // Check range of motion (only warn if consistently bad)
      // If the elbow-to-wrist distance is very small relative to arm length,
      // it likely indicates an incomplete curl (poor range of motion).
      if (relElbowToWrist < 0.15) {
        rangeOfMotionFailCount.current += 1;

        if (rangeOfMotionFailCount.current > 45 && now - lastRangeWarning.current > 8000) {
          newFeedback += 'Ensure a full range of motion! ';
          play('full_range_motion');
          lastRangeWarning.current = now;
        }
      } else {
        rangeOfMotionFailCount.current = 0;
      }

      // Rep counting logic
      // Use smoothed angle for stage transitions and require a few consecutive
      // frames to reduce false positives from jitter.
      if (smoothed > 165) {
        downFramesRef.current += 1;
      } else {
        downFramesRef.current = 0;
      }

      if (smoothed < 35) {
        upFramesRef.current += 1;
      } else {
        upFramesRef.current = 0;
      }

      // Arm extended (down position)
      if (downFramesRef.current >= CONSECUTIVE_FRAMES && stageRef.current !== 'down') {
        stageRef.current = 'down';
        currentRepStartTime.current = Date.now(); // Track start time here
        repTracker.startRep();

        // Start workout timer on first rep
        if (repTracker.counter === 0) {
          workoutTimer.start();
        }
      }

      // Arm curled (up position) - rep complete when we have enough consecutive up frames
      else if (upFramesRef.current >= CONSECUTIVE_FRAMES && stageRef.current === 'down') {
        // Arm curled (up position) - rep complete!

        // Calculate CURRENT rep duration accurately
        const repDuration = currentRepStartTime.current
          ? (Date.now() - currentRepStartTime.current) / 1000
          : 0;

        const isGoodRep = repDuration >= 1.0 && !newFeedback;

        // Debug logging
        console.log(`Rep completed: ${repDuration.toFixed(2)}s - ${isGoodRep ? 'GOOD' : 'BAD'}`);

        if (repDuration < 1.0) {
          newFeedback += 'Slow down! ';
          play('slow_down');
        } else if (isGoodRep) {
          newFeedback += 'Good rep! ';
          play('good_rep');
          if (repTracker.goodRepsInARow >= 2) {
            newFeedback = 'Great form! Keep it up!';
            play('great_form');
          }
        }

        repTracker.completeRep(isGoodRep);
        const count = repTracker.incrementCounter();

        stageRef.current = 'up';
        currentRepStartTime.current = null; // Reset for next rep

        if (onRepComplete) {
          onRepComplete(count, isGoodRep);
        }
      }

      // Update feedback
      if (newFeedback.trim()) {
        feedbackManager.setFeedback(newFeedback.trim());
      }
    },
    [arm, feedbackManager, repTracker, workoutTimer, onRepComplete, play]
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

      // Setup and clear canvas (results.image may be undefined for some buffers)
      setupCanvas(canvas, ctx, results.image ?? null);

      // Draw pose landmarks only when necessary. During rest or when
      // tracking is paused, keep drawing minimal (just the video frame)
      // to avoid heavy CPU work that can cause video lag.
      if (results.poseLandmarks) {
        if (isActiveRef.current) {
          // Active tracking: draw landmarks and badges and process reps
          drawPoseLandmarks(ctx, canvas, results.poseLandmarks);

          const shoulderIdx = arm === 'right' ? 12 : 11;
          const elbowIdx = arm === 'right' ? 14 : 13;
          const wristIdx = arm === 'right' ? 16 : 15;

          drawAngleBadge(
            ctx,
            canvas,
            results.poseLandmarks,
            shoulderIdx,
            elbowIdx,
            wristIdx,
            arm === 'right' ? '#00CFFF' : '#FFB300'
          );

          processBicepCurl(results.poseLandmarks);
        } else {
          // Inactive: optionally draw very lightweight markers (e.g., a few keypoints)
          // but avoid drawConnectors/drawLandmarks to reduce CPU. We'll draw nothing
          // here so the canvas shows only the video frame from setupCanvas.
        }
      }

      completeCanvas(ctx);
    },
    [canvasRef, isActiveRef, processBicepCurl, arm]
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
    repTracker.reset();
    feedbackManager.clearFeedback();
    setCurrentAngle(0);
  }, [repTracker, feedbackManager]);

  // Mark workout end
  const markWorkoutEnd = useCallback(() => {
    workoutTimer.end();
  }, [workoutTimer]);

  // Cleanup
  // useEffect(() => () => feedbackManager.cleanup(), [feedbackManager]);

  return {
    canvasRef,
    counter: repTracker.counter,
    stage: stageRef.current,
    feedback,
    currentAngle,
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

export default useBicepCurlTracker;
