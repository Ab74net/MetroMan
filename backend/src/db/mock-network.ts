export type LineId = "red" | "blue" | "orange" | "silver" | "green" | "yellow";
export type TrainDirection = 0 | 1;
export type AlertSeverity = "INFO" | "WARNING" | "SEVERE";

export type Coordinate = {
  lat: number;
  lng: number;
};

export type CurveProfile = {
  bend: number;
  secondaryBend: number;
  wiggle: number;
  bias: number;
};

export type LineSeed = {
  id: LineId;
  name: string;
  colorHex: string;
  displayOrder: number;
};

export type StationSeed = Coordinate & {
  id: string;
  name: string;
  address: string;
  isTransferStation: boolean;
  hasElevator: boolean;
  hasParking: boolean;
};

export type TrainSeed = {
  trainId: string;
  tripId: string;
  lineId: LineId;
  headsign: string;
  direction: TrainDirection;
  shapeId: string;
  segmentKey: string;
  progressPct: number;
  speedKmh: number;
  updatedAt: string;
  destinationId: string;
  carCount: number;
};

export type AlertSeed = {
  id: string;
  header: string;
  description: string;
  severity: AlertSeverity;
  affectedLineIds: string[];
  affectedStationIds: string[];
  startsAt: string;
  endsAt: string | null;
};

export const baseTimestamp = new Date("2026-03-16T12:00:00.000Z");

export const lines: LineSeed[] = [
  { id: "red", name: "Red", colorHex: "#BF0D3E", displayOrder: 1 },
  { id: "blue", name: "Blue", colorHex: "#009CDE", displayOrder: 2 },
  { id: "orange", name: "Orange", colorHex: "#ED8B00", displayOrder: 3 },
  { id: "silver", name: "Silver", colorHex: "#919D9D", displayOrder: 4 },
  { id: "green", name: "Green", colorHex: "#00B140", displayOrder: 5 },
  { id: "yellow", name: "Yellow", colorHex: "#FFD100", displayOrder: 6 }
];

