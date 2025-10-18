import { useRef, useEffect, useCallback, MutableRefObject } from 'react';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';

/**
 * Generic MediaPipe Pose hook for pose-based exercise tracking.
 * @param videoRef - Ref to the video element.
 * @param onPoseResults - Callback for pose results (landmarks, etc).
 * @param options - Optional MediaPipe Pose options.
 * @returns { canvasRef, startTracking, stopTracking }
 */
import type { ResultsListener, Options } from '@mediapipe/pose';

export function useMediaPipe({
  videoRef,
  onPoseResults,
  options = {},
}: {
  videoRef: MutableRefObject<HTMLVideoElement | null>;
  onPoseResults: ResultsListener;
  options?: Partial<Options>;
}) {
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const poseDeletedRef = useRef(false);

  // Initialize MediaPipe Pose
  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      ...options,
    });
    pose.onResults(onPoseResults);
    poseRef.current = pose;
    poseDeletedRef.current = false;

    // Handle tab visibility
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (cameraRef.current) {
          cameraRef.current.stop();
          cameraRef.current = null;
        }
        if (poseRef.current && !poseDeletedRef.current) {
          poseRef.current.close();
          poseDeletedRef.current = true;
        }
      } else if (document.visibilityState === 'visible') {
        if (!poseRef.current || poseDeletedRef.current) {
          const newPose = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
          });
          newPose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
            ...options,
          });
          newPose.onResults(onPoseResults);
          poseRef.current = newPose;
          poseDeletedRef.current = false;
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (poseRef.current && !poseDeletedRef.current) {
        poseRef.current.close();
        poseDeletedRef.current = true;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start pose detection
  const startTracking = useCallback(async () => {
    if (!videoRef.current || !poseRef.current) return;
    try {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (poseRef.current && videoRef.current) {
            await poseRef.current.send({ image: videoRef.current });
          }
        },
        width: 1920,
        height: 1080,
      });
      await camera.start();
      cameraRef.current = camera;
    } catch (error) {
      console.error('Error starting MediaPipe tracking:', error);
    }
  }, [videoRef]);

  // Stop pose detection
  const stopTracking = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
      if (poseRef.current && !poseDeletedRef.current) {
        poseRef.current.close();
        poseDeletedRef.current = true;
      }
    };
  }, [stopTracking]);

  return {
    canvasRef,
    startTracking,
    stopTracking,
    poseRef,
  };
}

export default useMediaPipe;