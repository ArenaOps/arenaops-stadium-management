"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import type {
  SectionTemplate,
  SeatTemplate,
  SeatState,
  SeatGridRendererProps,
} from "./types";

const SEAT_RADIUS = 8;

const getSeatColor = (
  seat: SeatTemplate,
  seatState?: SeatState
): string => {
  if (!seat.isActive) return "#6b7280"; // inactive
  if (seatState?.status === "booked") return "#ef4444";
  if (seatState?.status === "blocked") return "#9ca3af";
  if (seatState?.status === "selected") return "#10b981";

  return "#3b82f6"; // default available
};

export const SeatGridRenderer = React.memo(
  ({
    section,
    seats,
    seatStates,
    onSeatClick,
  }: SeatGridRendererProps) => {
    const sectionSeats = useMemo(
      () => seats.filter((s) => s.sectionId === section.sectionId),
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
        {/* Section Title */}
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

        {/* Seats */}
        {sectionSeats.map((seat) => {
          const seatState = seatStates[seat.seatId];
          const fillColor = getSeatColor(seat, seatState);

          return (
            <g
              key={seat.seatId}
              className="cursor-pointer transition-all duration-150"
              onClick={() => {
                if (!seat.isActive) return;
                if (seatState?.status === "booked") return;
                onSeatClick?.(seat);
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

              {/* Seat Label (optional small number) */}
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