// Multi-code transfer complexes are stored under one canonical station ID because the schema
// uses a single text primary key. For this scaffold: Metro Center => C01, Gallery Place => B01,
// and L'Enfant Plaza => D03 while retaining the correct line associations.
export const stations: StationSeed[] = [
  {
    id: "C01",
    name: "Metro Center",
    lat: 38.898691,
    lng: -77.02787,
    address: "607 13th St NW, Washington, DC 20005",
    isTransferStation: true,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "B01",
    name: "Gallery Place-Chinatown",
    lat: 38.898182,
    lng: -77.022054,
    address: "630 H St NW, Washington, DC 20001",
    isTransferStation: true,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "B03",
    name: "Union Station",
    lat: 38.897602,
    lng: -77.007526,
    address: "701 First St NE, Washington, DC 20002",
    isTransferStation: false,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "A02",
    name: "Farragut North",
    lat: 38.902603,
    lng: -77.039309,
    address: "1001 Connecticut Ave NW, Washington, DC 20036",
    isTransferStation: false,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "A03",
    name: "Dupont Circle",
    lat: 38.908644,
    lng: -77.043385,
    address: "1525 20th St NW, Washington, DC 20036",
    isTransferStation: false,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "A04",
    name: "Woodley Park-Zoo/Adams Morgan",
    lat: 38.924449,
    lng: -77.052255,
    address: "2700 Connecticut Ave NW, Washington, DC 20008",
    isTransferStation: false,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "A09",
    name: "Bethesda",
    lat: 38.984731,
    lng: -77.094655,
    address: "7450 Wisconsin Ave, Bethesda, MD 20814",
    isTransferStation: false,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "A15",
    name: "Shady Grove",
    lat: 39.120352,
    lng: -77.164224,
    address: "15903 Somerville Dr, Rockville, MD 20855",
    isTransferStation: false,
    hasElevator: true,
    hasParking: true
  },
  {
    id: "C07",
    name: "Pentagon",
    lat: 38.869595,
    lng: -77.053844,
    address: "2 S Rotary Rd, Arlington, VA 22202",
    isTransferStation: true,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "C06",
    name: "Arlington Cemetery",
    lat: 38.884501,
    lng: -77.063763,
    address: "1 Memorial Ave, Arlington, VA 22211",
    isTransferStation: false,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "C05",
    name: "Rosslyn",
    lat: 38.895808,
    lng: -77.072122,
    address: "1850 N Fort Myer Dr, Arlington, VA 22209",
    isTransferStation: true,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "C04",
    name: "Foggy Bottom-GWU",
    lat: 38.900874,
    lng: -77.050258,
    address: "2301 I St NW, Washington, DC 20037",
    isTransferStation: true,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "C03",
    name: "Farragut West",
    lat: 38.901648,
    lng: -77.041964,
    address: "900 18th St NW, Washington, DC 20006",
    isTransferStation: true,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "C02",
    name: "McPherson Square",
    lat: 38.900894,
    lng: -77.032223,
    address: "1400 I St NW, Washington, DC 20005",
    isTransferStation: true,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "D01",
    name: "Federal Triangle",
    lat: 38.893827,
    lng: -77.029109,
    address: "302 12th St NW, Washington, DC 20004",
    isTransferStation: true,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "D02",
    name: "Smithsonian",
    lat: 38.889094,
    lng: -77.028303,
    address: "1200 Independence Ave SW, Washington, DC 20004",
    isTransferStation: true,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "D03",
    name: "L'Enfant Plaza",
    lat: 38.886273,
    lng: -77.021609,
    address: "600 Maryland Ave SW, Washington, DC 20024",
    isTransferStation: true,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "C09",
    name: "Pentagon City",
    lat: 38.862541,
    lng: -77.059106,
    address: "1250 S Hayes St, Arlington, VA 22202",
    isTransferStation: true,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "C10",
    name: "Crystal City",
    lat: 38.857975,
    lng: -77.051524,
    address: "1750 S Bell St, Arlington, VA 22202",
    isTransferStation: true,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "C11",
    name: "Ronald Reagan Washington National Airport",
    lat: 38.853446,
    lng: -77.044184,
    address: "2401 Ronald Reagan Washington National Airport Access Rd, Arlington, VA 22202",
    isTransferStation: true,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "A14",
    name: "Rockville",
    lat: 39.084375,
    lng: -77.146757,
    address: "251 Hungerford Dr, Rockville, MD 20850",
    isTransferStation: false,
    hasElevator: true,
    hasParking: true
  },
  {
    id: "A13",
    name: "Twinbrook",
    lat: 39.061967,
    lng: -77.120627,
    address: "1600 Chapman Ave, Rockville, MD 20852",
    isTransferStation: false,
    hasElevator: true,
    hasParking: true
  },
  {
    id: "A12",
    name: "North Bethesda",
    lat: 39.047394,
    lng: -77.112574,
    address: "5510 Marinelli Rd, Rockville, MD 20852",
    isTransferStation: false,
    hasElevator: true,
    hasParking: true
  },
  {
    id: "A11",
    name: "Grosvenor-Strathmore",
    lat: 39.028955,
    lng: -77.103476,
    address: "10300 Rockville Pike, North Bethesda, MD 20852",
    isTransferStation: false,
    hasElevator: true,
    hasParking: true
  },
  {
    id: "A10",
    name: "Medical Center",
    lat: 38.999052,
    lng: -77.097995,
    address: "8810 Rockville Pike, Bethesda, MD 20814",
    isTransferStation: false,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "A08",
    name: "Friendship Heights",
    lat: 38.96129,
    lng: -77.085613,
    address: "5337 Wisconsin Ave NW, Washington, DC 20015",
    isTransferStation: false,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "A07",
    name: "Tenleytown-AU",
    lat: 38.948035,
    lng: -77.079354,
    address: "4501 Wisconsin Ave NW, Washington, DC 20016",
    isTransferStation: false,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "A06",
    name: "Van Ness-UDC",
    lat: 38.944635,
    lng: -77.063577,
    address: "4200 Connecticut Ave NW, Washington, DC 20008",
    isTransferStation: false,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "A05",
    name: "Cleveland Park",
    lat: 38.935872,
    lng: -77.05849,
    address: "3599 Connecticut Ave NW, Washington, DC 20008",
    isTransferStation: false,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "B02",
    name: "Judiciary Square",
    lat: 38.896091,
    lng: -77.017132,
    address: "450 F St NW, Washington, DC 20001",
    isTransferStation: false,
    hasElevator: true,
    hasParking: false
  },
  {
    id: "F02",
    name: "Archives-Navy Memorial-Penn Quarter",
    lat: 38.894073,
    lng: -77.022297,
    address: "701 Pennsylvania Ave NW, Washington, DC 20004",
    isTransferStation: true,
    hasElevator: true,
    hasParking: false
  }
];

