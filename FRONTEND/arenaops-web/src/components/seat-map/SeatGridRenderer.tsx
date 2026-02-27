"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { SectionTemplate, SeatTemplate } from "./types";
import { useBooking } from "@/features/bookings/useBooking";

type SeatGridRendererProps = {
  section: SectionTemplate;
  seats: SeatTemplate[];
};

type ViewBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const BASE_VIEWBOX: ViewBox = {
  x: 0,
  y: 0,
  width: 1000,
  height: 800,
};

const SEAT_WIDTH = 18;
const SEAT_HEIGHT = 12;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const getSeatPalette = (isActive: boolean, isSelected: boolean) => {
  if (!isActive) {
    return {
      fill: "#6b7280",
      backrest: "#9ca3af",
      label: "#e5e7eb",
      stroke: "#374151",
      selectionStroke: "transparent",
    };
  }

  if (isSelected) {
    return {
      fill: "#10b981",
      backrest: "#34d399",
      label: "#ecfeff",
      stroke: "#065f46",
      selectionStroke: "#047857",
    };
  }

  return {
    fill: "#f8fafc",
    backrest: "#cbd5e1",
    label: "#1f2937",
    stroke: "#334155",
    selectionStroke: "transparent",
  };
};

const getSectionFocusViewBox = (
  seats: SeatTemplate[],
  hasSelection: boolean
): ViewBox => {
  if (seats.length === 0) {
    return BASE_VIEWBOX;
  }

  const minX = Math.min(...seats.map((seat) => seat.posX));
  const maxX = Math.max(...seats.map((seat) => seat.posX));
  const minY = Math.min(...seats.map((seat) => seat.posY));
  const maxY = Math.max(...seats.map((seat) => seat.posY));

  const padding = hasSelection ? 120 : 180;
  let width = Math.max(360, maxX - minX + padding * 2);
  let height = Math.max(280, maxY - minY + padding * 2);

  const baseAspect = BASE_VIEWBOX.width / BASE_VIEWBOX.height;
  const currentAspect = width / height;

  if (currentAspect > baseAspect) {
    height = width / baseAspect;
  } else {
    width = height * baseAspect;
  }

  width = Math.min(width, BASE_VIEWBOX.width);
  height = Math.min(height, BASE_VIEWBOX.height);

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return {
    x: clamp(centerX - width / 2, BASE_VIEWBOX.x, BASE_VIEWBOX.width - width),
    y: clamp(centerY - height / 2, BASE_VIEWBOX.y, BASE_VIEWBOX.height - height),
    width,
    height,
  };
};

export const SeatGridRenderer = React.memo(
  ({ section, seats }: SeatGridRendererProps) => {
    const { state, toggleSeat, resetSection, canProceed } = useBooking();

    const sectionSeats = useMemo(
      () => seats.filter((s) => s.sectionId === section.sectionId),
      [seats, section.sectionId]
    );

    const selectedSectionSeatIds = useMemo(() => {
      const sectionSeatIdSet = new Set(sectionSeats.map((seat) => seat.seatId));
      return state.selectedSeats.filter((seatId) => sectionSeatIdSet.has(seatId));
    }, [sectionSeats, state.selectedSeats]);

    const targetViewBox = useMemo(
      () => getSectionFocusViewBox(sectionSeats, selectedSectionSeatIds.length > 0),
      [sectionSeats, selectedSectionSeatIds.length]
    );

    const [animatedViewBox, setAnimatedViewBox] = useState<ViewBox>(() => targetViewBox);
    const animationFrameRef = useRef<number | null>(null);
    const lastViewBoxRef = useRef<ViewBox>(targetViewBox);

    useEffect(() => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      const start = performance.now();
      const duration = 380;
      const from = lastViewBoxRef.current;
      const to = targetViewBox;

      const animate = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        const next: ViewBox = {
          x: from.x + (to.x - from.x) * eased,
          y: from.y + (to.y - from.y) * eased,
          width: from.width + (to.width - from.width) * eased,
          height: from.height + (to.height - from.height) * eased,
        };

        setAnimatedViewBox(next);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          lastViewBoxRef.current = to;
          animationFrameRef.current = null;
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [targetViewBox]);

    const selectedSeatLabels = useMemo(() => {
      const selectedSet = new Set(selectedSectionSeatIds);
      return sectionSeats
        .filter((seat) => selectedSet.has(seat.seatId))
        .map((seat) => seat.seatLabel);
    }, [sectionSeats, selectedSectionSeatIds]);

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/70">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{section.name}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {selectedSectionSeatIds.length > 0
                ? `${selectedSectionSeatIds.length} seat(s) selected`
                : "Choose one or more seats to continue"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetSection}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Back to Sections
            </button>
            <button
              type="button"
              disabled={!canProceed}
              className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
            >
              Proceed
            </button>
          </div>
        </div>

        {selectedSeatLabels.length > 0 && (
          <div className="flex flex-wrap gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            {selectedSeatLabels.map((label) => (
              <span
                key={label}
                className="rounded-full border border-emerald-300 bg-white px-2 py-0.5 font-medium dark:border-emerald-800 dark:bg-emerald-900/40"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        <svg
          viewBox={`${animatedViewBox.x} ${animatedViewBox.y} ${animatedViewBox.width} ${animatedViewBox.height}`}
          width="100%"
          height="600px"
          className="rounded-lg border seat-map-canvas seat-map-canvas--section"
          preserveAspectRatio="xMidYMid meet"
        >
          {sectionSeats.map((seat) => {
            const isSelected = selectedSectionSeatIds.includes(seat.seatId);
            const palette = getSeatPalette(seat.isActive, isSelected);

            return (
              <g
                key={seat.seatId}
                className={seat.isActive ? "cursor-pointer" : "cursor-not-allowed"}
                onClick={() => {
                  if (!seat.isActive) return;
                  toggleSeat(seat.seatId);
                }}
              >
                {isSelected && (
                  <rect
                    x={seat.posX - SEAT_WIDTH / 2 - 3}
                    y={seat.posY - SEAT_HEIGHT / 2 - 6}
                    width={SEAT_WIDTH + 6}
                    height={SEAT_HEIGHT + 10}
                    rx={6}
                    fill="none"
                    stroke={palette.selectionStroke}
                    strokeWidth={1.6}
                    opacity={0.9}
                  />
                )}

                <rect
                  x={seat.posX - (SEAT_WIDTH * 0.7) / 2}
                  y={seat.posY - SEAT_HEIGHT / 2 - 4}
                  width={SEAT_WIDTH * 0.7}
                  height={4}
                  rx={2}
                  fill={palette.backrest}
                />

                <rect
                  x={seat.posX - SEAT_WIDTH / 2}
                  y={seat.posY - SEAT_HEIGHT / 2}
                  width={SEAT_WIDTH}
                  height={SEAT_HEIGHT}
                  rx={4}
                  fill={palette.fill}
                  stroke={palette.stroke}
                  strokeWidth={1}
                />

                <text
                  x={seat.posX}
                  y={seat.posY + 0.5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="6"
                  fontWeight="600"
                  fill={palette.label}
                  pointerEvents="none"
                >
                  {seat.seatNumber}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }
);

SeatGridRenderer.displayName = "SeatGridRenderer";