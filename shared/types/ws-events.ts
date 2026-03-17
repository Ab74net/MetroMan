import type { Alert, Prediction } from "./metro";

export type ServerEvent =
  | {
      type: "train:position";
      payload: {
        trainId: string;
        lineId: string;
        lat: number;
        lng: number;
        bearing: number;
        progressPct: number;
        segmentId: number;
        updatedAt: string;
      };
    }
  | {
      type: "alert:created";
      payload: Alert;
    }
  | {
      type: "prediction:update";
      payload: {
        stationId: string;
        predictions: Prediction[];
      };
    };

export type ClientEvent =
  | {
      type: "subscribe:station";
      payload: { stationId: string };
    }
  | {
      type: "subscribe:line";
      payload: { lineId: string };
    }
  | {
      type: "unsubscribe:station";
      payload: { stationId: string };
    }
  | {
      type: "unsubscribe:line";
      payload: { lineId: string };
    };
