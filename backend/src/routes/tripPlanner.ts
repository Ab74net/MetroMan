import { Router } from "express";
import { z } from "zod";
import type { ITripPlannerService } from "../services/TripPlannerService";
import { asyncRoute, parseWithSchema } from "./http";

const tripPlannerBodySchema = z.object({
  origin: z.string().min(1),
  destination: z.string().min(1),
  departAt: z.coerce.date(),
  mode: z.enum(["depart", "arrive"])
});

export function createTripPlannerRouter(tripPlannerService: ITripPlannerService): Router {
  const router = Router();

  router.post(
    "/plan",
    asyncRoute(async (request, response) => {
      const body = parseWithSchema(tripPlannerBodySchema, request.body);
      const result = await tripPlannerService.plan(
        body.origin,
        body.destination,
        body.departAt,
        body.mode
      );

      response.json(result);
    })
  );

  return router;
}
