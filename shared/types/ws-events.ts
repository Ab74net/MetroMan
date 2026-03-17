import type { Alert, LineId, Prediction } from "./metro";

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