export const lineStations: Record<LineId, string[]> = {
  red: [
    "A15",
    "A14",
    "A13",
    "A12",
    "A11",
    "A10",
    "A09",
    "A08",
    "A07",
    "A06",
    "A05",
    "A04",
    "A03",
    "A02",
    "C01",
    "B01",
    "B02",
    "B03"
  ],
  blue: ["C11", "C10", "C09", "C07", "C06", "C05", "C04", "C03", "C02", "C01", "D01", "D02", "D03"],
  orange: ["C05", "C04", "C03", "C02", "C01", "D01", "D02", "D03"],
  silver: ["C05", "C04", "C03", "C02", "C01", "D01", "D02", "D03"],
  green: ["B01", "F02", "D03"],
  yellow: ["B01", "F02", "D03", "C07", "C09", "C10", "C11"]
};

export const stationById = new Map(stations.map((station) => [station.id, station]));

export const defaultCurveByLine: Record<LineId, number> = {
  red: 0.12,
  blue: 0.16,
  orange: 0.08,
  silver: 0.08,
  green: 0.1,
  yellow: 0.18
};

export const curveOverrides: Record<string, Partial<CurveProfile>> = {
  "red:A15->A14": { bend: 0.09, secondaryBend: -0.04, wiggle: 0.009 },
  "red:A14->A13": { bend: 0.13, secondaryBend: -0.07, wiggle: 0.011 },
  "red:A13->A12": { bend: -0.11, secondaryBend: 0.05, wiggle: 0.009 },
  "red:A12->A11": { bend: -0.08, secondaryBend: 0.04, wiggle: 0.008 },
  "red:A11->A10": { bend: 0.11, secondaryBend: -0.05, wiggle: 0.01 },
  "red:A10->A09": { bend: -0.1, secondaryBend: 0.03, wiggle: 0.008 },
  "red:A09->A08": { bend: -0.15, secondaryBend: 0.08, wiggle: 0.011 },
  "red:A08->A07": { bend: 0.12, secondaryBend: -0.05, wiggle: 0.01 },
  "red:A07->A06": { bend: 0.09, secondaryBend: -0.03, wiggle: 0.009 },
  "red:A06->A05": { bend: -0.13, secondaryBend: 0.07, wiggle: 0.01 },
  "red:A05->A04": { bend: 0.11, secondaryBend: -0.04, wiggle: 0.01 },
  "red:A04->A03": { bend: -0.12, secondaryBend: 0.06, wiggle: 0.011 },
  "red:A03->A02": { bend: 0.1, secondaryBend: -0.03, wiggle: 0.009 },
  "red:A02->C01": { bend: 0.07, secondaryBend: -0.02, wiggle: 0.007 },
  "red:C01->B01": { bend: -0.05, secondaryBend: 0.02, wiggle: 0.006 },
  "red:B01->B02": { bend: -0.05, secondaryBend: 0.01, wiggle: 0.005 },
  "red:B02->B03": { bend: 0.07, secondaryBend: -0.02, wiggle: 0.006 },
  "blue:C11->C10": { bend: -0.06, secondaryBend: 0.01, wiggle: 0.005 },
  "blue:C10->C09": { bend: 0.05, secondaryBend: -0.02, wiggle: 0.005 },
  "blue:C09->C07": { bend: -0.12, secondaryBend: 0.05, wiggle: 0.006 },
  "blue:C07->C06": { bend: 0.09, secondaryBend: -0.04, wiggle: 0.006 },
  "blue:C06->C05": { bend: -0.28, secondaryBend: 0.18, wiggle: 0.012 },
  "blue:C05->C04": { bend: -0.33, secondaryBend: 0.14, wiggle: 0.011 },
  "blue:C04->C03": { bend: 0.04, secondaryBend: -0.01, wiggle: 0.005 },
  "blue:C03->C02": { bend: -0.03, secondaryBend: 0.01, wiggle: 0.004 },
  "blue:C02->C01": { bend: 0.03, secondaryBend: -0.01, wiggle: 0.004 },
  "blue:C01->D01": { bend: -0.04, secondaryBend: 0.01, wiggle: 0.004 },
  "blue:D01->D02": { bend: -0.02, secondaryBend: 0.01, wiggle: 0.003 },
  "blue:D02->D03": { bend: 0.12, secondaryBend: -0.05, wiggle: 0.005 },
  "orange:C05->C04": { bend: -0.31, secondaryBend: 0.12, wiggle: 0.01 },
  "orange:C04->C03": { bend: 0.04, secondaryBend: -0.01, wiggle: 0.004 },
  "orange:C03->C02": { bend: -0.03, secondaryBend: 0.01, wiggle: 0.003 },
  "orange:C02->C01": { bend: 0.03, secondaryBend: -0.01, wiggle: 0.003 },
  "orange:C01->D01": { bend: -0.04, secondaryBend: 0.01, wiggle: 0.003 },
  "orange:D01->D02": { bend: -0.02, secondaryBend: 0.01, wiggle: 0.003 },
  "orange:D02->D03": { bend: 0.11, secondaryBend: -0.04, wiggle: 0.004 },
  "silver:C05->C04": { bend: -0.31, secondaryBend: 0.12, wiggle: 0.01 },
  "silver:C04->C03": { bend: 0.04, secondaryBend: -0.01, wiggle: 0.004 },
  "silver:C03->C02": { bend: -0.03, secondaryBend: 0.01, wiggle: 0.003 },
  "silver:C02->C01": { bend: 0.03, secondaryBend: -0.01, wiggle: 0.003 },
  "silver:C01->D01": { bend: -0.04, secondaryBend: 0.01, wiggle: 0.003 },
  "silver:D01->D02": { bend: -0.02, secondaryBend: 0.01, wiggle: 0.003 },
  "silver:D02->D03": { bend: 0.11, secondaryBend: -0.04, wiggle: 0.004 },
  "green:B01->F02": { bend: -0.07, secondaryBend: 0.02, wiggle: 0.004 },
  "green:F02->D03": { bend: 0.09, secondaryBend: -0.03, wiggle: 0.004 },
  "yellow:B01->F02": { bend: -0.07, secondaryBend: 0.02, wiggle: 0.004 },
  "yellow:F02->D03": { bend: 0.09, secondaryBend: -0.03, wiggle: 0.004 },
  "yellow:D03->C07": { bend: -0.44, secondaryBend: -0.1, wiggle: 0.009, bias: -0.2 },
  "yellow:C07->C09": { bend: -0.11, secondaryBend: 0.05, wiggle: 0.005 },
  "yellow:C09->C10": { bend: 0.05, secondaryBend: -0.02, wiggle: 0.005 },
  "yellow:C10->C11": { bend: -0.06, secondaryBend: 0.01, wiggle: 0.005 }
};

