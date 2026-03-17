import { Client } from "pg";
import { config } from "../config";
import { logger } from "../utils/logger";

type LineId = "red" | "blue" | "orange" | "silver" | "green" | "yellow";

const lineDefinitions = [
  { id: "red", name: "Red Line", colorHex: "#BF0D3E", displayOrder: 1 },
  { id: "blue", name: "Blue Line", colorHex: "#009CDE", displayOrder: 2 },
  { id: "orange", name: "Orange Line", colorHex: "#ED8B00", displayOrder: 3 },
  { id: "silver", name: "Silver Line", colorHex: "#919D9D", displayOrder: 4 },
  { id: "green", name: "Green Line", colorHex: "#00B140", displayOrder: 5 },
  { id: "yellow", name: "Yellow Line", colorHex: "#FFD100", displayOrder: 6 }
] as const;

interface StationDefinition {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  isTransferStation: boolean;
  hasElevator: boolean;
  hasParking: boolean;
}

const stations: StationDefinition[] = [
  {
    id: "C01",
    name: "Metro Center",
    latitude: 38.898312,
    longitude: -77.028094,
    address: "607 13th St NW, Washington, DC 20005",
    isTransferStation: true,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "B01",
    name: "Gallery Place-Chinatown",
    latitude: 38.898305,
    longitude: -77.021915,
    address: "200 G St NW, Washington, DC 20001",
    isTransferStation: true,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "B03",
    name: "Union Station",
    latitude: 38.897659,
    longitude: -77.006384,
    address: "50 Massachusetts Ave NE, Washington, DC 20002",
    isTransferStation: false,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "A02",
    name: "Farragut North",
    latitude: 38.903113,
    longitude: -77.038493,
    address: "17th St NW & K St NW, Washington, DC 20006",
    isTransferStation: true,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "A03",
    name: "Dupont Circle",
    latitude: 38.909428,
    longitude: -77.043118,
    address: "1600 19th St NW, Washington, DC 20009",
    isTransferStation: false,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "A04",
    name: "Woodley Park-Zoo/Adams Morgan",
    latitude: 38.924868,
    longitude: -77.053333,
    address: "3000 Connecticut Ave NW, Washington, DC 20008",
    isTransferStation: false,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "A09",
    name: "Bethesda",
    latitude: 38.984327,
    longitude: -77.094668,
    address: "7400 Wisconsin Ave, Bethesda, MD 20814",
    isTransferStation: false,
    hasElevator: true,
    hasParking: true
  },
  {
    id: "A15",
    name: "Shady Grove",
    latitude: 39.118256,
    longitude: -77.174700,
    address: "15901 Somerville Dr, Rockville, MD 20855",
    isTransferStation: false,
    hasElevator: true,
    hasParking: true
  },
  {
    id: "C07",
    name: "Pentagon",
    latitude: 38.869620,
    longitude: -77.056597,
    address: "Washington Blvd & Route 27, Arlington, VA 22202",
    isTransferStation: true,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "C06",
    name: "Arlington Cemetery",
    latitude: 38.870638,
    longitude: -77.051833,
    address: "1 Arlington Cemetery, Arlington, VA 22211",
    isTransferStation: false,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "C05",
    name: "Rosslyn",
    latitude: 38.895013,
    longitude: -77.074236,
    address: "1911 North Moore St, Arlington, VA 22209",
    isTransferStation: true,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "C04",
    name: "Foggy Bottom-GWU",
    latitude: 38.900702,
    longitude: -77.051425,
    address: "2221 I St NW, Washington, DC 20037",
    isTransferStation: false,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "C03",
    name: "Farragut West",
    latitude: 38.903301,
    longitude: -77.039751,
    address: "17th St & I St NW, Washington, DC 20006",
    isTransferStation: false,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "C02",
    name: "McPherson Square",
    latitude: 38.901333,
    longitude: -77.032345,
    address: "14th St NW & I St NW, Washington, DC 20001",
    isTransferStation: false,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "D01",
    name: "Federal Triangle",
    latitude: 38.893628,
    longitude: -77.028916,
    address: "12th St & Pennsylvania Ave NW, Washington, DC 20004",
    isTransferStation: true,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "D02",
    name: "Smithsonian",
    latitude: 38.888045,
    longitude: -77.026108,
    address: "Independence Ave SW & 12th St SW, Washington, DC 20560",
    isTransferStation: true,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "D03",
    name: "L'Enfant Plaza",
    latitude: 38.884295,
    longitude: -77.018508,
    address: "10th St & D St SW, Washington, DC 20024",
    isTransferStation: true,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "C09",
    name: "Pentagon City",
    latitude: 38.865435,
    longitude: -77.056344,
    address: "1201 S Hayes St, Arlington, VA 22202",
    isTransferStation: false,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "C10",
    name: "Crystal City",
    latitude: 38.853795,
    longitude: -77.056542,
    address: "1950 Crystal Dr, Arlington, VA 22202",
    isTransferStation: false,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "C11",
    name: "Reagan National Airport",
    latitude: 38.851296,
    longitude: -77.042482,
    address: "2401 Smith Blvd, Arlington, VA 22202",
    isTransferStation: false,
    hasElevator: true,
    hasParking: false
  }
];

