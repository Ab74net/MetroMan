import { Router } from "express";
import { z } from "zod";
import type { IInterpolationService } from "../services/InterpolationService";
import type { ITrainPositionService } from "../services/TrainPositionService";
import { HttpError, asyncRoute, parseWithSchema } from "./http";

const trainIdParamsSchema = z.object({
  id: z.string().min(1)
});

export function createTrainsRouter(
  trainPositionService: ITrainPositionService,
  interpolationService: IInterpolationService
): Router {
  const router = Router();

  router.get(
    "/",
    asyncRoute(async (_request, response) => {
      const trains = await trainPositionService.getAllPositions();
      response.json({ trains });
    })
  );

  router.get(
    "/:id",
    asyncRoute(async (request, response) => {
      const { id } = parseWithSchema(trainIdParamsSchema, request.params);
      const train = await trainPositionService.getPositionByTrainId(id);

      if (!train) {
        throw new HttpError(`Train ${id} was not found.`, 404, "TRAIN_NOT_FOUND");
      }

      const interpolated = await interpolationService.interpolate(id, Date.now() + 5_000);

      response.json({
        train,
        interpolated
      });
    })
  );

  return router;
}
