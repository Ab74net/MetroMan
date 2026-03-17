import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { createLogger } from "../utils/logger";

export interface TrainPositionUpdate {
  trainId: string;
  lineId: string;
  lat: number;
  lng: number;
  bearing: number;
  progressPct: number;
  segmentId: number;
  updatedAt: string;
}

export interface AlertCreated {
  id: string;
  header: string;
  description: string;
  severity: "INFO" | "WARNING" | "SEVERE";
  affectedLineIds: string[];
  affectedStationIds: string[];
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
}

export interface PredictionUpdate {
  stationId: string;
  predictions: Array<{
    id: number;
    stationId: string;
    trainId: string;
    lineId: string;
    destinationId: string;
    minutesAway: number;
    carCount: number;
    capturedAt: string;
  }>;
}

export interface IWebSocketBroadcaster {
  broadcastTrainUpdate(update: TrainPositionUpdate): void;
  broadcastAlert(alert: AlertCreated): void;
  broadcastPredictionUpdate(update: PredictionUpdate): void;
}

const TRAIN_EVENT = "train:position";
const ALERT_EVENT = "alert:created";
const PREDICTION_EVENT = "prediction:update";

function lineRoom(lineId: string): string {
  return `line:${lineId}`;
}

function stationRoom(stationId: string): string {
  return `station:${stationId}`;
}

export class SocketIoWebSocketBroadcaster implements IWebSocketBroadcaster {
  private readonly logger = createLogger("websocket-broadcaster");
  private readonly trainCache = new Map<string, string>();
  private readonly alertCache = new Map<string, string>();
  private readonly predictionCache = new Map<string, string>();
  private readonly io: Server;

  constructor(server: HttpServer, frontendOrigin: string) {
    this.io = new Server(server, {
      cors: {
        origin: frontendOrigin,
        methods: ["GET", "POST"]
      }
    });

    this.io.on("connection", (socket) => {
      socket.on("subscribe:line", (payload: { lineId?: string }) => {
        if (payload?.lineId) {
          socket.join(lineRoom(payload.lineId));
        }
      });

      socket.on("unsubscribe:line", (payload: { lineId?: string }) => {
        if (payload?.lineId) {
          socket.leave(lineRoom(payload.lineId));
        }
      });

      socket.on("subscribe:station", (payload: { stationId?: string }) => {
        if (payload?.stationId) {
          socket.join(stationRoom(payload.stationId));
        }
      });

      socket.on("unsubscribe:station", (payload: { stationId?: string }) => {
        if (payload?.stationId) {
          socket.leave(stationRoom(payload.stationId));
        }
      });
    });
  }

  broadcastTrainUpdate(update: TrainPositionUpdate): void {
    const serialized = JSON.stringify(update);
    const previous = this.trainCache.get(update.trainId);

    if (previous === serialized) {
      return;
    }

    this.trainCache.set(update.trainId, serialized);
    this.io.to(lineRoom(update.lineId)).emit(TRAIN_EVENT, {
      type: TRAIN_EVENT,
      payload: update
    });
  }

  broadcastAlert(alert: AlertCreated): void {
    const serialized = JSON.stringify(alert);
    const previous = this.alertCache.get(alert.id);

    if (previous === serialized) {
      return;
    }

    this.alertCache.set(alert.id, serialized);
    this.io.emit(ALERT_EVENT, {
      type: ALERT_EVENT,
      payload: alert
    });
  }

  broadcastPredictionUpdate(update: PredictionUpdate): void {
    const serialized = JSON.stringify(update);
    const previous = this.predictionCache.get(update.stationId);

    if (previous === serialized) {
      return;
    }

    this.predictionCache.set(update.stationId, serialized);
    this.io.to(stationRoom(update.stationId)).emit(PREDICTION_EVENT, {
      type: PREDICTION_EVENT,
      payload: update
    });
  }

  async close(): Promise<void> {
    this.logger.info("Closing socket.io server.");
    await this.io.close();
  }
}

// TODO[REDIS]: Replace in-memory position cache with Redis hash using HSET/HGET for horizontal scaling.
