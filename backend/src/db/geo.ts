import {
  curveOverrides,
  defaultCurveByLine,
  stationById,
  type LineId,
  type Coordinate,
  type CurveProfile
} from "./mock-network";

export type RouteSegmentSeed = {
  lineId: LineId;
  fromStationId: string;
  toStationId: string;
  sequence: number;
  coordinates: Coordinate[];
};

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function toDegrees(value: number): number {
  return (value * 180) / Math.PI;
}

export function roundCoordinate(value: number): number {
  return Number(value.toFixed(6));
}

function hashString(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function interpolate(a: Coordinate, b: Coordinate, t: number): Coordinate {
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t
  };
}

function cubicBezierPoint(
  start: Coordinate,
  controlOne: Coordinate,
  controlTwo: Coordinate,
  end: Coordinate,
  t: number
): Coordinate {
  const oneMinusT = 1 - t;
  const weightStart = oneMinusT ** 3;
  const weightControlOne = 3 * oneMinusT ** 2 * t;
  const weightControlTwo = 3 * oneMinusT * t ** 2;
  const weightEnd = t ** 3;

  return {
    lat:
      start.lat * weightStart +
      controlOne.lat * weightControlOne +
      controlTwo.lat * weightControlTwo +
      end.lat * weightEnd,
    lng:
      start.lng * weightStart +
      controlOne.lng * weightControlOne +
      controlTwo.lng * weightControlTwo +
      end.lng * weightEnd
  };
}

export function haversineMeters(a: Coordinate, b: Coordinate): number {
  const earthRadiusMeters = 6371000;
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLng = toRadians(b.lng - a.lng);
  const startLat = toRadians(a.lat);
  const endLat = toRadians(b.lat);

  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(deltaLng / 2) ** 2;

  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(haversine));
}

export function computeBearing(from: Coordinate, to: Coordinate): number {
  const startLat = toRadians(from.lat);
  const endLat = toRadians(to.lat);
  const deltaLng = toRadians(to.lng - from.lng);

  const y = Math.sin(deltaLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(deltaLng);

  const bearing = (toDegrees(Math.atan2(y, x)) + 360) % 360;
  return Number(bearing.toFixed(2));
}

export function getCurveProfile(
  lineId: LineId,
  fromStationId: string,
  toStationId: string,
  sequence: number
): CurveProfile {
  const key = `${lineId}:${fromStationId}->${toStationId}`;
  const defaultBend = defaultCurveByLine[lineId] * (hashString(`${key}:${sequence}`) % 2 === 0 ? 1 : -1);
  const override = curveOverrides[key];

  return {
    bend: override?.bend ?? defaultBend,
    secondaryBend: override?.secondaryBend ?? defaultBend * -0.45,
    wiggle: override?.wiggle ?? 0.004,
    bias: override?.bias ?? 0
  };
}

export function buildCurvedPolyline(
  lineId: LineId,
  fromStationId: string,
  toStationId: string,
  sequence: number
): Coordinate[] {
  const fromStation = stationById.get(fromStationId);
  const toStation = stationById.get(toStationId);

  if (!fromStation || !toStation) {
    throw new Error(`Missing station for route segment ${lineId}:${fromStationId}->${toStationId}`);
  }

  const profile = getCurveProfile(lineId, fromStationId, toStationId, sequence);
  const deltaLng = toStation.lng - fromStation.lng;
  const deltaLat = toStation.lat - fromStation.lat;
  const chordLength = Math.sqrt(deltaLng ** 2 + deltaLat ** 2);
  const normalLng = chordLength === 0 ? 0 : -deltaLat / chordLength;
  const normalLat = chordLength === 0 ? 0 : deltaLng / chordLength;

  const controlOne: Coordinate = {
    lat:
      fromStation.lat +
      deltaLat * 0.33 +
      normalLat * profile.bend * chordLength +
      deltaLat * profile.bias * 0.04,
    lng:
      fromStation.lng +
      deltaLng * 0.33 +
      normalLng * profile.bend * chordLength +
      deltaLng * profile.bias * 0.04
  };

  const controlTwo: Coordinate = {
    lat:
      fromStation.lat +
      deltaLat * 0.68 +
      normalLat * profile.secondaryBend * chordLength -
      deltaLat * profile.bias * 0.04,
    lng:
      fromStation.lng +
      deltaLng * 0.68 +
      normalLng * profile.secondaryBend * chordLength -
      deltaLng * profile.bias * 0.04
  };

  const points: Coordinate[] = [];
  const pointCount = 14;

  for (let index = 0; index < pointCount; index += 1) {
    const t = index / (pointCount - 1);
    const basePoint = cubicBezierPoint(fromStation, controlOne, controlTwo, toStation, t);
    const wiggleFactor = Math.sin(Math.PI * t) * Math.sin(Math.PI * t * 2) * profile.wiggle * chordLength;

    points.push({
      lat: roundCoordinate(basePoint.lat + normalLat * wiggleFactor),
      lng: roundCoordinate(basePoint.lng + normalLng * wiggleFactor)
    });
  }

  points[0] = { lat: fromStation.lat, lng: fromStation.lng };
  points[points.length - 1] = { lat: toStation.lat, lng: toStation.lng };

  return points;
}

export function polylineLength(points: Coordinate[]): number {
  let totalMeters = 0;

  for (let index = 1; index < points.length; index += 1) {
    totalMeters += haversineMeters(points[index - 1], points[index]);
  }

  return totalMeters;
}

export function interpolateAlongPolyline(points: Coordinate[], progress: number): {
  point: Coordinate;
  tangentStart: Coordinate;
  tangentEnd: Coordinate;
  traveledMeters: number;
  totalMeters: number;
} {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const totalMeters = polylineLength(points);
  const targetMeters = totalMeters * clampedProgress;

  let walkedMeters = 0;

  for (let index = 1; index < points.length; index += 1) {
    const segmentStart = points[index - 1];
    const segmentEnd = points[index];
    const segmentMeters = haversineMeters(segmentStart, segmentEnd);

    if (walkedMeters + segmentMeters >= targetMeters) {
      const localProgress = segmentMeters === 0 ? 0 : (targetMeters - walkedMeters) / segmentMeters;
      return {
        point: interpolate(segmentStart, segmentEnd, localProgress),
        tangentStart: segmentStart,
        tangentEnd: segmentEnd,
        traveledMeters: targetMeters,
        totalMeters
      };
    }

    walkedMeters += segmentMeters;
  }

  return {
    point: points[points.length - 1],
    tangentStart: points[points.length - 2],
    tangentEnd: points[points.length - 1],
    traveledMeters: totalMeters,
    totalMeters
  };
}

export function pointToWkt(point: Coordinate): string {
  return `POINT(${point.lng.toFixed(6)} ${point.lat.toFixed(6)})`;
}

export function lineToWkt(points: Coordinate[]): string {
  return `LINESTRING(${points.map((point) => `${point.lng.toFixed(6)} ${point.lat.toFixed(6)}`).join(", ")})`;
}
