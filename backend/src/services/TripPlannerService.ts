export interface TripPlanLeg {
  mode: "WALK" | "RAIL";
  startTime: number;
  endTime: number;
  from: {
    name: string;
    stopId: string;
  };
  to: {
    name: string;
    stopId: string;
  };
  distance: number;
}

export interface TripPlanItinerary {
  duration: number;
  startTime: number;
  endTime: number;
  legs: TripPlanLeg[];
}

export interface TripPlanResult {
  itineraries: TripPlanItinerary[];
}

export interface ITripPlannerService {
  plan(
    origin: string,
    destination: string,
    departAt: Date,
    mode: "depart" | "arrive"
  ): Promise<TripPlanResult>;
}

export class MockTripPlannerService implements ITripPlannerService {
  async plan(
    origin: string,
    destination: string,
    departAt: Date,
    mode: "depart" | "arrive"
  ): Promise<TripPlanResult> {
    // TODO[OTP]: Forward this request to OpenTripPlanner REST API at /otp/routers/default/plan at the exact line where the real HTTP call would go.
    const baseTime = departAt.getTime();
    const railStart = mode === "depart" ? baseTime + 4 * 60_000 : baseTime - 18 * 60_000;
    const railEnd = railStart + 22 * 60_000;
    const walkStart = mode === "depart" ? baseTime : railStart - 4 * 60_000;
    const walkEnd = railStart;

    return {
      itineraries: [
        {
          duration: 26 * 60,
          startTime: walkStart,
          endTime: railEnd,
          legs: [
            {
              mode: "WALK",
              startTime: walkStart,
              endTime: walkEnd,
              from: {
                name: `Entrance near ${origin}`,
                stopId: origin
              },
              to: {
                name: `${origin} mezzanine`,
                stopId: origin
              },
              distance: 240
            },
            {
              mode: "RAIL",
              startTime: railStart,
              endTime: railEnd,
              from: {
                name: origin,
                stopId: origin
              },
              to: {
                name: destination,
                stopId: destination
              },
              distance: 9800
            }
          ]
        }
      ]
    };
  }
}
