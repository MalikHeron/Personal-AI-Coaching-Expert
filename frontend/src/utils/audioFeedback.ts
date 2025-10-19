// Import audio files
import chestUpAudio from '@/assets/audio/chest_up.mp3';
import elbowExtensionAudio from '@/assets/audio/elbow_extension.mp3';
import excellentFormAudio from '@/assets/audio/excellent_form.mp3';
import fullArmVisibilityAudio from '@/assets/audio/full_arm_visibility.mp3';
import fullRangeMotionAudio from '@/assets/audio/full_range_motion.mp3';
import goDeeperAudio from '@/assets/audio/go_deeper.mp3';
import goodRepAudio from '@/assets/audio/good_rep.mp3';
import greatFormAudio from '@/assets/audio/great_form.mp3';
import kneesBehindToesAudio from '@/assets/audio/knees_behind_toes.mp3';
import slowDownAudio from '@/assets/audio/slow_down.mp3';
import perfectSquatAudio from '@/assets/audio/perfect_squat.mp3';
import visibilityAudio from '@/assets/audio/visibility.mp3';

/**
 * Audio feedback type mapping to audio files
 */
export type AudioFeedbackType =
  | 'chest_up'
  | 'elbow_extension'
  | 'excellent_form'
  | 'full_arm_visibility'
  | 'full_range_motion'
  | 'go_deeper'
  | 'good_rep'
  | 'great_form'
  | 'knees_behind_toes'
  | 'slow_down'
  | 'perfect_squat'
  | 'visibility';

/**
 * Audio file map for quick lookups
 */
const audioFiles: Record<AudioFeedbackType, string> = {
  chest_up: chestUpAudio,
  elbow_extension: elbowExtensionAudio,
  excellent_form: excellentFormAudio,
  full_arm_visibility: fullArmVisibilityAudio,
  full_range_motion: fullRangeMotionAudio,
  go_deeper: goDeeperAudio,
  good_rep: goodRepAudio,
  great_form: greatFormAudio,
  knees_behind_toes: kneesBehindToesAudio,
  slow_down: slowDownAudio,
  perfect_squat: perfectSquatAudio,
  visibility: visibilityAudio,
};

/**
 * Audio Player - Singleton class for managing audio playback
 */
class AudioPlayer {
  private static instance: AudioPlayer | null = null;
  private audio: HTMLAudioElement | null = null;
  private currentVolume = 0.7;
  private isCurrentlyPlaying = false;
  private lastPlayedFeedback: AudioFeedbackType | null = null;
  private lastPlayedTime = 0;
  private readonly THROTTLE_MS = 3000; // Don't replay the same audio within 3 seconds

  private constructor() {}

  static getInstance(): AudioPlayer {
    if (!AudioPlayer.instance) {
      AudioPlayer.instance = new AudioPlayer();
    }
    return AudioPlayer.instance;
  }

  async play(feedbackType: AudioFeedbackType): Promise<void> {
    try {
      const now = Date.now();

      // Throttle: Don't play the same audio if it was just played
      if (
        this.lastPlayedFeedback === feedbackType &&
        now - this.lastPlayedTime < this.THROTTLE_MS
      ) {
        console.log(`Audio "${feedbackType}" throttled - played recently`);
        return;
      }

      // Don't interrupt currently playing audio
      if (this.isCurrentlyPlaying) {
        console.log(`Audio "${feedbackType}" skipped - another audio is playing`);
        return;
      }

      // Get the audio file path
      const audioSrc = audioFiles[feedbackType];
      if (!audioSrc) {
        console.warn(`Audio file not found for feedback type: ${feedbackType}`);
        return;
      }

      // Create new audio element
      const audio = new Audio(audioSrc);
      audio.volume = this.currentVolume;
      this.audio = audio;
      this.isCurrentlyPlaying = true;
      this.lastPlayedFeedback = feedbackType;
      this.lastPlayedTime = now;

      // Play audio
      await audio.play();

      // Reset playing state when audio ends
      audio.addEventListener('ended', () => {
        this.isCurrentlyPlaying = false;
      });

      // Handle errors
      audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        this.isCurrentlyPlaying = false;
      });

    } catch (error) {
      console.error('Failed to play audio:', error);
      this.isCurrentlyPlaying = false;
    }
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isCurrentlyPlaying = false;
    }
  }

  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.currentVolume = clampedVolume;

    if (this.audio) {
      this.audio.volume = clampedVolume;
    }
  }

  getVolume(): number {
    return this.currentVolume;
  }

  isPlaying(): boolean {
    return this.isCurrentlyPlaying;
  }
}

/**
 * Get the singleton audio player instance
 */
export const audioPlayer = AudioPlayer.getInstance();

/**
 * Play audio feedback
 * @param feedbackType - Type of feedback to play
 * @example
 * import { playAudio } from '@/utils/audioFeedback';
 *
 * await playAudio('good_rep');
 */
export async function playAudio(feedbackType: AudioFeedbackType): Promise<void> {
  return audioPlayer.play(feedbackType);
}

/**
 * Stop currently playing audio
 */
export function stopAudio(): void {
  audioPlayer.stop();
}

/**
 * Set audio volume (0-1)
 */
export function setAudioVolume(volume: number): void {
  audioPlayer.setVolume(volume);
}

/**
 * Get current volume
 */
export function getAudioVolume(): number {
  return audioPlayer.getVolume();
}

/**
 * Check if audio is currently playing
 */
export function isAudioPlaying(): boolean {
  return audioPlayer.isPlaying();
}
