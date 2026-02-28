import type { SeatingPlanLayout, SectionTemplate, SeatTemplate } from "./types";

type DirectionalSectionId =
  | "north"
  | "north-east"
  | "east"
  | "south-east"
  | "south"
  | "south-west"
  | "west"
  | "north-west";

type DirectionalSectionConfig = {
  sectionId: DirectionalSectionId;
  name: string;
  color: string;
  seatType: string;
  startAngle: number;
  endAngle: number;
  rowCount: number;
  seatsPerRow: number;
};

const SEATING_PLAN_ID = "1";

const STADIUM_RING = {
  centerX: 500,
  centerY: 400,
  innerRadius: 250,
  outerRadius: 350,
};

const FIELD_LANDMARK = {
  featureId: "field",
  seatingPlanId: SEATING_PLAN_ID,
  type: "STAGE",
  label: "FIELD",
  posX: 300,
  posY: 275,
  width: 400,
  height: 250,
} as const;

const normalizeCoord = (value: number) => Number(value.toFixed(3));

const polarToCartesian = (
  cx: number,
  cy: number,
  radius: number,
  angle: number
) => {
  const radians = (angle - 90) * (Math.PI / 180);

  return {
    x: normalizeCoord(cx + radius * Math.cos(radians)),
    y: normalizeCoord(cy + radius * Math.sin(radians)),
  };
};

export const EIGHT_DIRECTION_SECTION_CONFIG: DirectionalSectionConfig[] = [
  {
    sectionId: "north",
    name: "North Stand",
    color: "var(--seat-section-north)",
    seatType: "Premium",
    startAngle: 340,
    endAngle: 380,
    rowCount: 6,
    seatsPerRow: 22,
  },
  {
    sectionId: "north-east",
    name: "North-East Stand",
    color: "var(--seat-section-north-east)",
    seatType: "Premium",
    startAngle: 25,
    endAngle: 65,
    rowCount: 5,
    seatsPerRow: 18,
  },
  {
    sectionId: "east",
    name: "East Stand",
    color: "var(--seat-section-east)",
    seatType: "Standard",
    startAngle: 70,
    endAngle: 110,
    rowCount: 6,
    seatsPerRow: 20,
  },
  {
    sectionId: "south-east",
    name: "South-East Stand",
    color: "var(--seat-section-south-east)",
    seatType: "Standard",
    startAngle: 115,
    endAngle: 155,
    rowCount: 5,
    seatsPerRow: 18,
  },
  {
    sectionId: "south",
    name: "South Stand",
    color: "var(--seat-section-south)",
    seatType: "Premium",
    startAngle: 160,
    endAngle: 200,
    rowCount: 6,
    seatsPerRow: 22,
  },
  {
    sectionId: "south-west",
    name: "South-West Stand",
    color: "var(--seat-section-south-west)",
    seatType: "Standard",
    startAngle: 205,
    endAngle: 245,
    rowCount: 5,
    seatsPerRow: 18,
  },
  {
    sectionId: "west",
    name: "West Stand",
    color: "var(--seat-section-west)",
    seatType: "Standard",
    startAngle: 250,
    endAngle: 290,
    rowCount: 6,
    seatsPerRow: 20,
  },
  {
    sectionId: "north-west",
    name: "North-West Stand",
    color: "var(--seat-section-north-west)",
    seatType: "Premium",
    startAngle: 295,
    endAngle: 335,
    rowCount: 5,
    seatsPerRow: 18,
  },
];

const buildSections = (): SectionTemplate[] => {
  return EIGHT_DIRECTION_SECTION_CONFIG.map((config) => ({
    sectionId: config.sectionId,
    seatingPlanId: SEATING_PLAN_ID,
    name: config.name,
    category: "Seated",
    seatType: config.seatType,
    color: config.color,
    geometry: {
      geometryType: "Arc",
      centerX: STADIUM_RING.centerX,
      centerY: STADIUM_RING.centerY,
      innerRadius: STADIUM_RING.innerRadius,
      outerRadius: STADIUM_RING.outerRadius,
      startAngle: config.startAngle,
      endAngle: config.endAngle,
    },
    isActive: true,
  }));
};

const buildSeats = (): SeatTemplate[] => {
  const seats: SeatTemplate[] = [];

  EIGHT_DIRECTION_SECTION_CONFIG.forEach((config) => {
    const radiusSpan = STADIUM_RING.outerRadius - STADIUM_RING.innerRadius;
    const radiusStep = radiusSpan / (config.rowCount + 1);
    const angleSpan = config.endAngle - config.startAngle;
    const angleStep = angleSpan / (config.seatsPerRow + 1);

    for (let row = 0; row < config.rowCount; row++) {
      const rowLabel = String.fromCharCode(65 + row);
      const currentRadius = STADIUM_RING.innerRadius + radiusStep * (row + 1);

      for (let seat = 0; seat < config.seatsPerRow; seat++) {
        const seatNumber = seat + 1;
        const currentAngle = config.startAngle + angleStep * (seat + 1);
        const position = polarToCartesian(
          STADIUM_RING.centerX,
          STADIUM_RING.centerY,
          currentRadius,
          currentAngle
        );

        seats.push({
          seatId: `${config.sectionId}-${rowLabel}${seatNumber}`,
          sectionId: config.sectionId,
          rowLabel,
          seatNumber,
          seatLabel: `${rowLabel}${seatNumber}`,
          posX: position.x,
          posY: position.y,
          isActive: true,
          isAccessible: row === config.rowCount - 1 && seatNumber % 6 === 0,
        });
      }
    }
  });

  return seats;
};

export const buildDirectionalStadiumLayout = (): SeatingPlanLayout => {
  return {
    stadium: {
      stadiumId: "1",
      name: "Concert Arena",
      address: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
      latitude: 0,
      longitude: 0,
      isApproved: true,
      isActive: true,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    seatingPlan: {
      seatingPlanId: SEATING_PLAN_ID,
      stadiumId: "1",
      name: "Concert Layout",
      description: "Eight-direction stadium zoning",
      isActive: true,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    sections: buildSections(),
    seats: buildSeats(),
    landmarks: [FIELD_LANDMARK],
  };
};