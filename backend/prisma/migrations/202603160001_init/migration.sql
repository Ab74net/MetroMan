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
  is_transfer_station BOOLEAN NOT NULL DEFAULT FALSE,
  has_elevator BOOLEAN NOT NULL DEFAULT FALSE,
  has_parking BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX stations_location_gix ON stations USING GIST (location);

CREATE TABLE station_lines (
  station_id TEXT NOT NULL REFERENCES stations (id) ON DELETE CASCADE ON UPDATE CASCADE,
  line_id TEXT NOT NULL REFERENCES lines (id) ON DELETE CASCADE ON UPDATE CASCADE,
  sequence INT NOT NULL,
  PRIMARY KEY (station_id, line_id)
);

CREATE INDEX station_lines_line_sequence_idx ON station_lines (line_id, sequence);

CREATE TABLE route_segments (
  id SERIAL PRIMARY KEY,
  line_id TEXT NOT NULL REFERENCES lines (id) ON DELETE CASCADE ON UPDATE CASCADE,
  from_station_id TEXT NOT NULL REFERENCES stations (id) ON DELETE CASCADE ON UPDATE CASCADE,
  to_station_id TEXT NOT NULL REFERENCES stations (id) ON DELETE CASCADE ON UPDATE CASCADE,
  sequence INT NOT NULL,
  geometry GEOGRAPHY(LINESTRING, 4326) NOT NULL,
  -- ST_Length returns the geodesic length of the stored geography segment in meters.
  length_meters DOUBLE PRECISION GENERATED ALWAYS AS (ST_Length(geometry)) STORED
);

CREATE INDEX route_segments_geometry_gix ON route_segments USING GIST (geometry);
CREATE INDEX route_segments_line_sequence_idx ON route_segments (line_id, sequence);

CREATE TABLE trips (
  id TEXT PRIMARY KEY,
  line_id TEXT NOT NULL REFERENCES lines (id) ON DELETE CASCADE ON UPDATE CASCADE,
  headsign TEXT NOT NULL,
  direction INT NOT NULL CHECK (direction IN (0, 1)),
  shape_id TEXT NOT NULL
);

CREATE INDEX trips_line_direction_idx ON trips (line_id, direction);

CREATE TABLE train_positions (
  train_id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES trips (id) ON DELETE CASCADE ON UPDATE CASCADE,
  line_id TEXT NOT NULL REFERENCES lines (id) ON DELETE CASCADE ON UPDATE CASCADE,
  position GEOGRAPHY(POINT, 4326) NOT NULL,
  bearing DOUBLE PRECISION NOT NULL,
  speed_kmh DOUBLE PRECISION NOT NULL,
  current_station_id TEXT REFERENCES stations (id) ON DELETE SET NULL ON UPDATE CASCADE,
  next_station_id TEXT REFERENCES stations (id) ON DELETE SET NULL ON UPDATE CASCADE,
  progress_pct DOUBLE PRECISION NOT NULL CHECK (progress_pct >= 0.0 AND progress_pct <= 1.0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX train_positions_line_updated_idx ON train_positions (line_id, updated_at);
CREATE INDEX train_positions_trip_idx ON train_positions (trip_id);

CREATE TABLE predictions (
  id SERIAL PRIMARY KEY,
  station_id TEXT NOT NULL REFERENCES stations (id) ON DELETE CASCADE ON UPDATE CASCADE,
  train_id TEXT NOT NULL REFERENCES train_positions (train_id) ON DELETE CASCADE ON UPDATE CASCADE,
  line_id TEXT NOT NULL REFERENCES lines (id) ON DELETE CASCADE ON UPDATE CASCADE,
  destination_id TEXT NOT NULL REFERENCES stations (id) ON DELETE CASCADE ON UPDATE CASCADE,
  minutes_away INT NOT NULL,
  car_count INT NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX predictions_station_captured_idx ON predictions (station_id, captured_at);

CREATE TABLE alerts (
  id TEXT PRIMARY KEY,
  header TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'SEVERE')),
  affected_line_ids TEXT[] NOT NULL DEFAULT '{}',
  affected_station_ids TEXT[] NOT NULL DEFAULT '{}',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
