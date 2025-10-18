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
  image: any
): void {
  if (image && (image.width && image.height)) {
    canvas.width = image.width;
    canvas.height = image.height;
  }

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Enable high-quality image rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw the video frame
  if (image) {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  }
}

/**
 * Draw pose landmarks with glow effect
 */
export function drawPoseLandmarks(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  landmarks: any[]
): void {
  // Draw connections
  drawConnectors(ctx, landmarks, POSE_CONNECTIONS, {
    color: '#6C63FF',
    lineWidth: 2.2,
  });

  // Draw landmark points
  drawLandmarks(ctx, landmarks, {
    color: '#43E97B',
    lineWidth: 0,
    radius: 5,
    fillColor: '#43E97B',
  });

  // Draw glow effect
  landmarks.forEach((lm) => {
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.beginPath();
    ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#43E97B';
    ctx.shadowColor = '#43E97B';
    ctx.shadowBlur = 4;
    ctx.fill();
    ctx.restore();
  });
}

/**
 * Draw angle badge at a joint
 */
export function drawAngleBadge(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  landmarks: any[],
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
