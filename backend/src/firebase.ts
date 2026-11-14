
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import fs from "node:fs";
import path from "node:path";

const serviceAccountPath = path.join(
  process.cwd(),
  "secrets",
  "firebase-service-account.json"
);

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf8")
);

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

export const adminAuth = getAuth();
