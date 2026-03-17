import { Router } from "express";
import type { IAlertsService } from "../services/AlertsService";
import { asyncRoute } from "./http";

export function createAlertsRouter(alertsService: IAlertsService): Router {
  const router = Router();

  router.get(
    "/",
    asyncRoute(async (_request, response) => {
      const alerts = await alertsService.getAllAlerts();
      response.json({ alerts });
    })
  );

  return router;
}
