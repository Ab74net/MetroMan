import { alerts, trains, type AlertSeverity } from "../db/mock-network";
import { buildCurvedPolyline, computeBearing, interpolateAlongPolyline } from "../db/geo";

export interface RawTrainPosition {
  trainId: string;
  tripId: string;
  lineId: string;
  direction: 0 | 1;
  latitude: number;
  longitude: number;
  bearing: number;
  speedKmh: number;
  currentStationId: string | null;
  nextStationId: string | null;
  progressPct: number;
  updatedAt: string;
}

export interface RawAlert {
  id: string;
  header: string;
  description: string;
  severity: AlertSeverity;
  affectedLineIds: string[];
  affectedStationIds: string[];
  startsAt: string;
  endsAt: string | null;
}

export interface IWmataIngestionService {
  fetchTrainPositions(): Promise<RawTrainPosition[]>;
  fetchAlerts(): Promise<RawAlert[]>;
}

function parseSegmentKey(segmentKey: string): {
  fromStationId: string;
  toStationId: string;
} {
  const [, stations] = segmentKey.split(":");
  const [fromStationId, toStationId] = stations.split("->");
  return { fromStationId, toStationId };
}

function clampProgress(progressPct: number): number {
  return Math.max(0.02, Math.min(0.98, progressPct));
}

export class MockWmataIngestionService implements IWmataIngestionService {
  async fetchTrainPositions(): Promise<RawTrainPosition[]> {
    const now = Date.now();

    return trains.map((train, index) => {
      const { fromStationId, toStationId } = parseSegmentKey(train.segmentKey);
      const elapsedSeconds = (now - new Date(train.updatedAt).getTime()) / 1000;
      const progressDelta = ((train.speedKmh * 1000) / 3600 / 1100) * 0.035;
      const jitter = Math.sin(now / 4000 + index) * 0.012;
      const progressPct = clampProgress((train.progressPct + elapsedSeconds * progressDelta + jitter) % 1);
      const geometry = buildCurvedPolyline(train.lineId, fromStationId, toStationId, index + 1);
      const canonicalProgress = train.direction === 1 ? progressPct : 1 - progressPct;
      const interpolated = interpolateAlongPolyline(geometry, canonicalProgress);
      const bearing =
        train.direction === 1
          ? computeBearing(interpolated.tangentStart, interpolated.tangentEnd)
          : computeBearing(interpolated.tangentEnd, interpolated.tangentStart);

      return {
        trainId: train.trainId,
        tripId: train.tripId,
        lineId: train.lineId,
        direction: train.direction,
        latitude: interpolated.point.lat,
        longitude: interpolated.point.lng,
        bearing,
        speedKmh: train.speedKmh,
        currentStationId: train.direction === 1 ? fromStationId : toStationId,
        nextStationId: train.direction === 1 ? toStationId : fromStationId,
        progressPct,
        updatedAt: new Date(now).toISOString()
      };
    });
  }

  async fetchAlerts(): Promise<RawAlert[]> {
    return alerts.map((alert) => ({
      ...alert
    }));
  }
}

// TODO[WMATA-FEED]: Replace mock with real GTFS-RT protobuf fetch from WMATA_GTFS_RT_URL at the fetch boundary.
// TODO[WMATA-API]: Use WMATA_API_KEY header for authentication where the HTTP client would be configured.