const lineRoutes: Record<LineId, string[]> = {
  red: ["A15", "A09", "A04", "A03", "A02", "C01", "B01", "B03"],
  blue: ["C07", "C06", "C05", "C04", "C03", "C02", "C01", "D01", "D02", "D03"],
  orange: [
    "C05",
    "C04",
    "C03",
    "C02",
    "C01",
    "D01",
    "D02",
    "D03",
    "C09",
    "C10",
    "C11"
  ],
  silver: ["C05", "C04", "C03", "C02", "C01", "D01", "D02", "D03", "C11"],
  green: ["B01", "C01", "D01", "D02", "D03"],
  yellow: ["C07", "C09", "C10", "C11", "D03"]
};

const stationsMap = new Map(stations.map((station) => [station.id, station]));

const now = new Date().toISOString();

const trips = [
  { id: "red-uptown-01", lineId: "red" as LineId, headsign: "Shady Grove", direction: 0, shapeId: "red-shape-01" },
  { id: "red-downtown-01", lineId: "red" as LineId, headsign: "Glenmont via Metro Center", direction: 1, shapeId: "red-shape-02" },
  { id: "blue-pentagon-01", lineId: "blue" as LineId, headsign: "Pentagon", direction: 0, shapeId: "blue-shape-01" },
  { id: "blue-downtown-01", lineId: "blue" as LineId, headsign: "Gallery Place", direction: 1, shapeId: "blue-shape-02" },
  { id: "orange-rosslyn-01", lineId: "orange" as LineId, headsign: "Rosslyn", direction: 0, shapeId: "orange-shape-01" },
  { id: "orange-downtown-01", lineId: "orange" as LineId, headsign: "New Carrollton", direction: 1, shapeId: "orange-shape-02" },
  { id: "silver-west-01", lineId: "silver" as LineId, headsign: "Wiehle-Reston East", direction: 0, shapeId: "silver-shape-01" },
  { id: "silver-east-01", lineId: "silver" as LineId, headsign: "L'Enfant Plaza", direction: 1, shapeId: "silver-shape-02" },
  { id: "green-downtown-01", lineId: "green" as LineId, headsign: "Greenbelt", direction: 0, shapeId: "green-shape-01" },
  { id: "green-south-01", lineId: "green" as LineId, headsign: "Branch Ave", direction: 1, shapeId: "green-shape-02" },
  { id: "yellow-downtown-01", lineId: "yellow" as LineId, headsign: "L'Enfant Plaza", direction: 0, shapeId: "yellow-shape-01" },
  { id: "yellow-pentagon-01", lineId: "yellow" as LineId, headsign: "Pentagon", direction: 1, shapeId: "yellow-shape-02" }
];

