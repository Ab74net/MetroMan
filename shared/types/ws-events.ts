import {
  isAlertSeverity,
  isLineId,
  type Alert,
  type LineId,
  type Prediction
} from "./metro";

export const SERVER_EVENT_TYPE = {
  TRAIN_POSITION: "train:position",
  ALERT_CREATED: "alert:created",
  PREDICTION_UPDATE: "prediction:update"
} as const;

export const CLIENT_EVENT_TYPE = {
  SUBSCRIBE_STATION: "subscribe:station",
  SUBSCRIBE_LINE: "subscribe:line",
  UNSUBSCRIBE_STATION: "unsubscribe:station",
  UNSUBSCRIBE_LINE: "unsubscribe:line"
} as const;

export type ServerEventType = (typeof SERVER_EVENT_TYPE)[keyof typeof SERVER_EVENT_TYPE];
export type ClientEventType = (typeof CLIENT_EVENT_TYPE)[keyof typeof CLIENT_EVENT_TYPE];

export interface TrainPositionEvent {
  type: typeof SERVER_EVENT_TYPE.TRAIN_POSITION;
  payload: {
    trainId: string;
    lineId: LineId;
    lat: number;
    lng: number;
    bearing: number;
    progressPct: number;
    segmentId: number;
    updatedAt: string;
  };
}

export interface AlertCreatedEvent {
  type: typeof SERVER_EVENT_TYPE.ALERT_CREATED;
  payload: Alert;
}

export interface PredictionUpdateEvent {
  type: typeof SERVER_EVENT_TYPE.PREDICTION_UPDATE;
  payload: {
    stationId: string;
    predictions: Prediction[];
  };
}

export type ServerEvent = TrainPositionEvent | AlertCreatedEvent | PredictionUpdateEvent;

export interface SubscribeStationEvent {
  type: typeof CLIENT_EVENT_TYPE.SUBSCRIBE_STATION;
  payload: {
    stationId: string;
  };
}

export interface SubscribeLineEvent {
  type: typeof CLIENT_EVENT_TYPE.SUBSCRIBE_LINE;
  payload: {
    lineId: LineId;
  };
}

export interface UnsubscribeStationEvent {
  type: typeof CLIENT_EVENT_TYPE.UNSUBSCRIBE_STATION;
  payload: {
    stationId: string;
  };
}

export interface UnsubscribeLineEvent {
  type: typeof CLIENT_EVENT_TYPE.UNSUBSCRIBE_LINE;
  payload: {
    lineId: LineId;
  };
}

export type ClientEvent =
  | SubscribeStationEvent
  | SubscribeLineEvent
  | UnsubscribeStationEvent
  | UnsubscribeLineEvent;

const SERVER_EVENT_TYPE_SET = new Set<ServerEventType>(Object.values(SERVER_EVENT_TYPE));
const CLIENT_EVENT_TYPE_SET = new Set<ClientEventType>(Object.values(CLIENT_EVENT_TYPE));

export function isServerEventType(value: string): value is ServerEventType {
  return SERVER_EVENT_TYPE_SET.has(value as ServerEventType);
}

export function isClientEventType(value: string): value is ClientEventType {
  return CLIENT_EVENT_TYPE_SET.has(value as ClientEventType);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasString(value: unknown): value is string {
  return typeof value === "string";
}

function hasNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isAlert(value: unknown): value is Alert {
  if (!isRecord(value)) {
    return false;
  }

  return (
    hasString(value.id) &&
    hasString(value.header) &&
    hasString(value.description) &&
    hasString(value.severity) &&
    isAlertSeverity(value.severity) &&
    Array.isArray(value.affectedLineIds) &&
    value.affectedLineIds.every((lineId) => hasString(lineId) && isLineId(lineId)) &&
    Array.isArray(value.affectedStationIds) &&
    value.affectedStationIds.every(hasString) &&
    hasString(value.startsAt) &&
    (value.endsAt === null || hasString(value.endsAt)) &&
    hasString(value.createdAt)
  );
}

function isPrediction(value: unknown): value is Prediction {
  if (!isRecord(value)) {
    return false;
  }

  return (
    hasNumber(value.id) &&
    hasString(value.stationId) &&
    hasString(value.trainId) &&
    hasString(value.lineId) &&
    isLineId(value.lineId) &&
    hasString(value.destinationId) &&
    hasNumber(value.minutesAway) &&
    hasNumber(value.carCount) &&
    hasString(value.capturedAt)
  );
}

export function isServerEvent(value: unknown): value is ServerEvent {
  if (!isRecord(value) || !hasString(value.type) || !isServerEventType(value.type) || !isRecord(value.payload)) {
    return false;
  }

  if (value.type === SERVER_EVENT_TYPE.TRAIN_POSITION) {
    return (
      hasString(value.payload.trainId) &&
      hasString(value.payload.lineId) &&
      isLineId(value.payload.lineId) &&
      hasNumber(value.payload.lat) &&
      hasNumber(value.payload.lng) &&
      hasNumber(value.payload.bearing) &&
      hasNumber(value.payload.progressPct) &&
      hasNumber(value.payload.segmentId) &&
      hasString(value.payload.updatedAt)
    );
  }

  if (value.type === SERVER_EVENT_TYPE.ALERT_CREATED) {
    return isAlert(value.payload);
  }

  return (
    hasString(value.payload.stationId) &&
    Array.isArray(value.payload.predictions) &&
    value.payload.predictions.every(isPrediction)
  );
}

export function isClientEvent(value: unknown): value is ClientEvent {
  if (!isRecord(value) || !hasString(value.type) || !isClientEventType(value.type) || !isRecord(value.payload)) {
    return false;
  }

  if (
    value.type === CLIENT_EVENT_TYPE.SUBSCRIBE_STATION ||
    value.type === CLIENT_EVENT_TYPE.UNSUBSCRIBE_STATION
  ) {
    return hasString(value.payload.stationId);
  }

  return hasString(value.payload.lineId) && isLineId(value.payload.lineId);
}
