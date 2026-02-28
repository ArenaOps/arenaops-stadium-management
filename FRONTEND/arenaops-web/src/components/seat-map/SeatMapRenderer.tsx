"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

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

const normalizeCoord = (value: number) => Number(value.toFixed(3));

const polarToCartesian = (
  cx: number,
  cy: number,
  radius: number,
  angle: number
) => {
  const radians = (angle - 90) * (Math.PI / 180);
  return {
    x: normalizeCoord(cx + radius * Math.cos(radians)),
    y: normalizeCoord(cy + radius * Math.sin(radians)),
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
  const seats: Array<{ x: number; y: number }> = [];
  const radiusStep = (outerRadius - innerRadius) / rowCount;
  const angleStep = (endAngle - startAngle) / seatsPerRow;

  for (let row = 0; row < rowCount; row++) {
    const currentRadius = innerRadius + radiusStep * row + radiusStep / 2;

    for (let seat = 0; seat < seatsPerRow; seat++) {
      const currentAngle = startAngle + angleStep * seat + angleStep / 2;
      const radians = (currentAngle - 90) * (Math.PI / 180);

      const x = normalizeCoord(centerX + currentRadius * Math.cos(radians));
      const y = normalizeCoord(centerY + currentRadius * Math.sin(radians));

      seats.push({ x, y });
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
    const activeSections = useMemo(() => {
      if (!Array.isArray(sections)) {
        return [];
      }

      return sections.filter((s) => s && s.geometry && s.isActive !== false);
    }, [sections]);

    return (
      <svg
        ref={ref}
        viewBox={viewBox}
        width={width}
        height={height}
        preserveAspectRatio="xMidYMid meet"
        className={cn(
          "rounded-lg border seat-map-canvas seat-map-canvas--overview",
          className
        )}
      >
        <defs>
          <linearGradient id="fieldBaseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3da54f" />
            <stop offset="100%" stopColor="#287a3a" />
          </linearGradient>

          <pattern id="fieldStripePattern" width="28" height="28" patternUnits="userSpaceOnUse">
            <rect width="28" height="28" fill="#329147" />
            <rect width="14" height="28" fill="#226f35" opacity="0.28" />
          </pattern>

          <pattern id="fieldNoisePattern" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="3" r="0.8" fill="#ecfdf3" opacity="0.18" />
            <circle cx="8" cy="5" r="0.7" fill="#dcfce7" opacity="0.15" />
            <circle cx="5" cy="10" r="0.9" fill="#f0fdf4" opacity="0.12" />
            <circle cx="12" cy="11" r="0.6" fill="#dcfce7" opacity="0.14" />
          </pattern>
        </defs>
        {activeSections.map((section) => {
          if (!section || !section.geometry) return null;

          const { geometry } = section;

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
            const midRadius = (g.innerRadius + g.outerRadius) / 2;
            const labelPos = polarToCartesian(g.centerX, g.centerY, midRadius, midAngle);
            const seatPositions = generateArcSeats(
              g.centerX,
              g.centerY,
              g.innerRadius,
              g.outerRadius,
              g.startAngle,
              g.endAngle,
              4,
              20
            );

            return (
              <g
                key={section.sectionId}
                onClick={() => onSectionClick?.(section)}
                className="cursor-pointer transition-opacity hover:opacity-90"
              >
                <path d={pathData} fill={section.color} stroke="#1f2937" strokeWidth={1} />

                {seatPositions.map((seat, index) => (
                  <g key={`${section.sectionId}-seat-shape-${index}`} pointerEvents="none">
                    <rect
                      x={seat.x - 3}
                      y={seat.y - 3}
                      width={6}
                      height={6}
                      rx={1.5}
                      fill="#f8fafc"
                      stroke="#111827"
                      strokeWidth={0.35}
                      opacity={0.9}
                    />
                    <rect
                      x={seat.x - 2.2}
                      y={seat.y - 5.2}
                      width={4.4}
                      height={1.4}
                      rx={0.7}
                      fill="#cbd5e1"
                      opacity={0.95}
                    />
                  </g>
                ))}

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

        {landmarks?.map((feature) => {
          const label = feature.label.toUpperCase();
          const type = feature.type.toUpperCase();
          const isField =
            type === "FIELD" ||
            label.includes("FIELD") ||
            label.includes("PITCH") ||
            label.includes("GROUND");

          if (isField) {
            const centerX = feature.posX + feature.width / 2;
            const centerY = feature.posY + feature.height / 2;

            return (
              <g key={feature.featureId}>
                <rect
                  x={feature.posX}
                  y={feature.posY}
                  width={feature.width}
                  height={feature.height}
                  rx={8}
                  fill="url(#fieldBaseGradient)"
                />
                <rect
                  x={feature.posX}
                  y={feature.posY}
                  width={feature.width}
                  height={feature.height}
                  rx={8}
                  fill="url(#fieldStripePattern)"
                  opacity={0.82}
                />
                <rect
                  x={feature.posX}
                  y={feature.posY}
                  width={feature.width}
                  height={feature.height}
                  rx={8}
                  fill="url(#fieldNoisePattern)"
                  opacity={0.2}
                />

                <rect
                  x={feature.posX}
                  y={feature.posY}
                  width={feature.width}
                  height={feature.height}
                  rx={8}
                  fill="none"
                  stroke="#f0fdf4"
                  strokeWidth={1.2}
                  opacity={0.5}
                />
                <line
                  x1={centerX}
                  y1={feature.posY + 8}
                  x2={centerX}
                  y2={feature.posY + feature.height - 8}
                  stroke="#f0fdf4"
                  strokeWidth={1}
                  opacity={0.35}
                />
                <line
                  x1={feature.posX + 8}
                  y1={centerY}
                  x2={feature.posX + feature.width - 8}
                  y2={centerY}
                  stroke="#f0fdf4"
                  strokeWidth={1}
                  opacity={0.25}
                />
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={Math.min(feature.width, feature.height) * 0.12}
                  fill="none"
                  stroke="#f0fdf4"
                  strokeWidth={1}
                  opacity={0.25}
                />

                <text
                  x={centerX}
                  y={centerY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill="#f8fafc"
                  opacity={0.95}
                  pointerEvents="none"
                >
                  {feature.label}
                </text>
              </g>
            );
          }

          return (
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
          );
        })}
      </svg>
    );
  }
);

SeatMapRenderer.displayName = "SeatMapRenderer";