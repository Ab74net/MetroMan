import type { Alert, Line, Prediction, Station, TrainPosition } from "./metro";

export interface ApiErrorResponse {
  error: string;
  code: string;
}

export type GeoPoint = {
  lat: number;
  lng: number;
};

export interface StationLineAssociationResponse {
  line: Line;
  sequence: number;
}

export interface ApiStation extends Omit<Station, "latitude" | "longitude"> {
  location: GeoPoint;
  stationLines: StationLineAssociationResponse[];
}

export interface GetStationsResponse {
  stations: ApiStation[];
}

export interface GetStationResponse {
  station: ApiStation;
  predictions: Prediction[];
  alerts: Alert[];
}

export interface GetLinesResponse {
  lines: Line[];
}

export type GeoJsonPosition = [number, number];

export interface GeoJsonLineStringGeometry {
  type: "LineString";
  coordinates: GeoJsonPosition[];
}

export interface GeoJsonFeature<Geometry = GeoJsonLineStringGeometry, Properties extends object = Record<string, unknown>> {
  type: "Feature";
  geometry: Geometry;
  properties: Properties;
}

export interface GeoJsonFeatureCollection<
  Feature extends GeoJsonFeature<any, any> = GeoJsonFeature
> {
  type: "FeatureCollection";
  features: Feature[];
}

export interface LineRouteSegmentFeatureProperties {
  line_id: Line["id"];
  from_station_id: string;
  to_station_id: string;
  sequence: number;
}

export type LineRouteSegmentFeature = GeoJsonFeature<
  GeoJsonLineStringGeometry,
  LineRouteSegmentFeatureProperties
>;

export type LineRouteFeatureCollection = GeoJsonFeatureCollection<LineRouteSegmentFeature>;

export type GetLineRouteResponse = LineRouteFeatureCollection;

export interface GetTrainsResponse {
  trains: TrainPosition[];
}

export interface InterpolatedPosition {
  lat: number;
  lng: number;
  bearing: number;
  progressPct: number;
}

export interface GetTrainResponse {
  train: TrainPosition;
  interpolated: InterpolatedPosition;
}

export interface GetAlertsResponse {
  alerts: Alert[];
}

export type TripPlannerMode = "depart" | "arrive";

export interface TripPlannerPlace {
  name: string;
  lat?: number;
  lng?: number;
  stopId?: string;
}

export interface TripPlannerLeg {
  mode: string;
  startTime: number;
  endTime: number;
  from: TripPlannerPlace;
  to: TripPlannerPlace;
  distance: number;
}

export interface TripPlannerItinerary {
  duration: number;
  startTime: number;
  endTime: number;
  legs: TripPlannerLeg[];
}

export interface TripPlanResult {
  itineraries: TripPlannerItinerary[];
}

export interface TripPlannerPlanRequest {
  origin: string;
  destination: string;
  departAt: string;
  mode: TripPlannerMode;
}

export type TripPlannerPlanResponse = TripPlanResult;

export interface StationIdParams {
  id: string;
}

export interface LineIdParams {
  id: string;
}

export interface TrainIdParams {
  id: string;
}
