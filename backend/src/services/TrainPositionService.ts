import { prisma } from "../db/client";
import type { RawTrainPosition } from "./WmataIngestionService";

export interface TrainPositionRecord {
  trainId: string;
  tripId: string;
  lineId: string;
  latitude: number;
  longitude: number;
  bearing: number;
  speedKmh: number;
  currentStationId: string | null;
  nextStationId: string | null;
  progressPct: number;
  updatedAt: string;
}

export interface ITrainPositionService {
  getAllPositions(): Promise<TrainPositionRecord[]>;
  getPositionByTrainId(trainId: string): Promise<TrainPositionRecord | null>;
  upsertPositions(positions: RawTrainPosition[]): Promise<void>;
}

type TrainPositionRow = {
  trainId: string;
  tripId: string;
  lineId: string;
  latitude: number;
  longitude: number;
  bearing: number;
  speedKmh: number;
  currentStationId: string | null;
  nextStationId: string | null;
  progressPct: number;
  updatedAt: Date;
};

type TrainUpdateRow = TrainPositionRow & {
  segmentId: number | null;
};

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

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlStringList(values: string[]): string {
  return values.map(sqlString).join(", ");
}

function mapTrainPosition(row: TrainPositionRow): TrainPositionRecord {
  return {
    trainId: row.trainId,
    tripId: row.tripId,
    lineId: row.lineId,
    latitude: row.latitude,
    longitude: row.longitude,
    bearing: row.bearing,
    speedKmh: row.speedKmh,
    currentStationId: row.currentStationId,
    nextStationId: row.nextStationId,
    progressPct: row.progressPct,
    updatedAt: row.updatedAt.toISOString()
  };
}

function mapTrainUpdate(row: TrainUpdateRow): TrainPositionUpdate | null {
  if (row.segmentId === null) {
    return null;
  }

  return {
    trainId: row.trainId,
    lineId: row.lineId,
    lat: row.latitude,
    lng: row.longitude,
    bearing: row.bearing,
    progressPct: row.progressPct,
    segmentId: row.segmentId,
    updatedAt: row.updatedAt.toISOString()
  };
}

export class PrismaTrainPositionService implements ITrainPositionService {
  constructor(private readonly db = prisma) {}

  async getAllPositions(): Promise<TrainPositionRecord[]> {
    const rows = (await this.db.$queryRawUnsafe(`
      SELECT
        tp.train_id AS "trainId",
        tp.trip_id AS "tripId",
        tp.line_id AS "lineId",
        ST_Y(tp.position::geometry) AS latitude,
        ST_X(tp.position::geometry) AS longitude,
        tp.bearing AS bearing,
        tp.speed_kmh AS "speedKmh",
        tp.current_station_id AS "currentStationId",
        tp.next_station_id AS "nextStationId",
        tp.progress_pct AS "progressPct",
        tp.updated_at AS "updatedAt"
      FROM train_positions tp
      ORDER BY tp.line_id, tp.train_id
    `)) as TrainPositionRow[];

    return rows.map(mapTrainPosition);
  }

  async getPositionByTrainId(trainId: string): Promise<TrainPositionRecord | null> {
    const rows = (await this.db.$queryRawUnsafe(`
      SELECT
        tp.train_id AS "trainId",
        tp.trip_id AS "tripId",
        tp.line_id AS "lineId",
        ST_Y(tp.position::geometry) AS latitude,
        ST_X(tp.position::geometry) AS longitude,
        tp.bearing AS bearing,
        tp.speed_kmh AS "speedKmh",
        tp.current_station_id AS "currentStationId",
        tp.next_station_id AS "nextStationId",
        tp.progress_pct AS "progressPct",
        tp.updated_at AS "updatedAt"
      FROM train_positions tp
      WHERE tp.train_id = ${sqlString(trainId)}
      LIMIT 1
    `)) as TrainPositionRow[];

    const row = rows[0];
    return row ? mapTrainPosition(row) : null;
  }

  async getUpdatesByTrainIds(trainIds: string[]): Promise<TrainPositionUpdate[]> {
    if (trainIds.length === 0) {
      return [];
    }

    const rows = (await this.db.$queryRawUnsafe(`
      SELECT
        tp.train_id AS "trainId",
        tp.trip_id AS "tripId",
        tp.line_id AS "lineId",
        ST_Y(tp.position::geometry) AS latitude,
        ST_X(tp.position::geometry) AS longitude,
        tp.bearing AS bearing,
        tp.speed_kmh AS "speedKmh",
        tp.current_station_id AS "currentStationId",
        tp.next_station_id AS "nextStationId",
        tp.progress_pct AS "progressPct",
        tp.updated_at AS "updatedAt",
        rs.id AS "segmentId"
      FROM train_positions tp
      LEFT JOIN route_segments rs
        ON rs.line_id = tp.line_id
       AND (
         (rs.from_station_id = tp.current_station_id AND rs.to_station_id = tp.next_station_id)
         OR
         (rs.from_station_id = tp.next_station_id AND rs.to_station_id = tp.current_station_id)
       )
      WHERE tp.train_id IN (${sqlStringList(trainIds)})
      ORDER BY tp.line_id, tp.train_id
    `)) as TrainUpdateRow[];

    return rows
      .map((row: TrainUpdateRow) => mapTrainUpdate(row))
      .filter((row: TrainPositionUpdate | null): row is TrainPositionUpdate => row !== null);
  }

  async upsertPositions(positions: RawTrainPosition[]): Promise<void> {
    if (positions.length === 0) {
      return;
    }

    await this.db.$transaction(
      positions.map((position) =>
        this.db.$executeRaw`
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
            ${position.trainId},
            ${position.tripId},
            ${position.lineId},
            /* ST_SetSRID attaches the WGS84 coordinate reference to the point so PostGIS treats it as lon/lat. */
            /* ST_MakePoint constructs the point from the raw longitude and latitude values at the write boundary. */
            ST_SetSRID(ST_MakePoint(${position.longitude}, ${position.latitude}), 4326)::geography,
            ${position.bearing},
            ${position.speedKmh},
            ${position.currentStationId},
            ${position.nextStationId},
            ${position.progressPct},
            ${new Date(position.updatedAt)}
          )
          ON CONFLICT (train_id) DO UPDATE
          SET
            trip_id = EXCLUDED.trip_id,
            line_id = EXCLUDED.line_id,
            position = EXCLUDED.position,
            bearing = EXCLUDED.bearing,
            speed_kmh = EXCLUDED.speed_kmh,
            current_station_id = EXCLUDED.current_station_id,
            next_station_id = EXCLUDED.next_station_id,
            progress_pct = EXCLUDED.progress_pct,
            updated_at = EXCLUDED.updated_at
        `
      )
    );
  }
}
