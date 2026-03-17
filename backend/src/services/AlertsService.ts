import { prisma } from "../db/client";
import type { RawAlert } from "./WmataIngestionService";

export interface AlertRecord {
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

export interface IAlertsService {
  getAllAlerts(): Promise<AlertRecord[]>;
  getAlertsForStation(stationId: string): Promise<AlertRecord[]>;
  getAlertsForLine(lineId: string): Promise<AlertRecord[]>;
  ingestAlerts(raw: RawAlert[]): Promise<void>;
}

type AlertRow = {
  id: string;
  header: string;
  description: string;
  severity: AlertRecord["severity"];
  affectedLineIds: string[];
  affectedStationIds: string[];
  startsAt: Date;
  endsAt: Date | null;
  createdAt: Date;
};

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlTextArray(values: string[]): string {
  if (values.length === 0) {
    return "ARRAY[]::TEXT[]";
  }

  return `ARRAY[${values.map(sqlString).join(", ")}]::TEXT[]`;
}

function mapAlert(row: AlertRow): AlertRecord {
  return {
    id: row.id,
    header: row.header,
    description: row.description,
    severity: row.severity,
    affectedLineIds: row.affectedLineIds,
    affectedStationIds: row.affectedStationIds,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt ? row.endsAt.toISOString() : null,
    createdAt: row.createdAt.toISOString()
  };
}

export class PrismaAlertsService implements IAlertsService {
  constructor(private readonly db = prisma) {}

  async getAllAlerts(): Promise<AlertRecord[]> {
    const rows = (await this.db.$queryRawUnsafe(`
      SELECT
        id,
        header,
        description,
        severity,
        affected_line_ids AS "affectedLineIds",
        affected_station_ids AS "affectedStationIds",
        starts_at AS "startsAt",
        ends_at AS "endsAt",
        created_at AS "createdAt"
      FROM alerts
      WHERE starts_at <= NOW()
        AND (ends_at IS NULL OR ends_at > NOW())
      ORDER BY starts_at DESC, created_at DESC
    `)) as AlertRow[];

    return rows.map(mapAlert);
  }

  async getAlertsForStation(stationId: string): Promise<AlertRecord[]> {
    const stationLines = await this.db.stationLine.findMany({
      where: { stationId },
      select: { lineId: true }
    });
    const lineIds = stationLines.map((line: { lineId: string }) => line.lineId);

    const lineOverlapClause =
      lineIds.length > 0
        ? `
            OR
            /* The && operator checks whether the alert's affected lines overlap the station's lines. */
            affected_line_ids && ${sqlTextArray(lineIds)}
          `
        : "";

    const rows = (await this.db.$queryRawUnsafe(`
      SELECT
        id,
        header,
        description,
        severity,
        affected_line_ids AS "affectedLineIds",
        affected_station_ids AS "affectedStationIds",
        starts_at AS "startsAt",
        ends_at AS "endsAt",
        created_at AS "createdAt"
      FROM alerts
      WHERE starts_at <= NOW()
        AND (ends_at IS NULL OR ends_at > NOW())
        AND (
          /* The @> operator checks whether the alert's station array contains this station id. */
          affected_station_ids @> ARRAY[${sqlString(stationId)}]::TEXT[]
          ${lineOverlapClause}
        )
      ORDER BY starts_at DESC, created_at DESC
    `)) as AlertRow[];

    return rows.map(mapAlert);
  }

  async getAlertsForLine(lineId: string): Promise<AlertRecord[]> {
    const rows = (await this.db.$queryRawUnsafe(`
      SELECT
        id,
        header,
        description,
        severity,
        affected_line_ids AS "affectedLineIds",
        affected_station_ids AS "affectedStationIds",
        starts_at AS "startsAt",
        ends_at AS "endsAt",
        created_at AS "createdAt"
      FROM alerts
      WHERE starts_at <= NOW()
        AND (ends_at IS NULL OR ends_at > NOW())
        AND (
          /* The && operator returns true when the two arrays share at least one line id. */
          affected_line_ids && ARRAY[${sqlString(lineId)}]::TEXT[]
        )
      ORDER BY starts_at DESC, created_at DESC
    `)) as AlertRow[];

    return rows.map(mapAlert);
  }

  async ingestAlerts(raw: RawAlert[]): Promise<void> {
    if (raw.length === 0) {
      return;
    }

    await this.db.$transaction(
      raw.map((alert) =>
        this.db.$executeRaw`
          INSERT INTO alerts (
            id,
            header,
            description,
            severity,
            affected_line_ids,
            affected_station_ids,
            starts_at,
            ends_at
          )
          VALUES (
            ${alert.id},
            ${alert.header},
            ${alert.description},
            ${alert.severity},
            ${alert.affectedLineIds}::TEXT[],
            ${alert.affectedStationIds}::TEXT[],
            ${new Date(alert.startsAt)},
            ${alert.endsAt ? new Date(alert.endsAt) : null}
          )
          ON CONFLICT (id) DO UPDATE
          SET
            header = EXCLUDED.header,
            description = EXCLUDED.description,
            severity = EXCLUDED.severity,
            affected_line_ids = EXCLUDED.affected_line_ids,
            affected_station_ids = EXCLUDED.affected_station_ids,
            starts_at = EXCLUDED.starts_at,
            ends_at = EXCLUDED.ends_at
        `
      )
    );
  }
}
