export interface Stadium {
  stadiumId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  latitude: number;
  longitude: number;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface SeatingPlan {
  seatingPlanId: string;
  stadiumId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface SeatTemplate {
  seatId: string;
  sectionId: string;

  rowLabel: string;
  seatNumber: number;
  seatLabel: string;

  posX: number;
  posY: number;

  isActive: boolean;
  isAccessible: boolean;
}

export interface LandmarkTemplate {
  featureId: string;
  seatingPlanId: string;

  type: "STAGE" | "GATE" | "EXIT" | "RESTROOM" | string;

  label: string;

  posX: number;
  posY: number;
  width: number;
  height: number;
}

export type SectionGeometry = RectGeometry | ArcGeometry;

export interface RectGeometry {
  geometryType: "Rect";
  posX: number;
  posY: number;
  width: number;
  height: number;
  borderRadius?: number;
}

export interface ArcGeometry {
  geometryType: "Arc";
  centerX: number;
  centerY: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number; // degrees
  endAngle: number;   // degrees
}

export type SectionCategory = "Seated" | "Standing";

export interface SectionTemplate {
  sectionId: string;
  seatingPlanId: string;
  name: string;

  /** Business type */
  category: SectionCategory;

  /** VIP / Premium / Standard */
  seatType: string;

  /** Display color */
  color: string;

  /** Geometry definition */
  geometry: SectionGeometry;

  /** Max capacity (used for Standing sections) */
  capacity?: number;

  isActive?: boolean;
}

export interface SeatingPlanLayout {
  stadium: Stadium;
  seatingPlan: SeatingPlan;
  sections: SectionTemplate[];
  seats: SeatTemplate[];
  landmarks: LandmarkTemplate[];
}


