
import { Pool } from "pg";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from .env");
}

const certificatePath = path.join(
    process.cwd(),
    "certs",
    "prod-ca-2021.crt"
  );

  export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      ca: fs.readFileSync(certificatePath, "utf8"),
      rejectUnauthorized: true
    }
  });
