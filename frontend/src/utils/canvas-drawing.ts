/**
 * Canvas drawing utilities for pose visualization
 */

import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS } from '@mediapipe/pose';
import { calculateAngle } from './geometry';

/**
 * Setup canvas and clear it with high-quality rendering
 */
export function setupCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  image: HTMLVideoElement | HTMLImageElement | ImageBitmap | HTMLCanvasElement | null
): void {
  // Only update canvas size when it actually differs to avoid forcing layout
  if (image && (image.width && image.height)) {
    if (canvas.width !== image.width || canvas.height !== image.height) {
      canvas.width = image.width;
      canvas.height = image.height;
    }
  }

  // Avoid repeated save/restore pairings that may be expensive; caller will
  // pair setup/complete around each frame. Clear area efficiently.
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Enable reasonable image smoothing; keep cost moderate
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'medium';

  // Draw only the video frame here. Heavy landmark drawing is handled
  // separately so callers can skip it when tracking is paused.
  if (image) {
    try {
      ctx.drawImage(image as HTMLVideoElement, 0, 0, canvas.width, canvas.height);
    } catch {
      // drawing may fail if video/canvas are not ready; swallow to avoid crash
    }
  }
}

/**
 * Draw pose landmarks with glow effect
 */
export function drawPoseLandmarks(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  landmarks: Array<{ x: number; y: number }>
): void {
  // Draw connections
  // Use mediapipe helpers for connectors/landmarks (kept minimal)
  drawConnectors(ctx, landmarks, POSE_CONNECTIONS, {
    color: '#6C63FF',
    lineWidth: 1.6,
  });

  drawLandmarks(ctx, landmarks, {
    color: '#43E97B',
    lineWidth: 0,
    radius: 4,
    fillColor: '#43E97B',
  });

  // Lightweight glow effect (avoid expensive shadow ops per landmark)
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#43E97B';
  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    ctx.beginPath();
    ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 8, 0, 2 * Math.PI);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Draw angle badge at a joint
 */
export function drawAngleBadge(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  landmarks: Array<{ x: number; y: number }>,
  pointAIndex: number,
  pointBIndex: number,
  pointCIndex: number,
  color: string = '#00CFFF'
): void {
  const a = landmarks[pointAIndex];
  const b = landmarks[pointBIndex];
  const c = landmarks[pointCIndex];

  if (!a || !b || !c) return;

  const angle = calculateAngle(
    { x: a.x, y: a.y },
    { x: b.x, y: b.y },
    { x: c.x, y: c.y }
  );

  const angleText = Math.round(angle) + '°';
  const x = b.x * canvas.width;
  const y = b.y * canvas.height;

  ctx.save();
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.beginPath();
  ctx.arc(x, y - 20, 16, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = color;
  ctx.fillText(angleText, x, y - 20);
  ctx.restore();
}

/**
 * Complete canvas drawing
 */
export function completeCanvas(ctx: CanvasRenderingContext2D): void {
  ctx.restore();
}
