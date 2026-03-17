import express from "express";
import { config } from "./config";
import { logger } from "./utils/logger";

const app = express();

app.disable("x-powered-by");

app.listen(config.PORT, () => {
  logger.info(`Backend scaffold listening on port ${config.PORT}.`);
});

