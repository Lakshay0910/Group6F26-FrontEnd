
import * as Location from 'expo-location';

// Represents a single GPS reading during a trip.
export type GPSPoint = {
  latitude: number;
  longitude: number;
  speedKmh: number | null;
  accuracy: number;
  timestamp: number;
};

// Statistics collected throughout a trip.
export type GPSStats = {
  distanceKm: number;
  currentSpeedKmh: number | null;
  maxSpeedKmh: number;
  route: GPSPoint[];
};

// Request permission before accessing the driver's location.
export async function requestLocationPermission(): Promise<boolean> {
  const permission =
    await Location.requestForegroundPermissionsAsync();

  return permission.granted;
}

// Calculate the distance between two GPS coordinates
// using the Haversine formula.
export function calculateDistance(
  first: GPSPoint,
  second: GPSPoint
): number {
  const earthRadiusKm = 6371;

  const toRadians = (degrees: number) =>
    degrees * (Math.PI / 180);

  const latitudeDifference = toRadians(
    second.latitude - first.latitude
  );

  const longitudeDifference = toRadians(
    second.longitude - first.longitude
  );

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(first.latitude)) *
      Math.cos(toRadians(second.latitude)) *
      Math.sin(longitudeDifference / 2) ** 2;

  return (
    earthRadiusKm *
    2 *
    Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)))
  );
}

// Create a fresh statistics object for every new trip.
export function createGPSStats(): GPSStats {
  return {
    distanceKm: 0,
    currentSpeedKmh: null,
    maxSpeedKmh: 0,
    route: [],
  };
}

// Subscribe to GPS updates while the application is open.
export async function startGPSTracking(
  onUpdate: (stats: GPSStats) => void
): Promise<Location.LocationSubscription> {
  const stats = createGPSStats();

  let previousPoint: GPSPoint | null = null;

  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 1000,
      distanceInterval: 5,
    },
    (location) => {
      const { coords, timestamp } = location;

      // Ignore unreliable GPS readings.
      if (coords.accuracy === null || coords.accuracy > 25) {
        return;
      }

      // Convert speed from metres per second to km/h.
      // GPS speed may be unavailable.
      const speedKmh =
        coords.speed !== null && coords.speed >= 0
          ? coords.speed * 3.6
          : null;

      const currentPoint: GPSPoint = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        speedKmh,
        accuracy: coords.accuracy,
        timestamp,
      };

      if (previousPoint) {
        const elapsedSeconds =
          (timestamp - previousPoint.timestamp) / 1000;

        if (elapsedSeconds <= 0) {
          return;
        }

        const distance = calculateDistance(
          previousPoint,
          currentPoint
        );

        const estimatedSpeed =
          (distance / elapsedSeconds) * 3600;

        // Reject implausible GPS jumps.
        if (estimatedSpeed > 200) {
          previousPoint = currentPoint;
          return;
        }

        // Reduce distance accumulation from stationary GPS drift.
        if (distance >= 0.005 && elapsedSeconds <= 30) {
          stats.distanceKm += distance;
        }
      }

      stats.currentSpeedKmh = speedKmh;

      if (speedKmh !== null && speedKmh <= 200) {
        stats.maxSpeedKmh = Math.max(
          stats.maxSpeedKmh,
          speedKmh
        );
      }

      // Save the coordinate for future route visualization.
      stats.route.push(currentPoint);

      previousPoint = currentPoint;

      // Send updated statistics back to the application.
      onUpdate({
        ...stats,
        route: [...stats.route],
      });
    }
  );
}

// Stop receiving GPS updates when the trip ends.
export function stopGPSTracking(
  subscription: Location.LocationSubscription | null
): void {
  subscription?.remove();
}
