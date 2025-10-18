import { useState, useEffect } from "react";

// Dummy trackEvent function. Replace this with your actual import if needed.
const trackEvent = (event: { componentName: string; eventName: string; elapsedTime?: number }) => {
  // Example: Log to the console
  // console.log(`[TrackEvent]`, event);

  // Example: Send to analytics (pseudo-code)
  // analyticsService.sendEvent(event);
};

const calculateElapsedTime = (startTime: number): number => {
  const endTime = performance.now();
  return endTime - startTime;
};

interface DelayedComponentProps {
  children: React.ReactNode;
  componentName: string;
  delay: number;
}

/**
 * A React component that delays rendering its children by a specified amount of time.
 * 
 * This component tracks and logs events for mounting, spinner display, and unmounting,
 * including elapsed time for spinner and finish events.
 *
 * @param {object} props - The props for the DelayedComponent.
 * @param {React.ReactNode} props.children - The content to render after the delay.
 * @param {string} props.componentName - The name of the component for event tracking.
 * @param {number} props.delay - The delay in milliseconds before displaying the children.
 *
 * @returns {JSX.Element | null} The rendered children after the delay, or null if not yet displayed.
 */
export const DelayedComponent = ({
  children,
  componentName,
  delay,
}: DelayedComponentProps) => {
  const [shouldDisplay, setShouldDisplay] = useState(false);
  useEffect(() => {
    const startTime = performance.now();
    // mounted
    trackEvent({
      componentName,
      eventName: 'Start',
    });
    const spinnerTimeoutReference = setTimeout(() => {
      // spinner shown
      trackEvent({
        componentName,
        eventName: 'Spinner',
        elapsedTime: calculateElapsedTime(startTime),
      });
      setShouldDisplay(true);
    }, delay);
    return () => {
      clearTimeout(spinnerTimeoutReference);
      // unmount
      trackEvent({
        componentName,
        eventName: 'Finish',
        elapsedTime: calculateElapsedTime(startTime),
      });
    };
  }, [delay, componentName]);
  if (!shouldDisplay) {
    return null;
  }
  return <>{children}</>;
};