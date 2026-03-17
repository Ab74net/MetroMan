import { createLogger } from "../utils/logger";
import type { IAlertsService } from "../services/AlertsService";
import type { IWebSocketBroadcaster } from "../services/WebSocketBroadcaster";
import type { IWmataIngestionService } from "../services/WmataIngestionService";

export interface AlertPollerHandle {
  stop(): void;
}

const logger = createLogger("alerts-poller");

export function startAlertsPoller(
  ingestionService: IWmataIngestionService,
  alertsService: IAlertsService,
  broadcaster: IWebSocketBroadcaster
): AlertPollerHandle {
  let timer: NodeJS.Timeout | null = null;
  let running = false;

  const tick = async (): Promise<void> => {
    if (running) {
      return;
    }

    running = true;

    try {
      const rawAlerts = await ingestionService.fetchAlerts();
      await alertsService.ingestAlerts(rawAlerts);
      const activeAlerts = await alertsService.getAllAlerts();

      for (const alert of activeAlerts) {
        broadcaster.broadcastAlert(alert);
      }

      logger.info("Alerts poll tick complete.", {
        alertsChecked: activeAlerts.length
      });
    } catch (error: unknown) {
      logger.error("Alerts poll tick failed.", {
        error: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      running = false;
    }
  };

  timer = setInterval(() => {
    void tick();
  }, 30_000);

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
