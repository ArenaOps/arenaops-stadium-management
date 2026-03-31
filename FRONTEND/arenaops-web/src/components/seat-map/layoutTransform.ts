import type { SeatingPlanLayout } from "./types";

export function toSeatingPlanLayout(value: unknown): SeatingPlanLayout | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<SeatingPlanLayout>;

  if (
    !candidate.stadium ||
    !candidate.seatingPlan ||
    !Array.isArray(candidate.sections) ||
    !Array.isArray(candidate.seats) ||
    !Array.isArray(candidate.landmarks)
  ) {
    return null;
  }

  return candidate as SeatingPlanLayout;
}
