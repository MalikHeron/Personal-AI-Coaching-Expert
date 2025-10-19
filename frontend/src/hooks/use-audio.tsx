/**
 * Re-export audio utilities as a simple object
 * This bypasses React Compiler issues by not using any React hooks
 */
export {
  playAudio,
  stopAudio,
  setAudioVolume,
  getAudioVolume,
  isAudioPlaying,
  audioPlayer,
  type AudioFeedbackType
} from '@/utils/audioFeedback';

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
    play: async (feedbackType: any) => {
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
