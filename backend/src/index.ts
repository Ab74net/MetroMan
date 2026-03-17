import { startServer } from "./server";
import { logger } from "./utils/logger";

void startServer().catch((error: unknown) => {
  logger.error("Failed to start backend server.", {
    error: error instanceof Error ? error.message : "Unknown error"
  });
  process.exitCode = 1;
});

