import type { AudioFeedbackType } from '@/utils/audioFeedback';

/**
 * Simple audio utilities object for use in trackers
 *
 * @example
 * import { useAudio } from '@/hooks/use-audio';
 *
 * const audio = useAudio();
 * await audio.play('good_rep');
 * audio.setVolume(0.5);
 * audio.stop();
 */
export function useAudio() {
  return {
    play: async (feedbackType: AudioFeedbackType) => {
      const { playAudio } = await import('@/utils/audioFeedback');
      return playAudio(feedbackType);
    },
    stop: async () => {
      const { stopAudio } = await import('@/utils/audioFeedback');
      return stopAudio();
    },
    setVolume: async (volume: number) => {
      const { setAudioVolume } = await import('@/utils/audioFeedback');
      return setAudioVolume(volume);
    },
    getVolume: async () => {
      const { getAudioVolume } = await import('@/utils/audioFeedback');
      return getAudioVolume();
    },
    isPlaying: async () => {
      const { isAudioPlaying } = await import('@/utils/audioFeedback');
      return isAudioPlaying();
    }
  };
}

export default useAudio;