const trainPositions = [
  {
    trainId: "red-202",
    tripId: "red-uptown-01",
    lineId: "red" as LineId,
    currentStationId: "A15",
    nextStationId: "A09",
    progressPct: 0.26,
    speedKmh: 68
  },
  {
    trainId: "red-141",
    tripId: "red-downtown-01",
    lineId: "red" as LineId,
    currentStationId: "A03",
    nextStationId: "A02",
    progressPct: 0.72,
    speedKmh: 54
  },
  {
    trainId: "blue-303",
    tripId: "blue-pentagon-01",
    lineId: "blue" as LineId,
    currentStationId: "C07",
    nextStationId: "C06",
    progressPct: 0.42,
    speedKmh: 61
  },
  {
    trainId: "blue-318",
    tripId: "blue-downtown-01",
    lineId: "blue" as LineId,
    currentStationId: "C01",
    nextStationId: "D01",
    progressPct: 0.35,
    speedKmh: 58
  },
  {
    trainId: "orange-221",
    tripId: "orange-rosslyn-01",
    lineId: "orange" as LineId,
    currentStationId: "C05",
    nextStationId: "C04",
    progressPct: 0.61,
    speedKmh: 60
  },
  {
    trainId: "orange-232",
    tripId: "orange-downtown-01",
    lineId: "orange" as LineId,
    currentStationId: "D03",
    nextStationId: "C09",
    progressPct: 0.47,
    speedKmh: 62
  },
  {
    trainId: "silver-107",
    tripId: "silver-west-01",
    lineId: "silver" as LineId,
    currentStationId: "C03",
    nextStationId: "C02",
    progressPct: 0.19,
    speedKmh: 55
  },
  {
    trainId: "silver-198",
    tripId: "silver-east-01",
    lineId: "silver" as LineId,
    currentStationId: "D01",
    nextStationId: "D02",
    progressPct: 0.54,
    speedKmh: 59
  },
  {
    trainId: "green-502",
    tripId: "green-downtown-01",
    lineId: "green" as LineId,
    currentStationId: "B01",
    nextStationId: "C01",
    progressPct: 0.43,
    speedKmh: 53
  },
  {
    trainId: "green-517",
    tripId: "green-south-01",
    lineId: "green" as LineId,
    currentStationId: "C01",
    nextStationId: "D01",
    progressPct: 0.82,
    speedKmh: 57
  },
  {
    trainId: "yellow-404",
    tripId: "yellow-downtown-01",
    lineId: "yellow" as LineId,
    currentStationId: "C09",
    nextStationId: "C10",
    progressPct: 0.33,
    speedKmh: 64
  },
  {
    trainId: "yellow-422",
    tripId: "yellow-pentagon-01",
    lineId: "yellow" as LineId,
    currentStationId: "C10",
    nextStationId: "C11",
    progressPct: 0.17,
    speedKmh: 61
  }
];

const predictions = [
  {
    stationId: "C03",
    trainId: "red-202",
    lineId: "red" as LineId,
    destinationId: "B03",
    minutesAway: 3,
    carCount: 8
  },
  {
    stationId: "D01",
    trainId: "blue-318",
    lineId: "blue" as LineId,
    destinationId: "D03",
    minutesAway: 1,
    carCount: 6
  },
  {
    stationId: "C09",
    trainId: "yellow-422",
    lineId: "yellow" as LineId,
    destinationId: "D03",
    minutesAway: 2,
    carCount: 6
  }
];

