import "dotenv/config";
import { z } from "zod";

const environmentSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),
  REDIS_URL: z.string().url("REDIS_URL must be a valid URL."),
  WMATA_API_KEY: z.string().min(1, "WMATA_API_KEY is required."),
  WMATA_GTFS_RT_URL: z.string().url("WMATA_GTFS_RT_URL must be a valid URL."),
  WMATA_ALERTS_URL: z.string().url("WMATA_ALERTS_URL must be a valid URL."),
  POLL_INTERVAL_MS: z.coerce
    .number()
    .int("POLL_INTERVAL_MS must be an integer.")
    .positive("POLL_INTERVAL_MS must be greater than 0.")
    .default(5000),
  PORT: z.coerce
    .number()
    .int("PORT must be an integer.")
    .positive("PORT must be greater than 0.")
    .default(3001),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development")
});

const parsedEnvironment = environmentSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL,
  WMATA_API_KEY: process.env.WMATA_API_KEY,
  WMATA_GTFS_RT_URL: process.env.WMATA_GTFS_RT_URL,
  WMATA_ALERTS_URL: process.env.WMATA_ALERTS_URL,
  POLL_INTERVAL_MS: process.env.POLL_INTERVAL_MS,
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV
});

if (!parsedEnvironment.success) {
  const details = parsedEnvironment.error.issues
    .map((issue) => {
      const path = issue.path.join(".") || "environment";
      return `- ${path}: ${issue.message}`;
    })
    .join("\n");

  throw new Error(`Invalid backend environment configuration:\n${details}`);
}

export const config = Object.freeze(parsedEnvironment.data);

