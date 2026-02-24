/**
 * Stadium Seat Map Domain Types
 * Aligned with backend schema
 * Supports overview + seat drill-down flow
 */

/* ============================================================
   1️⃣ Core Domain Entities (Backend Template Layer)
   ============================================================ */

/**
 * Stadium entity (metadata only)
 */
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

/**
 * Seating Plan (Base Layout Template)
 */
export interface SeatingPlan {
  seatingPlanId: string;
  stadiumId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

/**
 * Section (Template Layer)
 * Used in overview rendering
 */
export interface SectionTemplate {
  sectionId: string;
  seatingPlanId: string;
  name: string;

  /** 'Seated' or 'Standing' */
  type: "Seated" | "Standing";

  /** Max capacity (used for Standing sections) */
  capacity?: number;

  /** VIP / Premium / Standard */
  seatType: string;

  /** Display color (hex or token) */
  color: string;

  /** Position in SVG space */
  posX: number;
  posY: number;

  /** Optional dimensions for overview rectangle */
  width?: number;
  height?: number;

  /** Section visibility */
  isActive?: boolean;
}

/**
 * Seat (Template Layer — only for Seated sections)
 */
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

/**
 * Landmark (Stage, Gate, Exit, etc.)
 */
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


/**
 * Full layout data returned from backend
 */
export interface SeatingPlanLayout {
  stadium: Stadium;
  seatingPlan: SeatingPlan;
  sections: SectionTemplate[];
  seats: SeatTemplate[];
  landmarks: LandmarkTemplate[];
}


/**
 * Seat booking status
 */
export type SeatStatus =
  | "available"
  | "booked"
  | "blocked"
  | "selected";

/**
 * Runtime seat state
 */
export interface SeatState {
  seatId: string;
  status: SeatStatus;
}

/**
 * Section-level derived state (optional helper)
 */
export interface SectionDerivedState {
  sectionId: string;
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
}


export interface SeatMapOverviewProps {
  sections: SectionTemplate[];
  landmarks?: LandmarkTemplate[];

  onSectionClick?: (section: SectionTemplate) => void;
}

export interface SeatGridRendererProps {
  section: SectionTemplate;
  seats: SeatTemplate[];
  seatStates: Record<string, SeatState>;

  onSeatClick?: (seat: SeatTemplate) => void;
}