import http from "http";
import express, { type NextFunction, type Request, type Response } from "express";
import { config } from "./config";
import { prisma } from "./db/client";
import { startAlertsPoller } from "./jobs/alertsPoller";
import { startPositionPoller } from "./jobs/positionPoller";
import { createAlertsRouter } from "./routes/alerts";
import { HttpError } from "./routes/http";
import { createLinesRouter } from "./routes/lines";
import { createStationsRouter } from "./routes/stations";
import { createTrainsRouter } from "./routes/trains";
import { createTripPlannerRouter } from "./routes/tripPlanner";
import { PrismaAlertsService } from "./services/AlertsService";
import { PostgisInterpolationService } from "./services/InterpolationService";
import { MockTripPlannerService } from "./services/TripPlannerService";
import { PrismaTrainPositionService } from "./services/TrainPositionService";
import { MockWmataIngestionService } from "./services/WmataIngestionService";
import { SocketIoWebSocketBroadcaster } from "./services/WebSocketBroadcaster";
import { logger } from "./utils/logger";

function applyCors(response: Response): void {
  response.header("Access-Control-Allow-Origin", config.FRONTEND_ORIGIN);
  response.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export async function startServer(): Promise<{
  close(): Promise<void>;
}> {
  const app = express();
  const httpServer = http.createServer(app);

  app.disable("x-powered-by");
  app.use(express.json());
  app.use((request, response, next) => {
    applyCors(response);

    if (request.method === "OPTIONS") {
      response.status(204).end();
      return;
    }

    next();
  });

  const ingestionService = new MockWmataIngestionService();
  const trainPositionService = new PrismaTrainPositionService(prisma);
  const interpolationService = new PostgisInterpolationService(prisma);
  const alertsService = new PrismaAlertsService(prisma);
  const tripPlannerService = new MockTripPlannerService();
  const broadcaster = new SocketIoWebSocketBroadcaster(httpServer, config.FRONTEND_ORIGIN);

  app.use("/api/stations", createStationsRouter(alertsService));
  app.use("/api/lines", createLinesRouter());
  app.use("/api/trains", createTrainsRouter(trainPositionService, interpolationService));
  app.use("/api/alerts", createAlertsRouter(alertsService));
  app.use("/api/trip-planner", createTripPlannerRouter(tripPlannerService));

  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    if (error instanceof HttpError) {
      response.status(error.statusCode).json({
        error: error.message,
        code: error.code
      });
      return;
    }

    logger.error("Unhandled request error.", {
      error: error instanceof Error ? error.message : "Unknown error"
    });

    response.status(500).json({
      error: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR"
    });
  });

  let databaseStatus = "disconnected";
  await prisma.$connect();
  await prisma.$queryRaw`SELECT 1`;
  databaseStatus = "connected";

  const positionPoller = startPositionPoller(
    ingestionService,
    trainPositionService,
    broadcaster,
    config.POLL_INTERVAL_MS
  );
  const alertsPoller = startAlertsPoller(ingestionService, alertsService, broadcaster);

  await new Promise<void>((resolve) => {
    httpServer.listen(config.PORT, () => {
      logger.info("MetroMan backend started.", {
        port: config.PORT,
        environment: config.NODE_ENV,
        databaseStatus
      });
      resolve();
    });
  });

  let shuttingDown = false;

  const close = async (): Promise<void> => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    positionPoller.stop();
    alertsPoller.stop();
    await broadcaster.close();
    await new Promise<void>((resolve, reject) => {
      httpServer.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
    await prisma.$disconnect();
  };

  process.once("SIGTERM", () => {
    void close();
  });

  return { close };
}
