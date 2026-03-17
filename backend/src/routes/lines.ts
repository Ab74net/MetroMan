import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/client";
import { HttpError, asyncRoute, parseWithSchema } from "./http";

const lineIdValues = ["red", "blue", "orange", "silver", "green", "yellow"] as const;
const lineIdParamsSchema = z.object({
  id: z.enum(lineIdValues)
});

type RouteRow = {
  id: number;
  lineId: string;
  fromStationId: string;
  toStationId: string;
  sequence: number;
  geometry: string;
};

export function createLinesRouter(): Router {
  const router = Router();

  router.get(
    "/",
    asyncRoute(async (_request, response) => {
      const lines = await prisma.line.findMany({
        orderBy: { displayOrder: "asc" }
      });

      response.json({
        lines
      });
    })
  );

  router.get(
    "/:id/route",
    asyncRoute(async (request, response) => {
      const { id } = parseWithSchema(lineIdParamsSchema, request.params);

      const line = await prisma.line.findUnique({
        where: { id }
      });

      if (!line) {
        throw new HttpError(`Line ${id} was not found.`, 404, "LINE_NOT_FOUND");
      }

      const segments = (await prisma.$queryRawUnsafe(`
        SELECT
          rs.id,
          rs.line_id AS "lineId",
          rs.from_station_id AS "fromStationId",
          rs.to_station_id AS "toStationId",
          rs.sequence,
          ST_AsGeoJSON(rs.geometry::geometry) AS geometry
        FROM route_segments rs
        WHERE rs.line_id = '${id}'
        ORDER BY rs.sequence ASC
      `)) as RouteRow[];

      response.json({
        type: "FeatureCollection",
        features: segments.map((segment: RouteRow) => ({
          type: "Feature",
          geometry: JSON.parse(segment.geometry),
          properties: {
            line_id: segment.lineId,
            from_station_id: segment.fromStationId,
            to_station_id: segment.toStationId,
            sequence: segment.sequence
          }
        }))
      });
    })
  );

  return router;
}
