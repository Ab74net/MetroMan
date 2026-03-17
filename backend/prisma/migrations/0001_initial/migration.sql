CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE lines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  display_order INT NOT NULL
);

CREATE TABLE stations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  address TEXT,
  is_transfer_station BOOLEAN NOT NULL,
  has_elevator BOOLEAN NOT NULL,
  has_parking BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX stations_location_idx ON stations USING GIST (location);

CREATE TABLE station_lines (
  station_id TEXT NOT NULL REFERENCES stations(id),
  line_id TEXT NOT NULL REFERENCES lines(id),
  sequence INT NOT NULL,
  PRIMARY KEY (station_id, line_id)
);

CREATE TABLE route_segments (
  id SERIAL PRIMARY KEY,
  line_id TEXT NOT NULL REFERENCES lines(id),
  from_station_id TEXT NOT NULL REFERENCES stations(id),
  to_station_id TEXT NOT NULL REFERENCES stations(id),
  sequence INT NOT NULL,
  geometry GEOGRAPHY(LINESTRING, 4326) NOT NULL,
  length_meters DOUBLE PRECISION GENERATED ALWAYS AS (ST_Length(geometry)) STORED
);

COMMENT ON COLUMN route_segments.length_meters IS 'ST_Length returns the length of the geography geometry in meters.';

CREATE INDEX route_segments_geometry_idx ON route_segments USING GIST (geometry);

CREATE TABLE trips (
  id TEXT PRIMARY KEY,
  line_id TEXT NOT NULL REFERENCES lines(id),
  headsign TEXT NOT NULL,
  direction INT NOT NULL CHECK (direction IN (0, 1)),
  shape_id TEXT NOT NULL
);

CREATE TABLE train_positions (
  train_id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES trips(id),
  line_id TEXT NOT NULL REFERENCES lines(id),
  position GEOGRAPHY(POINT, 4326) NOT NULL,
  bearing DOUBLE PRECISION NOT NULL,
  speed_kmh DOUBLE PRECISION NOT NULL,
  current_station_id TEXT REFERENCES stations(id),
  next_station_id TEXT REFERENCES stations(id),
  progress_pct DOUBLE PRECISION NOT NULL CHECK (progress_pct >= 0 AND progress_pct <= 1),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE predictions (
  id SERIAL PRIMARY KEY,
  station_id TEXT NOT NULL REFERENCES stations(id),
  train_id TEXT NOT NULL REFERENCES train_positions(train_id),
  line_id TEXT NOT NULL REFERENCES lines(id),
  destination_id TEXT NOT NULL REFERENCES stations(id),
  minutes_away INT NOT NULL,
  car_count INT NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE alerts (
  id TEXT PRIMARY KEY,
  header TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'SEVERE')),
  affected_line_ids TEXT[] NOT NULL,
  affected_station_ids TEXT[] NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
