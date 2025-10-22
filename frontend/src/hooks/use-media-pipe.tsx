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
  // processingRef allows callers to enable/disable calling pose.send()
  processingRef,
}: {
  videoRef: MutableRefObject<HTMLVideoElement | null>;
  onPoseResults: ResultsListener;
  options?: Partial<Options>;
  processingRef?: MutableRefObject<boolean | undefined>;
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
      modelComplexity: 0,
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
            modelComplexity: 0,
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

  // Keep pose result listener up-to-date when onPoseResults changes.
  // If the callback changes (for example when switching exercises)
  // we must rebind it to the existing Pose instance to avoid
  // calling a stale handler which can cause missed rep completions
  // or missing rest timer transitions.
  useEffect(() => {
    if (poseRef.current) {
      try {
        poseRef.current.onResults(onPoseResults);
        console.debug('useMediaPipe: updated pose.onResults listener');
      } catch (e) {
        console.warn('useMediaPipe: failed to update pose.onResults', e);
      }
    }
  }, [onPoseResults]);

  // Start pose detection
  const startTracking = useCallback(async () => {
    if (!videoRef.current || !poseRef.current) return;

    // Defensive: if a camera is already active, don't create another one.
    if (cameraRef.current) {
      console.debug('useMediaPipe.startTracking: camera already started - skipping new start');
      return;
    }

    try {
      let frameCount = 0;
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          // Process every 2nd frame to reduce load (skip frames)
          frameCount++;
          if (frameCount % 2 !== 0) return;

          // If a processingRef is provided and processing is disabled,
          // still call onPoseResults with the latest video frame so the
          // canvas can be updated with the video. This avoids freezing the
          // visual while skipping heavy pose computations.
          if (processingRef && processingRef.current === false) {
            if (videoRef.current) {
              // Call the results listener directly with only the image
              // Use a narrow local type to avoid 'any' while keeping compatibility.
              const partial: Partial<{ image: HTMLVideoElement }> = { image: videoRef.current };
              onPoseResults(partial as unknown as Parameters<ResultsListener>[0]);
            }
            return;
          }

          if (poseRef.current && videoRef.current) {
            await poseRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });
      await camera.start();
      cameraRef.current = camera;
      console.debug('useMediaPipe.startTracking: camera started');
    } catch (error) {
      console.error('Error starting MediaPipe tracking:', error);
    }
  }, [videoRef, processingRef, onPoseResults]);

  // Stop pose detection
  const stopTracking = useCallback(() => {
    if (cameraRef.current) {
      try {
        cameraRef.current.stop();
      } catch (e) {
        console.warn('useMediaPipe.stopTracking: camera.stop() threw', e);
      }
      cameraRef.current = null;
      console.debug('useMediaPipe.stopTracking: camera stopped');
    } else {
      console.debug('useMediaPipe.stopTracking: no active camera to stop');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.debug('useMediaPipe cleanup: stopping tracking and closing pose');
      stopTracking();
      if (poseRef.current && !poseDeletedRef.current) {
        try {
          poseRef.current.close();
        } catch (e) {
          console.warn('useMediaPipe cleanup: pose.close() threw', e);
        }
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