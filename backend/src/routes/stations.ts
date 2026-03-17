import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/client";
import type { IAlertsService } from "../services/AlertsService";
import { HttpError, asyncRoute, parseWithSchema } from "./http";

const stationIdParamsSchema = z.object({
  id: z.string().min(1)
});

type StationListRow = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  isTransferStation: boolean;
  hasElevator: boolean;
  hasParking: boolean;
  createdAt: Date;
};

export function createStationsRouter(alertsService: IAlertsService): Router {
  const router = Router();

  router.get(
    "/",
    asyncRoute(async (_request, response) => {
      const stations = (await prisma.$queryRawUnsafe(`
        SELECT
          s.id,
          s.name,
          ST_Y(s.location::geometry) AS latitude,
          ST_X(s.location::geometry) AS longitude,
          s.address,
          s.is_transfer_station AS "isTransferStation",
          s.has_elevator AS "hasElevator",
          s.has_parking AS "hasParking",
          s.created_at AS "createdAt"
        FROM stations s
        ORDER BY s.name
      `)) as StationListRow[];

      const lineAssociations = await prisma.stationLine.findMany({
        include: {
          line: true
        },
        orderBy: [{ line: { displayOrder: "asc" } }, { sequence: "asc" }]
      });

      const stationLineMap = new Map<string, typeof lineAssociations>();

      for (const association of lineAssociations) {
        const collection = stationLineMap.get(association.stationId) ?? [];
        collection.push(association);
        stationLineMap.set(association.stationId, collection);
      }

      response.json({
        stations: stations.map((station: StationListRow) => ({
          id: station.id,
          name: station.name,
          location: {
            lat: station.latitude,
            lng: station.longitude
          },
          address: station.address ?? undefined,
          isTransferStation: station.isTransferStation,
          hasElevator: station.hasElevator,
          hasParking: station.hasParking,
          createdAt: station.createdAt.toISOString(),
          stationLines: (stationLineMap.get(station.id) ?? []).map((association: (typeof lineAssociations)[number]) => ({
            line: {
              id: association.line.id,
              name: association.line.name,
              colorHex: association.line.colorHex,
              displayOrder: association.line.displayOrder
            },
            sequence: association.sequence
          }))
        }))
      });
    })
  );

  router.get(
    "/:id",
    asyncRoute(async (request, response) => {
      const { id } = parseWithSchema(stationIdParamsSchema, request.params);

      const stationRows = (await prisma.$queryRawUnsafe(`
        SELECT
          s.id,
          s.name,
          ST_Y(s.location::geometry) AS latitude,
          ST_X(s.location::geometry) AS longitude,
          s.address,
          s.is_transfer_station AS "isTransferStation",
          s.has_elevator AS "hasElevator",
          s.has_parking AS "hasParking",
          s.created_at AS "createdAt"
        FROM stations s
        WHERE s.id = '${id.replace(/'/g, "''")}'
        LIMIT 1
      `)) as StationListRow[];

      const station = stationRows[0];

      if (!station) {
        throw new HttpError(`Station ${id} was not found.`, 404, "STATION_NOT_FOUND");
      }

      const [lines, predictions, alerts] = await Promise.all([
        prisma.stationLine.findMany({
          where: { stationId: id },
          include: { line: true },
          orderBy: [{ line: { displayOrder: "asc" } }, { sequence: "asc" }]
        }),
        prisma.prediction.findMany({
          where: { stationId: id },
          orderBy: [{ minutesAway: "asc" }, { capturedAt: "desc" }]
        }),
        alertsService.getAlertsForStation(id)
      ]);

      response.json({
        station: {
          id: station.id,
          name: station.name,
          location: {
            lat: station.latitude,
            lng: station.longitude
          },
          address: station.address ?? undefined,
          isTransferStation: station.isTransferStation,
          hasElevator: station.hasElevator,
          hasParking: station.hasParking,
          createdAt: station.createdAt.toISOString(),
          stationLines: lines.map((line: (typeof lines)[number]) => ({
            line: {
              id: line.line.id,
              name: line.line.name,
              colorHex: line.line.colorHex,
              displayOrder: line.line.displayOrder
            },
            sequence: line.sequence
          }))
        },
        predictions: predictions.map((prediction: (typeof predictions)[number]) => ({
          id: prediction.id,
          stationId: prediction.stationId,
          trainId: prediction.trainId,
          lineId: prediction.lineId,
          destinationId: prediction.destinationId,
          minutesAway: prediction.minutesAway,
          carCount: prediction.carCount,
          capturedAt: prediction.capturedAt.toISOString()
        })),
        alerts
      });
    })
  );

  return router;
}