const alerts = [
  {
    id: "alert-001",
    header: "Signal issue between Rosslyn and Foggy Bottom",
    description: "Slower trains between Rosslyn and Foggy Bottom due to maintenance cleaning.",
    severity: "WARNING" as const,
    affectedLineIds: ["blue", "orange", "silver"] as LineId[],
    affectedStationIds: ["C05", "C04"],
    startsAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 40 * 60 * 1000).toISOString()
  },
  {
    id: "alert-002",
    header: "Limited Yellow/Blue service near Pentagon",
    description: "Single-track work is trimming headways at Pentagon and Pentagon City.",
    severity: "WARNING" as const,
    affectedLineIds: ["blue", "yellow"] as LineId[],
    affectedStationIds: ["C07", "C09"],
    startsAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 25 * 60 * 1000).toISOString()
  },
  {
    id: "alert-003",
    header: "Elevator outage at Dupont Circle",
    description: "Elevator temporarily out of service; expect longer exits.",
    severity: "INFO" as const,
    affectedLineIds: ["red"],
    affectedStationIds: ["A03"],
    startsAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 120 * 60 * 1000).toISOString()
  },
  {
    id: "alert-004",
    header: "Severe disruption along National Mall",
    description: "Track work between Federal Triangle, Smithsonian, and L'Enfant Plaza.",
    severity: "SEVERE" as const,
    affectedLineIds: ["orange", "silver", "green"],
    affectedStationIds: ["D01", "D02", "D03"],
    startsAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
  }
];

const client = new Client({ connectionString: config.DATABASE_URL });

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const toDegrees = (radians: number) => (radians * 180) / Math.PI;

// Bearing uses the initial bearing formula between two geographic coordinates.
const calculateBearing = (from: StationDefinition, to: StationDefinition) => {
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const deltaLon = toRadians(to.longitude - from.longitude);

  const y = Math.sin(deltaLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);
  const bearingRadians = Math.atan2(y, x);
  return (toDegrees(bearingRadians) + 360) % 360;
};

const interpolatePosition = (
  from: StationDefinition,
  to: StationDefinition,
  progress: number
) => {
  const offsetFactor = Math.sin(Math.PI * progress) * 0.00018;
  const lat =
    from.latitude + (to.latitude - from.latitude) * progress + offsetFactor;
  const lon =
    from.longitude + (to.longitude - from.longitude) * progress - offsetFactor;
  return { latitude: lat, longitude: lon };
};

const generateSegmentGeometry = (
  from: StationDefinition,
  to: StationDefinition
): string => {
  const points = [{ latitude: from.latitude, longitude: from.longitude }];
  for (let i = 1; i <= 10; i += 1) {
    const ratio = i / 11;
    const offset = Math.sin(Math.PI * ratio) * 0.0002;
    const latitude = from.latitude + (to.latitude - from.latitude) * ratio + offset;
    const longitude =
      from.longitude + (to.longitude - from.longitude) * ratio - offset;
    points.push({ latitude, longitude });
  }
  points.push({ latitude: to.latitude, longitude: to.longitude });
  const coordinateStrings = points.map(
    (point) => `${point.longitude} ${point.latitude}`
  );
  return `SRID=4326;LINESTRING(${coordinateStrings.join(",")})`;
};

const formatPoint = (latitude: number, longitude: number) =>
  `SRID=4326;POINT(${longitude} ${latitude})`;

