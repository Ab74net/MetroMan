import { PrismaClient, type Prisma } from "@prisma/client";
import { config } from "../config";
import { createLogger } from "../utils/logger";
import {
  alerts,
  baseTimestamp,
  lineStations,
  lines,
  stations,
  trains,
  type LineId
} from "./mock-network";
import {
  buildCurvedPolyline,
  computeBearing,
  interpolateAlongPolyline,
  lineToWkt,
  pointToWkt,
  type RouteSegmentSeed
} from "./geo";

const logger = createLogger("metro-seed");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.DATABASE_URL
    }
  }
});

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlNumber(value: number): string {
  return Number.isInteger(value) ? `${value}` : Number(value.toFixed(6)).toString();
}

function sqlBoolean(value: boolean): string {
  return value ? "TRUE" : "FALSE";
}

function sqlTimestamp(value: string): string {
  return `${sqlString(value)}::timestamptz`;
}

function sqlNullableTimestamp(value: string | null): string {
  return value ? sqlTimestamp(value) : "NULL";
}

function sqlTextArray(values: string[]): string {
  if (values.length === 0) {
    return "ARRAY[]::TEXT[]";
  }

  return `ARRAY[${values.map(sqlString).join(", ")}]::TEXT[]`;
}

function createRouteSegments(): RouteSegmentSeed[] {
  const segments: RouteSegmentSeed[] = [];

  for (const [lineId, stationIds] of Object.entries(lineStations) as Array<[LineId, string[]]>) {
    for (let index = 0; index < stationIds.length - 1; index += 1) {
      const fromStationId = stationIds[index];
      const toStationId = stationIds[index + 1];

      segments.push({
        lineId,
        fromStationId,
        toStationId,
        sequence: index + 1,
        coordinates: buildCurvedPolyline(lineId, fromStationId, toStationId, index + 1)
      });
    }
  }

  return segments;
}

