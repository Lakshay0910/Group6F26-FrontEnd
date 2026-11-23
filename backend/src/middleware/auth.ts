
import { Request, Response, NextFunction } from "express";
import { adminAuth } from "../firebase";

export interface AuthenticatedRequest extends Request {
  firebaseUid?: string;
}

export async function verifyFirebaseToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      message: "Authentication token is missing"
    });
    return;
  }

  const token = authHeader.substring(7).trim();

  if (!token) {
    res.status(401).json({
      message: "Authentication token is missing"
    });
    return;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);

    req.firebaseUid = decodedToken.uid;

    next();
  } catch (error) {
    console.error("Firebase token verification failed");

    res.status(401).json({
      message: "Invalid or expired authentication token"
    });
  }
}
