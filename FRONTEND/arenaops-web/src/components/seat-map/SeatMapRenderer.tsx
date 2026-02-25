"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useBooking } from "@/features/bookings/useBooking";

import type {
  SectionTemplate,
  LandmarkTemplate,
  RectGeometry,
  ArcGeometry,
} from "./types";

interface Props {
  sections: SectionTemplate[];
  landmarks?: LandmarkTemplate[];
  onSectionClick?: (section: SectionTemplate) => void;
  width?: string | number;
  height?: string | number;
  className?: string;
  viewBox?: string;
}

/* =========================
   Arc Math Utilities
========================= */

const polarToCartesian = (
  cx: number,
  cy: number,
  radius: number,
  angle: number
) => {
  const radians = (angle - 90) * (Math.PI / 180);
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
};

const describeArcSection = (
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
) => {
  const startOuter = polarToCartesian(cx, cy, outerRadius, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerRadius, startAngle);

  const startInner = polarToCartesian(cx, cy, innerRadius, startAngle);
  const endInner = polarToCartesian(cx, cy, innerRadius, endAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return `
    M ${startOuter.x} ${startOuter.y}
    A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${endOuter.x} ${endOuter.y}
    L ${startInner.x} ${startInner.y}
    A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${endInner.x} ${endInner.y}
    Z
  `;
};

const generateArcSeats = (
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
  rowCount: number,
  seatsPerRow: number
) => {
  const seats = [];
  const radiusStep = (outerRadius - innerRadius) / rowCount;
  const angleStep = (endAngle - startAngle) / seatsPerRow;

  for (let row = 0; row < rowCount; row++) {
    const currentRadius = innerRadius + radiusStep * row + radiusStep / 2;

    for (let seat = 0; seat < seatsPerRow; seat++) {
      const currentAngle =
        startAngle + angleStep * seat + angleStep / 2;

      const radians = (currentAngle - 90) * (Math.PI / 180);

      const rawX = centerX + currentRadius * Math.cos(radians);
const rawY = centerY + currentRadius * Math.sin(radians);

seats.push({
  x: Number(rawX.toFixed(3)),
  y: Number(rawY.toFixed(3)),
});
    }
  }

  return seats;
};

export const SeatMapRenderer = React.forwardRef<SVGSVGElement, Props>(
  (
    {
      sections,
      landmarks,
      onSectionClick,
      width = "100%",
      height = "600px",
      className,
      viewBox = "0 0 1000 800",
    },
    ref
  ) => {
    // ✅ Hook MUST be inside component
    const { state, toggleSeat } = useBooking();

    const activeSections = useMemo(() => {
      if (!Array.isArray(sections)) {
        console.error("Sections is not array:", sections);
        return [];
      }

      return sections.filter(
        (s) => s && s.geometry && s.isActive !== false
      );
    }, [sections]);

    return (
      <svg
        ref={ref}
        viewBox={viewBox}
        width={width}
        height={height}
        preserveAspectRatio="xMidYMid meet"
        className={cn(
          "rounded-lg border bg-gray-50 dark:bg-gray-900",
          className
        )}
      >
        {activeSections.map((section) => {
          if (!section || !section.geometry) return null;

          const { geometry } = section;

          // ================= RECT =================
          if (geometry.geometryType === "Rect") {
            const g = geometry as RectGeometry;

            return (
              <g
                key={section.sectionId}
                onClick={() => onSectionClick?.(section)}
                className="cursor-pointer transition-opacity hover:opacity-90"
              >
                <rect
                  x={g.posX}
                  y={g.posY}
                  width={g.width}
                  height={g.height}
                  rx={g.borderRadius ?? 8}
                  fill={section.color}
                  stroke="#1f2937"
                  strokeWidth={1}
                />

                <text
                  x={g.posX + g.width / 2}
                  y={g.posY + g.height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="14"
                  fontWeight="600"
                  fill="white"
                  pointerEvents="none"
                >
                  {section.name}
                </text>
              </g>
            );
          }

          // ================= ARC =================
          if (geometry.geometryType === "Arc") {
            const g = geometry as ArcGeometry;

            const pathData = describeArcSection(
              g.centerX,
              g.centerY,
              g.innerRadius,
              g.outerRadius,
              g.startAngle,
              g.endAngle
            );

            const midAngle = (g.startAngle + g.endAngle) / 2;
            const midRadius =
              (g.innerRadius + g.outerRadius) / 2;

            const labelPos = polarToCartesian(
              g.centerX,
              g.centerY,
              midRadius,
              midAngle
            );

            const seatPositions = generateArcSeats(
              g.centerX,
              g.centerY,
              g.innerRadius,
              g.outerRadius,
              g.startAngle,
              g.endAngle,
              6,
              24
            );

            return (
              <g
                key={section.sectionId}
                onClick={() => onSectionClick?.(section)}
                className="cursor-pointer transition-opacity hover:opacity-90"
              >
                <path
                  d={pathData}
                  fill={section.color}
                  stroke="#1f2937"
                  strokeWidth={1}
                />

                {/* Seats */}
                {seatPositions.map((seat, index) => {
                  const seatId = `${section.sectionId}-seat-${index}`;
                  const isSelected =
                    state.selectedSeats.includes(seatId);

                  return (
                    <circle
                      key={seatId}
                      cx={seat.x}
                      cy={seat.y}
                      r={4}
                      fill={isSelected ? "#10b981" : "white"}
                      stroke="#111827"
                      strokeWidth={0.5}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSeat(seatId);
                      }}
                    />
                  );
                })}

                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="13"
                  fontWeight="600"
                  fill="white"
                  pointerEvents="none"
                >
                  {section.name}
                </text>
              </g>
            );
          }

          return null;
        })}

        {/* Landmarks */}
        {landmarks?.map((feature) => (
          <g key={feature.featureId}>
            <rect
              x={feature.posX}
              y={feature.posY}
              width={feature.width}
              height={feature.height}
              rx={4}
              fill="#6b7280"
              opacity={0.7}
            />
            <text
              x={feature.posX + feature.width / 2}
              y={feature.posY + feature.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fill="white"
              pointerEvents="none"
            >
              {feature.label}
            </text>
          </g>
        ))}
      </svg>
    );
  }
);

SeatMapRenderer.displayName = "SeatMapRenderer";