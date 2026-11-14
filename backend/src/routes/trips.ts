
import { Router } from "express";
import { pool } from "../db";
import { verifyFirebaseToken } from "../middleware/auth";
import type { AuthenticatedRequest } from "../middleware/auth";

const router = Router();

router.post("/start", verifyFirebaseToken, async (req, res) => {
  const firebaseUid = (req as AuthenticatedRequest).firebaseUid;

  if (!firebaseUid) {
    res.status(401).json({
      message: "User is not authenticated"
    });
    return;
  }

  try {
    const userResult = await pool.query(
      `INSERT INTO public.users (firebase_uid)
       VALUES ($1)
       ON CONFLICT (firebase_uid)
       DO UPDATE SET firebase_uid = EXCLUDED.firebase_uid
       RETURNING id`,
      [firebaseUid]
    );

    const driverId = userResult.rows[0].id;

    const tripResult = await pool.query(
      `INSERT INTO public.trips (driver_id, status)
       VALUES ($1, 'active')
       RETURNING id, driver_id, status, started_at`,
      [driverId]
    );

    const trip = tripResult.rows[0];

    res.status(201).json({
      message: "Trip started successfully",
      trip
    });

  } catch (error: unknown) {
    const dbError = error as { code?: string; constraint?: string };

    if (
      dbError.code === "23505" &&
      dbError.constraint === "one_active_trip_per_driver"
    ) {
      res.status(409).json({
        message: "You already have an active trip"
      });
      return;
    }

    console.error("Start Trip error:", error);

    res.status(500).json({
      message: "Failed to start trip"
    });
  }
});

router.post("/end", verifyFirebaseToken, async (req, res) => {
    const firebaseUid = (req as AuthenticatedRequest).firebaseUid;

    if (!firebaseUid) {
      res.status(401).json({
        message: "User is not authenticated"
      });
      return;
    }

    try {
      const result = await pool.query(
        `UPDATE public.trips
         SET status = 'completed',
             ended_at = NOW()
         WHERE driver_id = (
           SELECT id
           FROM public.users
           WHERE firebase_uid = $1
         )
         AND status = 'active'
         RETURNING id, driver_id, status, started_at, ended_at`,
        [firebaseUid]
      );

      if (result.rows.length === 0) {
        res.status(404).json({
          message: "No active trip found"
        });
        return;
      }

      res.status(200).json({
        message: "Trip ended successfully",
        trip: result.rows[0]
      });

    } catch (error) {
      console.error("End Trip error:", error);

      res.status(500).json({
        message: "Failed to end trip"
      });
    }
  });

export default router;
