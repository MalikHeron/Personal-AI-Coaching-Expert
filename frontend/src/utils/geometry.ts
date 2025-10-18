/**
 * Geometry utilities for pose analysis
 */

interface Point {
  x: number;
  y: number;
}

/**
 * Calculate angle between three points (in degrees)
 */
export const calculateAngle = (a: Point, b: Point, c: Point): number => {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
    angle = 360 - angle;
  }

  return angle;
};

/**
 * Calculate distance between two points
 */
export const calculateDistance = (a: Point, b: Point): number => {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
};

/**
 * Check if all required landmarks are visible
 */
export const checkLandmarkVisibility = (
  landmarks: any[],
  indices: number[],
  threshold: number = 0.8
): boolean => {
  return indices.every(
    (index) => landmarks[index]?.visibility && landmarks[index].visibility > threshold
  );
};
