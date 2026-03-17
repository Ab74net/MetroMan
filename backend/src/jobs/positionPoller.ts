import { createLogger } from "../utils/logger";
import type { IWmataIngestionService } from "../services/WmataIngestionService";
import type { IWebSocketBroadcaster } from "../services/WebSocketBroadcaster";
import type { PrismaTrainPositionService } from "../services/TrainPositionService";

export interface PollerHandle {
  stop(): void;
}

const logger = createLogger("position-poller");

export function startPositionPoller(
  ingestionService: IWmataIngestionService,
  trainPositionService: PrismaTrainPositionService,
  broadcaster: IWebSocketBroadcaster,
  intervalMs: number
): PollerHandle {
  let timer: NodeJS.Timeout | null = null;
  let running = false;

  const tick = async (): Promise<void> => {
    if (running) {
      return;
    }

    running = true;

    try {
      const rawPositions = await ingestionService.fetchTrainPositions();
      await trainPositionService.upsertPositions(rawPositions);
      const updates = await trainPositionService.getUpdatesByTrainIds(
        rawPositions.map((position) => position.trainId)
      );

      for (const update of updates) {
        broadcaster.broadcastTrainUpdate(update);
      }

      logger.info("Position poll tick complete.", {
        trainsUpdated: updates.length
      });
    } catch (error: unknown) {
      logger.error("Position poll tick failed.", {
        error: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      running = false;
    }
  };

  timer = setInterval(() => {
    void tick();
  }, intervalMs);

  void tick();

  return {
    stop(): void {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }
  };
}
