/**
 * Feedback management utilities
 */

import { useRef, useCallback } from 'react';

export interface FeedbackManager {
  setFeedback: (feedback: string) => void;
  clearFeedback: () => void;
  cleanup: () => void;
}

/**
 * Hook for managing throttled feedback
 * Prevents feedback spam by only showing messages that repeat or are positive
 */
export function useFeedbackThrottle(
  setFeedbackState: (feedback: string) => void,
  positiveDuration: number = 1500,
  negativeDuration: number = 1000
): FeedbackManager {
  const lastFeedbackRef = useRef('');
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setFeedback = useCallback(
    (newFeedback: string) => {
      // Clear any existing timer
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = null;
      }

      // Empty feedback - clear it
      if (!newFeedback) {
        setFeedbackState('');
        lastFeedbackRef.current = '';
        return;
      }

      const trimmed = newFeedback.trim();

      // Positive messages (always show)
      const isPositive =
        trimmed.includes('Good') ||
        trimmed.includes('Great') ||
        trimmed.includes('Perfect') ||
        trimmed.includes('Excellent');

      if (isPositive || trimmed !== lastFeedbackRef.current) {
        lastFeedbackRef.current = trimmed;
        setFeedbackState(trimmed);

        // Auto-clear after duration
        feedbackTimeoutRef.current = setTimeout(() => {
          setFeedbackState('');
          lastFeedbackRef.current = '';
        }, isPositive ? positiveDuration : negativeDuration);
      }
    },
    [setFeedbackState, positiveDuration, negativeDuration]
  );

  const clearFeedback = useCallback(() => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
    setFeedbackState('');
    lastFeedbackRef.current = '';
  }, [setFeedbackState]);

  const cleanup = useCallback(() => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
  }, []);

  return {
    setFeedback,
    clearFeedback,
    cleanup,
  };
}
