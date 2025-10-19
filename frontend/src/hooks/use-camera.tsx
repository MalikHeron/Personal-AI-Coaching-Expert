import { useRef, useState, useEffect } from 'react';

/**
 * Custom React hook to manage camera access and video stream for a component.
 *
 * This hook attempts to enable the user's camera and provides a ref to attach to a `<video>` element.
 * It handles loading state, error reporting, and cleans up the camera stream on unmount.
 *
 * @returns An object containing:
 * - `videoRef`: A React ref to be attached to a `<video>` element for displaying the camera stream.
 * - `isLoading`: Boolean indicating if the camera is currently being enabled.
 * - `error`: String containing any error message encountered while accessing the camera.
 * - `isCameraOn`: Boolean indicating if the camera is currently active.
 *
 * @example
 * ```tsx
 * const { videoRef, isLoading, error, isCameraOn } = useCamera();
 * return (
 *   <div>
 *     {isLoading && <span>Loading camera...</span>}
 *     {error && <span>{error}</span>}
 *     <video ref={videoRef} autoPlay playsInline />
 *   </div>
 * );
 * ```
 */
export default function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    const stream = streamRef.current || (videoRef.current?.srcObject as MediaStream | null);
    if (stream) {
      stream.getTracks().forEach(track => {
        try { track.stop(); } catch { /* ignore */ }
      });
    }
    if (videoRef.current) {
      try { videoRef.current.pause(); } catch { /* ignore */ }
      // Clearing srcObject helps some browsers release the camera sooner
      videoRef.current.srcObject = null;
    }
    streamRef.current = null;
    setIsCameraOn(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    const enableCamera = async () => {
      setIsLoading(true);
      setError('');

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: "user" } },
          audio: false,
        });
        streamRef.current = stream;
        setIsCameraOn(true);
      } catch {
        // Try fallback without exact facingMode
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          streamRef.current = stream;
          setIsCameraOn(true);
          setIsLoading(false);
        } catch {
          setError("Unable to access camera.");
          setIsCameraOn(false);
          setIsLoading(false);
          return;
        }
      }
      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        setIsCameraOn(true);
        // Some browsers require play() to be called
        videoRef.current.play().catch(() => { });
      }
    };
    enableCamera();
    const onPageHide = () => stopCamera();
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        stopCamera();
      }
    };
    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', onPageHide);
      document.removeEventListener('visibilitychange', onVisibility);
      stopCamera();
    };
  }, []);

  return {
    videoRef,
    isLoading,
    error,
    isCameraOn,
    stopCamera,
  };
};