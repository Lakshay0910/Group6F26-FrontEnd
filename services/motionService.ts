
import { DeviceMotion } from 'expo-sensors';

// Statistics collected from the phone's motion sensors.
export type MotionStats = {
  samples: number;
  currentAcceleration: number;
  maxAcceleration: number;
  rotationRate: number;
  suddenMovements: number;
};

// Represents an active motion sensor subscription.
export type MotionSubscription = {
  remove: () => void;
};

// Create fresh statistics for every trip.
export function createMotionStats(): MotionStats {
  return {
    samples: 0,
    currentAcceleration: 0,
    maxAcceleration: 0,
    rotationRate: 0,
    suddenMovements: 0,
  };
}

// Check sensor availability and request permission.
export async function requestMotionPermission(): Promise<boolean> {
  const available = await DeviceMotion.isAvailableAsync();

  if (!available) {
    return false;
  }

  const permission =
    await DeviceMotion.requestPermissionsAsync();

  return permission.granted;
}

// Start collecting motion sensor readings.
export function startMotionTracking(
  onUpdate: (stats: MotionStats) => void
): MotionSubscription {

  const stats = createMotionStats();

  let lastEventTime = 0;
  let movementActive = false;

  // Initial prototype detection settings.
  const accelerationThreshold = 3.0;
  const resetThreshold = 1.5;
  const eventCooldown = 2000;

  // Request 10 sensor readings per second.
  DeviceMotion.setUpdateInterval(100);

  return DeviceMotion.addListener((measurement) => {

    // Acceleration with gravity removed.
    const acceleration = measurement.acceleration;

    if (!acceleration) {
      return;
    }

    const { x, y, z } = acceleration;

    // Calculate overall acceleration magnitude in m/s².
    const magnitude = Math.sqrt(
      x * x + y * y + z * z
    );

    if (!Number.isFinite(magnitude)) {
      return;
    }

    stats.samples += 1;
    stats.currentAcceleration = magnitude;

    stats.maxAcceleration = Math.max(
      stats.maxAcceleration,
      magnitude
    );

    // Calculate overall rotational movement in degrees/sec.
    const rotation = measurement.rotationRate;

    if (rotation) {
      stats.rotationRate = Math.sqrt(
        rotation.alpha ** 2 +
        rotation.beta ** 2 +
        rotation.gamma ** 2
      );
    }

    const now = Date.now();

    // Detect sudden movement without repeatedly
    // counting the same continuous event.
    if (
      magnitude >= accelerationThreshold &&
      !movementActive
    ) {
      movementActive = true;

      if (now - lastEventTime >= eventCooldown) {
        stats.suddenMovements += 1;
        lastEventTime = now;
      }
    }

    // Allow a new event after acceleration settles.
    if (magnitude <= resetThreshold) {
      movementActive = false;
    }

    // Send a snapshot of the latest statistics.
    onUpdate({ ...stats });
  });
}

// Stop receiving motion sensor readings.
export function stopMotionTracking(
  subscription: MotionSubscription | null
): void {
  subscription?.remove();
}
