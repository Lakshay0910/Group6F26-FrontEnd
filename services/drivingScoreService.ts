
import type { GPSPoint } from './locationService';

// Represents the calculated driving behaviour for a trip.
export type DrivingStats = {
  harshBraking: number;
  rapidAcceleration: number;
  suddenMovements: number;
  validSamples: number;
  score: number | null;
};

// Prototype event detection thresholds.
const BRAKING_THRESHOLD = -3.5;
const ACCELERATION_THRESHOLD = 3.0;
const EVENT_COOLDOWN_MS = 3000;

// Analyse recorded GPS points and calculate driving statistics.
export function calculateDrivingScore(
  route: GPSPoint[],
  distanceKm: number,
  suddenMovements: number = 0
): DrivingStats {

  let harshBraking = 0;
  let rapidAcceleration = 0;
  let validSamples = 0;

  let lastBrakingTime = -Infinity;
  let lastAccelerationTime = -Infinity;

  // Compare each GPS reading with the previous reading.
  for (let i = 1; i < route.length; i++) {

    const previous = route[i - 1];
    const current = route[i];

    // Skip readings where GPS speed is unavailable.
    if (
      previous.speedKmh === null ||
      current.speedKmh === null
    ) {
      continue;
    }

    // Reject invalid or implausible speed readings.
    if (
      !Number.isFinite(previous.speedKmh) ||
      !Number.isFinite(current.speedKmh) ||
      previous.speedKmh < 0 ||
      current.speedKmh < 0 ||
      previous.speedKmh > 200 ||
      current.speedKmh > 200
    ) {
      continue;
    }

    // Calculate elapsed time in seconds.
    const elapsedSeconds =
      (current.timestamp - previous.timestamp) / 1000;

    // Ignore readings that are too close or too far apart.
    if (elapsedSeconds < 0.5 || elapsedSeconds > 5) {
      continue;
    }

    // Convert speed from km/h to metres per second.
    const previousSpeed = previous.speedKmh / 3.6;
    const currentSpeed = current.speedKmh / 3.6;

    // Calculate acceleration in m/s².
    const acceleration =
      (currentSpeed - previousSpeed) / elapsedSeconds;

    // Reject extreme readings likely caused by GPS errors.
    if (Math.abs(acceleration) > 12) {
      continue;
    }

    validSamples++;

    // Detect potential harsh braking.
    if (
      acceleration <= BRAKING_THRESHOLD &&
      current.timestamp - lastBrakingTime >= EVENT_COOLDOWN_MS
    ) {
      harshBraking++;
      lastBrakingTime = current.timestamp;
    }

    // Detect potential rapid acceleration.
    if (
      acceleration >= ACCELERATION_THRESHOLD &&
      current.timestamp - lastAccelerationTime >= EVENT_COOLDOWN_MS
    ) {
      rapidAcceleration++;
      lastAccelerationTime = current.timestamp;
    }
  }

  // Calculate the total driving penalty.
  const penalty =
    harshBraking * 5 +
    rapidAcceleration * 3;

  // Normalize penalties for longer trips.
  const distanceFactor = Math.max(1, distanceKm / 10);

  // Do not award a score when there is insufficient GPS data.
  const score =
    validSamples >= 10 && distanceKm >= 0.5
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(100 - penalty / distanceFactor)
          )
        )
      : null;

  return {
    harshBraking,
    rapidAcceleration,
    suddenMovements,
    validSamples,
    score,
  };
}
