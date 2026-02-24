"use client";

import React, { useMemo, useState } from "react";
import type {
  SeatingPlanLayout,
  SectionTemplate,
  SeatTemplate,
  SeatState,
} from "./types";
import { SeatMapRenderer } from "./SeatMapRenderer";
import { SeatGridRenderer } from "./SeatGridRenderer";

interface SeatMapContainerProps {
  layout: SeatingPlanLayout;

  /** Initial booked seats from backend */
  initialSeatStates?: SeatState[];
}

export const SeatMapContainer: React.FC<SeatMapContainerProps> = ({
  layout,
  initialSeatStates = [],
}) => {
  const [activeSection, setActiveSection] =
    useState<SectionTemplate | null>(null);

  const [seatStates, setSeatStates] = useState<Record<string, SeatState>>(() => {
    const map: Record<string, SeatState> = {};
    initialSeatStates.forEach((s) => {
      map[s.seatId] = s;
    });
    return map;
  });

  const handleSeatClick = (seat: SeatTemplate) => {
    setSeatStates((prev) => {
      const current = prev[seat.seatId];

      if (current?.status === "booked") return prev;

      const nextStatus =
        current?.status === "selected" ? "available" : "selected";

      return {
        ...prev,
        [seat.seatId]: {
          seatId: seat.seatId,
          status: nextStatus,
        },
      };
    });
  };

  const selectedSeats = useMemo(() => {
    return Object.values(seatStates).filter(
      (s) => s.status === "selected"
    );
  }, [seatStates]);

  return activeSection ? (
    <SeatGridRenderer
      section={activeSection}
      seats={layout.seats}
      seatStates={seatStates}
      onSeatClick={handleSeatClick}
    />
  ) : (
    <SeatMapRenderer
      sections={layout.sections}
      landmarks={layout.landmarks}
      onSectionClick={(section) => setActiveSection(section)}
    />
  );
};