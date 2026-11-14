
import tripsRouter from "./routes/trips";
import { verifyFirebaseToken, AuthenticatedRequest } from "./middleware/auth";
import { pool } from "./db";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use("/api/trips", tripsRouter);

app.get("/api/health", (req, res) => {
  res.json({
    message: "DriveWise backend is running!",
    status: "ok"
  });
});


app.get("/api/db-test", async (req, res) => {
    console.log("DB-TEST REQUEST RECEIVED");

    try {
      const result = await pool.query(
        "SELECT COUNT(*) AS total FROM public.users"
      );

      res.json({
        message: "Connected to DriveWise PostgreSQL!",
        users: Number(result.rows[0].total)
      });
    } catch (error) {
      console.error("Database connection failed:", error);

      res.status(500).json({
        message: "Database connection failed"
      });
    }
  });


app.get("/api/protected", verifyFirebaseToken, (req, res) => {
    const user = req as AuthenticatedRequest;

    res.json({
      message: "You are authenticated!",
      firebaseUid: user.firebaseUid
    });
  });

  app.listen(PORT, () => {
    console.log(`DriveWise server running on port ${PORT}`);
  });


app.listen(PORT, () => {
  console.log(`DriveWise server running on port ${PORT}`);
});
