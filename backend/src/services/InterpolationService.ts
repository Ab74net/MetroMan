import { prisma } from "../db/client";

export interface InterpolatedPosition {
  lat: number;
  lng: number;
  bearing: number;
  progressPct: number;
}

export interface IInterpolationService {
  interpolate(trainId: string, targetTimestamp: number): Promise<InterpolatedPosition>;
}

type InterpolationRow = {
  lat: number;
  lng: number;
  bearing: number | null;
  progressPct: number;
};

export class PostgisInterpolationService implements IInterpolationService {
  constructor(private readonly db = prisma) {}

  async interpolate(trainId: string, targetTimestamp: number): Promise<InterpolatedPosition> {
    const escapedTrainId = `'${trainId.replace(/'/g, "''")}'`;
    const targetDate = new Date(targetTimestamp).toISOString();

    const rows = (await this.db.$queryRawUnsafe(`
      WITH train_context AS (
        SELECT
          tp.progress_pct,
          tp.updated_at,
          tp.speed_kmh,
          trip.direction,
          rs.geometry::geometry AS segment_geometry,
          rs.length_meters
        FROM train_positions tp
        INNER JOIN trips trip
          ON trip.id = tp.trip_id
        INNER JOIN route_segments rs
          ON rs.line_id = tp.line_id
         AND (
           (rs.from_station_id = tp.current_station_id AND rs.to_station_id = tp.next_station_id)
           OR
           (rs.from_station_id = tp.next_station_id AND rs.to_station_id = tp.current_station_id)
         )
        WHERE tp.train_id = ${escapedTrainId}
        LIMIT 1
      ),
      projected AS (
        SELECT
          LEAST(
            1.0,
            GREATEST(
              0.0,
              progress_pct + (
                (EXTRACT(EPOCH FROM ('${targetDate}'::timestamptz - updated_at)) * ((speed_kmh * 1000.0) / 3600.0))
                / NULLIF(length_meters, 0)
              )
            )
          ) AS projected_progress_pct,
          direction,
          segment_geometry
        FROM train_context
      ),
      fractions AS (
        SELECT
          projected_progress_pct,
          CASE
            WHEN direction = 1 THEN projected_progress_pct
            ELSE 1.0 - projected_progress_pct
          END AS canonical_fraction,
          CASE
            WHEN direction = 1 THEN GREATEST(0.0, projected_progress_pct - 0.01)
            ELSE LEAST(1.0, (1.0 - projected_progress_pct) + 0.01)
          END AS azimuth_start_fraction,
          CASE
            WHEN direction = 1 THEN LEAST(1.0, projected_progress_pct + 0.01)
            ELSE GREATEST(0.0, (1.0 - projected_progress_pct) - 0.01)
          END AS azimuth_end_fraction,
          segment_geometry
        FROM projected
      )
      SELECT
        /* ST_LineInterpolatePoint finds a point at a given fraction along the LineString. */
        /* It lets us place the train on the exact route geometry instead of a straight-line guess. */
        ST_Y(ST_LineInterpolatePoint(segment_geometry, canonical_fraction)) AS lat,
        /* ST_X extracts the longitude from the projected point for the API response. */
        ST_X(ST_LineInterpolatePoint(segment_geometry, canonical_fraction)) AS lng,
        /* ST_Azimuth gives us the angle from one nearby sample point to another so the train faces along the track. */
        /* The nested ST_LineInterpolatePoint calls sample just before and after the target point to follow the local tangent. */
        DEGREES(
          ST_Azimuth(
            ST_LineInterpolatePoint(segment_geometry, azimuth_start_fraction),
            ST_LineInterpolatePoint(segment_geometry, azimuth_end_fraction)
          )
        ) AS bearing,
        projected_progress_pct AS "progressPct"
      FROM fractions
      LIMIT 1
    `)) as InterpolationRow[];

    const row = rows[0];

    if (!row) {
      throw new Error(`Unable to interpolate position for train ${trainId}.`);
    }

    return {
      lat: row.lat,
      lng: row.lng,
      bearing: row.bearing ?? 0,
      progressPct: row.progressPct
    };
  }
}

// TODO[INTERP]: Implement Kalman filter for smoother position estimation under poor GPS conditions.