export const trains: TrainSeed[] = [
  {
    trainId: "TRN-RED-001",
    tripId: "red-trip-eastbound-01",
    lineId: "red",
    headsign: "Union Station",
    direction: 1,
    shapeId: "red-seeded-shape-1",
    segmentKey: "red:A14->A13",
    progressPct: 0.32,
    speedKmh: 55,
    updatedAt: "2026-03-16T12:00:05.000Z",
    destinationId: "B03",
    carCount: 8
  },
  {
    trainId: "TRN-RED-002",
    tripId: "red-trip-westbound-01",
    lineId: "red",
    headsign: "Shady Grove",
    direction: 0,
    shapeId: "red-seeded-shape-0",
    segmentKey: "red:A03->A02",
    progressPct: 0.61,
    speedKmh: 39,
    updatedAt: "2026-03-16T12:00:07.000Z",
    destinationId: "A15",
    carCount: 6
  },
  {
    trainId: "TRN-BLU-001",
    tripId: "blue-trip-northeast-01",
    lineId: "blue",
    headsign: "L'Enfant Plaza",
    direction: 1,
    shapeId: "blue-seeded-shape-1",
    segmentKey: "blue:C06->C05",
    progressPct: 0.58,
    speedKmh: 44,
    updatedAt: "2026-03-16T12:00:09.000Z",
    destinationId: "D03",
    carCount: 8
  },
  {
    trainId: "TRN-BLU-002",
    tripId: "blue-trip-southwest-01",
    lineId: "blue",
    headsign: "Ronald Reagan Washington National Airport",
    direction: 0,
    shapeId: "blue-seeded-shape-0",
    segmentKey: "blue:C10->C09",
    progressPct: 0.47,
    speedKmh: 42,
    updatedAt: "2026-03-16T12:00:12.000Z",
    destinationId: "C11",
    carCount: 6
  },
  {
    trainId: "TRN-ORG-001",
    tripId: "orange-trip-eastbound-01",
    lineId: "orange",
    headsign: "L'Enfant Plaza",
    direction: 1,
    shapeId: "orange-seeded-shape-1",
    segmentKey: "orange:C05->C04",
    progressPct: 0.37,
    speedKmh: 52,
    updatedAt: "2026-03-16T12:00:14.000Z",
    destinationId: "D03",
    carCount: 8
  },
  {
    trainId: "TRN-ORG-002",
    tripId: "orange-trip-westbound-01",
    lineId: "orange",
    headsign: "Rosslyn",
    direction: 0,
    shapeId: "orange-seeded-shape-0",
    segmentKey: "orange:D01->D02",
    progressPct: 0.64,
    speedKmh: 36,
    updatedAt: "2026-03-16T12:00:18.000Z",
    destinationId: "C05",
    carCount: 6
  },
  {
    trainId: "TRN-SLV-001",
    tripId: "silver-trip-eastbound-01",
    lineId: "silver",
    headsign: "L'Enfant Plaza",
    direction: 1,
    shapeId: "silver-seeded-shape-1",
    segmentKey: "silver:C03->C02",
    progressPct: 0.21,
    speedKmh: 41,
    updatedAt: "2026-03-16T12:00:20.000Z",
    destinationId: "D03",
    carCount: 8
  },
  {
    trainId: "TRN-SLV-002",
    tripId: "silver-trip-westbound-01",
    lineId: "silver",
    headsign: "Rosslyn",
    direction: 0,
    shapeId: "silver-seeded-shape-0",
    segmentKey: "silver:D02->D03",
    progressPct: 0.55,
    speedKmh: 35,
    updatedAt: "2026-03-16T12:00:24.000Z",
    destinationId: "C05",
    carCount: 6
  },
  {
    trainId: "TRN-GRN-001",
    tripId: "green-trip-southbound-01",
    lineId: "green",
    headsign: "L'Enfant Plaza",
    direction: 1,
    shapeId: "green-seeded-shape-1",
    segmentKey: "green:B01->F02",
    progressPct: 0.44,
    speedKmh: 31,
    updatedAt: "2026-03-16T12:00:28.000Z",
    destinationId: "D03",
    carCount: 6
  },
  {
    trainId: "TRN-GRN-002",
    tripId: "green-trip-northbound-01",
    lineId: "green",
    headsign: "Gallery Place-Chinatown",
    direction: 0,
    shapeId: "green-seeded-shape-0",
    segmentKey: "green:F02->D03",
    progressPct: 0.67,
    speedKmh: 29,
    updatedAt: "2026-03-16T12:00:31.000Z",
    destinationId: "B01",
    carCount: 6
  },
  {
    trainId: "TRN-YLW-001",
    tripId: "yellow-trip-southbound-01",
    lineId: "yellow",
    headsign: "Ronald Reagan Washington National Airport",
    direction: 1,
    shapeId: "yellow-seeded-shape-1",
    segmentKey: "yellow:D03->C07",
    progressPct: 0.29,
    speedKmh: 58,
    updatedAt: "2026-03-16T12:00:34.000Z",
    destinationId: "C11",
    carCount: 8
  },
  {
    trainId: "TRN-YLW-002",
    tripId: "yellow-trip-northbound-01",
    lineId: "yellow",
    headsign: "Gallery Place-Chinatown",
    direction: 0,
    shapeId: "yellow-seeded-shape-0",
    segmentKey: "yellow:C09->C10",
    progressPct: 0.52,
    speedKmh: 40,
    updatedAt: "2026-03-16T12:00:36.000Z",
    destinationId: "B01",
    carCount: 6
  }
];

