"use client";

import React from "react";
import type { SeatingPlanLayout, SectionTemplate } from "./types";
import { useRouter } from "next/navigation";

import { SeatMapRenderer } from "./SeatMapRenderer";
import { SeatGridRenderer } from "./SeatGridRenderer";
import { useBooking } from "@/features/bookings/useBooking";

interface SeatMapContainerProps {
  layout: SeatingPlanLayout;
  eventId: string;
}

export const SeatMapContainer: React.FC<SeatMapContainerProps> = ({ layout, eventId }) => {
  const { state, selectSection } = useBooking();
  const router = useRouter();

  const activeSection: SectionTemplate | null =
    layout.sections.find((s) => s.sectionId === state.selectedSectionId) ?? null;

  if (activeSection) {
    return (
      <SeatGridRenderer
        section={activeSection}
        seats={layout.seats}
        onProceed={() => router.push(`/events/${eventId}/book/review`)}
      />
    );
  }

  return (
    <SeatMapRenderer
      sections={layout.sections}
      landmarks={layout.landmarks}
      onSectionClick={(section) => selectSection(section.sectionId)}
    />
  );
};
