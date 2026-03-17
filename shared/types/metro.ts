export const LINE_IDS = ["red", "blue", "orange", "silver", "green", "yellow"] as const;
export const ALERT_SEVERITIES = ["INFO", "WARNING", "SEVERE"] as const;

export type LineId = (typeof LINE_IDS)[number];
export type TrainDirection = 0 | 1;
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];

export interface Line {
  id: LineId;
  name: string;
  colorHex: string;
  displayOrder: number;
}

export interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  isTransferStation: boolean;
  hasElevator: boolean;
  hasParking: boolean;
  createdAt: string;
}

export interface StationLine {
  stationId: string;
  lineId: LineId;
  sequence: number;
}

export interface RouteSegment {
  id: number;
  lineId: LineId;
  fromStationId: string;
  toStationId: string;
  sequence: number;
  coordinates: Array<[number, number]>;
  lengthMeters: number;
}

export interface Trip {
  id: string;
  lineId: LineId;
  headsign: string;
  direction: TrainDirection;
  shapeId: string;
}

export interface TrainPosition {
  trainId: string;
  tripId: string;
  lineId: LineId;
  latitude: number;
  longitude: number;
  bearing: number;
  speedKmh: number;
  currentStationId: string | null;
  nextStationId: string | null;
  progressPct: number;
  updatedAt: string;
}

export interface Prediction {
  id: number;
  stationId: string;
  trainId: string;
  lineId: LineId;
  destinationId: string;
  minutesAway: number;
  carCount: number;
  capturedAt: string;
}

export interface Alert {
  id: string;
  header: string;
  description: string;
  severity: AlertSeverity;
  affectedLineIds: LineId[];
  affectedStationIds: string[];
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
}

const lineIdSet = new Set<LineId>(LINE_IDS);
const alertSeveritySet = new Set<AlertSeverity>(ALERT_SEVERITIES);

export function isLineId(value: string): value is LineId {
  return lineIdSet.has(value as LineId);
}

export function isAlertSeverity(value: string): value is AlertSeverity {
  return alertSeveritySet.has(value as AlertSeverity);
}