export const alerts: AlertSeed[] = [
  {
    id: "alert-red-track-work",
    header: "Red Line speed restriction between Bethesda and Medical Center",
    description:
      "Maintenance crews are working overnight rail fasteners. Expect slower Red Line service in both directions through upper Northwest.",
    severity: "WARNING",
    affectedLineIds: ["red"],
    affectedStationIds: ["A10", "A09"],
    startsAt: "2026-03-16T02:00:00.000Z",
    endsAt: "2026-03-16T18:00:00.000Z"
  },
  {
    id: "alert-yellow-bridge-spacing",
    header: "Yellow Line spacing south of L'Enfant Plaza",
    description:
      "Operators are spacing trains over the Potomac bridge after an earlier signaling reset. Trains may hold briefly leaving the bridge approaches.",
    severity: "WARNING",
    affectedLineIds: ["yellow"],
    affectedStationIds: ["D03", "C07", "C09"],
    startsAt: "2026-03-16T11:15:00.000Z",
    endsAt: "2026-03-16T16:30:00.000Z"
  },
  {
    id: "alert-metro-center-elevator",
    header: "Metro Center elevator outage at 12th & G entrance",
    description:
      "The street-to-mezzanine elevator is temporarily unavailable. Accessible routing remains available through the 11th & G entrance.",
    severity: "INFO",
    affectedLineIds: [],
    affectedStationIds: ["C01"],
    startsAt: "2026-03-16T10:00:00.000Z",
    endsAt: null
  },
  {
    id: "alert-potomac-shared-segment",
    header: "Severe signal failure on the Rosslyn-Foggy Bottom shared segment",
    description:
      "A failed signal circuit in the Potomac River tunnel is impacting the shared Blue, Orange, and Silver segment. Expect major delays and platform crowding.",
    severity: "SEVERE",
    affectedLineIds: ["blue", "orange", "silver"],
    affectedStationIds: ["C05", "C04"],
    startsAt: "2026-03-16T11:40:00.000Z",
    endsAt: "2026-03-16T19:00:00.000Z"
  }
];