const seedDatabase = async () => {
  await client.connect();
  try {
    logger.info("Reloading Metro schema and seed data.");
    await client.query(
      "TRUNCATE alerts, predictions, train_positions, route_segments, station_lines, trips, stations, lines RESTART IDENTITY CASCADE"
    );

    for (const line of lineDefinitions) {
      await client.query(
        "INSERT INTO lines (id, name, color_hex, display_order) VALUES ($1, $2, $3, $4)",
        [line.id, line.name, line.colorHex, line.displayOrder]
      );
    }

    for (const station of stations) {
      await client.query(
        "INSERT INTO stations (id, name, location, address, is_transfer_station, has_elevator, has_parking, created_at) VALUES ($1, $2, ST_GeogFromText($3), $4, $5, $6, $7, $8)",
        [
          station.id,
          station.name,
          formatPoint(station.latitude, station.longitude),
          station.address,
          station.isTransferStation,
          station.hasElevator,
          station.hasParking,
          now
        ]
      );
    }

    for (const [lineId, route] of Object.entries(lineRoutes) as [LineId, string[]][]) {
      for (let index = 0; index < route.length; index += 1) {
        const stationId = route[index];
        const sequence = index + 1;
        await client.query(
          "INSERT INTO station_lines (station_id, line_id, sequence) VALUES ($1, $2, $3)",
          [stationId, lineId, sequence]
        );
      }
    }

    for (const [lineId, route] of Object.entries(lineRoutes) as [LineId, string[]][]) {
      for (let i = 0; i < route.length - 1; i += 1) {
        const fromStation = stationsMap.get(route[i]);
        const toStation = stationsMap.get(route[i + 1]);
        if (!fromStation || !toStation) {
          throw new Error(`Missing station definition for ${route[i]} or ${route[i + 1]}`);
        }
        const geometry = generateSegmentGeometry(fromStation, toStation);
        await client.query(
          "INSERT INTO route_segments (line_id, from_station_id, to_station_id, sequence, geometry) VALUES ($1, $2, $3, $4, ST_GeogFromText($5))",
          [lineId, fromStation.id, toStation.id, i + 1, geometry]
        );
      }
    }

    for (const trip of trips) {
      await client.query(
        "INSERT INTO trips (id, line_id, headsign, direction, shape_id) VALUES ($1, $2, $3, $4, $5)",
        [trip.id, trip.lineId, trip.headsign, trip.direction, trip.shapeId]
      );
    }

    for (const train of trainPositions) {
      const fromStation = stationsMap.get(train.currentStationId);
      const toStation = stationsMap.get(train.nextStationId);
      if (!fromStation || !toStation) continue;
      const { latitude, longitude } = interpolatePosition(
        fromStation,
        toStation,
        train.progressPct
      );
      const bearing = calculateBearing(fromStation, toStation);
      await client.query(
        "INSERT INTO train_positions (train_id, trip_id, line_id, position, bearing, speed_kmh, current_station_id, next_station_id, progress_pct, updated_at) VALUES ($1,$2,$3,ST_GeogFromText($4),$5,$6,$7,$8,$9,$10)",
        [
          train.trainId,
          train.tripId,
          train.lineId,
          formatPoint(latitude, longitude),
          bearing,
          train.speedKmh,
          train.currentStationId,
          train.nextStationId,
          train.progressPct,
          now
        ]
      );
    }

    for (const prediction of predictions) {
      await client.query(
        "INSERT INTO predictions (station_id, train_id, line_id, destination_id, minutes_away, car_count, captured_at) VALUES ($1,$2,$3,$4,$5,$6,$7)",
        [
          prediction.stationId,
          prediction.trainId,
          prediction.lineId,
          prediction.destinationId,
          prediction.minutesAway,
          prediction.carCount,
          now
        ]
      );
    }

    for (const alert of alerts) {
      await client.query(
        "INSERT INTO alerts (id, header, description, severity, affected_line_ids, affected_station_ids, starts_at, ends_at, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        [
          alert.id,
          alert.header,
          alert.description,
          alert.severity,
          alert.affectedLineIds,
          alert.affectedStationIds,
          alert.startsAt,
          alert.endsAt,
          now
        ]
      );
    }

    await client.query("COMMIT");
    logger.info("Seed data loaded into Metro tables.");
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error(
      error instanceof Error ? error.message : "Unknown error during seed"
    );
    throw error;
  } finally {
    await client.end();
  }
};

seedDatabase().catch((error) => {
  logger.error(
    error instanceof Error ? error.message : "Unhandled error during seed"
  );
  process.exit(1);
});