async function main(): Promise<void> {
  const seededAt = baseTimestamp.toISOString();
  const routeSegments = createRouteSegments();
  const routeSegmentByKey = new Map(
    routeSegments.map((segment) => [
      `${segment.lineId}:${segment.fromStationId}->${segment.toStationId}`,
      segment
    ])
  );

  logger.info("Seeding Metro scaffold data.");

  await prisma.$connect();

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.$executeRawUnsafe(`
      TRUNCATE TABLE
        predictions,
        train_positions,
        trips,
        route_segments,
        station_lines,
        alerts,
        stations,
        lines
      RESTART IDENTITY CASCADE
    `);

    for (const line of lines) {
      await tx.$executeRawUnsafe(`
        INSERT INTO lines (id, name, color_hex, display_order)
        VALUES (${sqlString(line.id)}, ${sqlString(line.name)}, ${sqlString(line.colorHex)}, ${sqlNumber(line.displayOrder)})
      `);
    }

    for (const station of stations) {
      await tx.$executeRawUnsafe(`
        INSERT INTO stations (
          id,
          name,
          location,
          address,
          is_transfer_station,
          has_elevator,
          has_parking,
          created_at
        )
        VALUES (
          ${sqlString(station.id)},
          ${sqlString(station.name)},
          ST_GeogFromText(${sqlString(pointToWkt(station))}),
          ${sqlString(station.address)},
          ${sqlBoolean(station.isTransferStation)},
          ${sqlBoolean(station.hasElevator)},
          ${sqlBoolean(station.hasParking)},
          ${sqlTimestamp(seededAt)}
        )
      `);
    }

    for (const [lineId, stationIds] of Object.entries(lineStations) as Array<[LineId, string[]]>) {
      for (let index = 0; index < stationIds.length; index += 1) {
        await tx.$executeRawUnsafe(`
          INSERT INTO station_lines (station_id, line_id, sequence)
          VALUES (${sqlString(stationIds[index])}, ${sqlString(lineId)}, ${sqlNumber(index + 1)})
        `);
      }
    }

    for (const segment of routeSegments) {
      await tx.$executeRawUnsafe(`
        INSERT INTO route_segments (
          line_id,
          from_station_id,
          to_station_id,
          sequence,
          geometry
        )
        VALUES (
          ${sqlString(segment.lineId)},
          ${sqlString(segment.fromStationId)},
          ${sqlString(segment.toStationId)},
          ${sqlNumber(segment.sequence)},
          ST_GeogFromText(${sqlString(lineToWkt(segment.coordinates))})
        )
      `);
    }

    for (const train of trains) {
      await tx.$executeRawUnsafe(`
        INSERT INTO trips (id, line_id, headsign, direction, shape_id)
        VALUES (
          ${sqlString(train.tripId)},
          ${sqlString(train.lineId)},
          ${sqlString(train.headsign)},
          ${sqlNumber(train.direction)},
          ${sqlString(train.shapeId)}
        )
      `);
    }

    for (const train of trains) {
      const segment = routeSegmentByKey.get(train.segmentKey);

      if (!segment) {
        throw new Error(`Missing route segment for train ${train.trainId}: ${train.segmentKey}`);
      }

      const routeProgress = train.direction === 1 ? train.progressPct : 1 - train.progressPct;
      const interpolated = interpolateAlongPolyline(segment.coordinates, routeProgress);

      // The bearing comes from the local tangent of the seeded polyline so the train faces the
      // direction of travel along the curved mock route instead of pointing station-to-station.
      const bearing =
        train.direction === 1
          ? computeBearing(interpolated.tangentStart, interpolated.tangentEnd)
          : computeBearing(interpolated.tangentEnd, interpolated.tangentStart);

      const currentStationId = train.direction === 1 ? segment.fromStationId : segment.toStationId;
      const nextStationId = train.direction === 1 ? segment.toStationId : segment.fromStationId;

      await tx.$executeRawUnsafe(`
        INSERT INTO train_positions (
          train_id,
          trip_id,
          line_id,
          position,
          bearing,
          speed_kmh,
          current_station_id,
          next_station_id,
          progress_pct,
          updated_at
        )
        VALUES (
          ${sqlString(train.trainId)},
          ${sqlString(train.tripId)},
          ${sqlString(train.lineId)},
          ST_GeogFromText(${sqlString(pointToWkt(interpolated.point))}),
          ${sqlNumber(bearing)},
          ${sqlNumber(train.speedKmh)},
          ${sqlString(currentStationId)},
          ${sqlString(nextStationId)},
          ${sqlNumber(train.progressPct)},
          ${sqlTimestamp(train.updatedAt)}
        )
      `);

      const remainingMeters = interpolated.totalMeters * (1 - train.progressPct);
      const minutesAway = Math.max(1, Math.round(((remainingMeters / 1000) / train.speedKmh) * 60));

      await tx.$executeRawUnsafe(`
        INSERT INTO predictions (
          station_id,
          train_id,
          line_id,
          destination_id,
          minutes_away,
          car_count,
          captured_at
        )
        VALUES (
          ${sqlString(nextStationId)},
          ${sqlString(train.trainId)},
          ${sqlString(train.lineId)},
          ${sqlString(train.destinationId)},
          ${sqlNumber(minutesAway)},
          ${sqlNumber(train.carCount)},
          ${sqlTimestamp(train.updatedAt)}
        )
      `);
    }

    for (const alert of alerts) {
      await tx.$executeRawUnsafe(`
        INSERT INTO alerts (
          id,
          header,
          description,
          severity,
          affected_line_ids,
          affected_station_ids,
          starts_at,
          ends_at,
          created_at
        )
        VALUES (
          ${sqlString(alert.id)},
          ${sqlString(alert.header)},
          ${sqlString(alert.description)},
          ${sqlString(alert.severity)},
          ${sqlTextArray(alert.affectedLineIds)},
          ${sqlTextArray(alert.affectedStationIds)},
          ${sqlTimestamp(alert.startsAt)},
          ${sqlNullableTimestamp(alert.endsAt)},
          ${sqlTimestamp(seededAt)}
        )
      `);
    }
  });

  logger.info("Metro scaffold seed complete.", {
    lines: lines.length,
    stations: stations.length,
    routeSegments: routeSegments.length,
    trains: trains.length,
    alerts: alerts.length
  });
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown seed failure.";
    logger.error(message, {
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
