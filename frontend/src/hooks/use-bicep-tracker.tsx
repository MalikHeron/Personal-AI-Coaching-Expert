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

  // Utilities
  const feedbackManager = useFeedbackThrottle(setFeedback);
  const repTracker = useRepTracker();
  const workoutTimer = useWorkoutTimer();

  /**
   * Process bicep curl for one arm
   */
  const processBicepCurl = useCallback(
    (landmarks: any[]) => {
      const shoulderIndex = arm === 'right' ? 12 : 11;
      const elbowIndex = arm === 'right' ? 14 : 13;
      const wristIndex = arm === 'right' ? 16 : 15;

      // Check visibility
      if (!checkLandmarkVisibility(landmarks, [shoulderIndex, elbowIndex, wristIndex])) {
        feedbackManager.setFeedback('Ensure your full arm is visible to the camera.');
        return;
      }

      // Get landmarks
      const shoulder = landmarks[shoulderIndex];
      const elbow = landmarks[elbowIndex];
      const wrist = landmarks[wristIndex];

      // Calculate angle
      const angle = calculateAngle(
        { x: shoulder.x, y: shoulder.y },
        { x: elbow.x, y: elbow.y },
        { x: wrist.x, y: wrist.y }
      );

      setCurrentAngle(Math.round(angle));

      // Form checks
      let newFeedback = '';
      const shoulderToElbowDistance = Math.abs(elbow.y - shoulder.y);
      const elbowToWristDistance = Math.abs(wrist.y - elbow.y);

      if (shoulderToElbowDistance > 0.2) {
        newFeedback += 'Avoid overextending your elbow! ';
      }

      if (elbowToWristDistance < 0.1) {
        newFeedback += 'Ensure a full range of motion! ';
      }

      // Rep counting logic
      if (angle > 165) {
        // Arm extended (down position)
        if (stageRef.current !== 'down') {
          stageRef.current = 'down';
          repTracker.startRep();

          // Start workout timer on first rep
          if (repTracker.counter === 0) {
            workoutTimer.start();
          }
        }
      } else if (angle < 35 && stageRef.current === 'down') {
        // Arm curled (up position) - rep complete!
        const repDuration =
          repTracker.repDurations.length > 0
            ? repTracker.repDurations[repTracker.repDurations.length - 1]
            : 0;

        const isGoodRep = repDuration >= 1.0 && !newFeedback;

        if (repDuration < 1.0) {
          newFeedback += 'Slow down! ';
        } else if (isGoodRep) {
          newFeedback += 'Good rep! ';
          if (repTracker.goodRepsInARow >= 2) {
            newFeedback = 'Great form! Keep it up!';
          }
        }

        repTracker.completeRep(isGoodRep);
        const count = repTracker.incrementCounter();

        stageRef.current = 'up';

        if (onRepComplete) {
          onRepComplete(count, isGoodRep);
        }
      }

      // Update feedback
      if (newFeedback.trim()) {
        feedbackManager.setFeedback(newFeedback.trim());
      }
    },
    [arm, feedbackManager, repTracker, workoutTimer, onRepComplete]
  );

  /**
   * Process pose results from MediaPipe
   */
  const onPoseResults = useCallback(
    (results: any) => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', {
        alpha: false,
        desynchronized: true
      });
      if (!ctx) return;

      // Setup and clear canvas
      setupCanvas(canvas, ctx, results.image);

      // Draw pose
      if (results.poseLandmarks) {
        drawPoseLandmarks(ctx, canvas, results.poseLandmarks);

        // Draw elbow angle
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

        // Process tracking if active
        if (isActiveRef.current) {
          processBicepCurl(results.poseLandmarks);
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
