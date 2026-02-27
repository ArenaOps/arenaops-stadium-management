"use client";

import React, { useMemo } from "react";
import type { SectionTemplate, SeatTemplate } from "./types";
import { useBooking } from "@/features/bookings/useBooking";

type SeatGridRendererProps = {
  section: SectionTemplate;
  seats: SeatTemplate[];
};

const SEAT_RADIUS = 8;

export const SeatGridRenderer = React.memo(
  ({ section, seats }: SeatGridRendererProps) => {
    const { state, toggleSeat } = useBooking();

    const sectionSeats = useMemo(
      () =>
        seats.filter(
          (s: SeatTemplate) => s.sectionId === section.sectionId
        ),
      [seats, section.sectionId]
    );

    return (
      <svg
        viewBox="0 0 1000 800"
        width="100%"
        height="600px"
        className="rounded-lg border bg-gray-50 dark:bg-gray-900"
        preserveAspectRatio="xMidYMid meet"
      >
        <text
          x={500}
          y={40}
          textAnchor="middle"
          fontSize="20"
          fontWeight="700"
          fill="#1f2937"
          className="dark:fill-gray-200"
        >
          {section.name}
        </text>

        {sectionSeats.map((seat) => {
          const isSelected = state.selectedSeats.includes(seat.seatId);

          const fillColor = !seat.isActive
            ? "#6b7280"
            : isSelected
            ? "#10b981"
            : "#3b82f6";

          return (
            <g
              key={seat.seatId}
              className="cursor-pointer transition-all duration-150"
              onClick={() => {
                if (!seat.isActive) return;
                toggleSeat(seat.seatId);
              }}
            >
              <circle
                cx={seat.posX}
                cy={seat.posY}
                r={SEAT_RADIUS}
                fill={fillColor}
                stroke="#1f2937"
                strokeWidth={1}
              />

              <text
                x={seat.posX}
                y={seat.posY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="6"
                fill="white"
                pointerEvents="none"
              >
                {seat.seatNumber}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }
);

SeatGridRenderer.displayName = "SeatGridRenderer";