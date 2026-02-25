"use client";

import React from "react";
import type { SeatingPlanLayout, SectionTemplate } from "./types";

import { SeatMapRenderer } from "./SeatMapRenderer";
import { SeatGridRenderer } from "./SeatGridRenderer";
import { useBooking } from "@/features/bookings/useBooking";

interface SeatMapContainerProps {
  layout: SeatingPlanLayout;
}

export const SeatMapContainer: React.FC<SeatMapContainerProps> = ({ layout }) => {
  const { state, selectSection } = useBooking();

  const activeSection: SectionTemplate | null =
    layout.sections.find((s) => s.sectionId === state.selectedSectionId) ?? null;

  if (activeSection) {
    return <SeatGridRenderer section={activeSection} seats={layout.seats} />;
  }

  return (
    <SeatMapRenderer
      sections={layout.sections}
      landmarks={layout.landmarks}
      onSectionClick={(section) => selectSection(section.sectionId)}
    />
  );
};