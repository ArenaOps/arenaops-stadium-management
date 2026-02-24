"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import type {
  SectionTemplate,
  LandmarkTemplate,
  SeatMapOverviewProps,
} from "./types";

const DEFAULT_SECTION_WIDTH = 140;
const DEFAULT_SECTION_HEIGHT = 100;

export const SeatMapRenderer = React.forwardRef<
  SVGSVGElement,
  SeatMapOverviewProps & {
    width?: string | number;
    height?: string | number;
    className?: string;
    viewBox?: string;
  }
>(
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
    const activeSections = useMemo(
      () => sections.filter((s) => s.isActive !== false),
      [sections]
    );

    return (
      <svg
        ref={ref}
        viewBox={viewBox}
        width={width}
        height={height}
        className={cn("rounded-lg border bg-gray-50 dark:bg-gray-900", className)}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Render Sections */}
        {activeSections.map((section) => {
          const sectionWidth = section.width ?? DEFAULT_SECTION_WIDTH;
          const sectionHeight = section.height ?? DEFAULT_SECTION_HEIGHT;

          const isStanding = section.type === "Standing";

          return (
            <g
              key={section.sectionId}
              data-section-id={section.sectionId}
              className="cursor-pointer transition-all duration-200"
              onClick={() => onSectionClick?.(section)}
            >
              <rect
                x={section.posX}
                y={section.posY}
                width={sectionWidth}
                height={sectionHeight}
                rx={8}
                fill={section.color}
                opacity={0.9}
                stroke="#1f2937"
                strokeWidth={1}
              />

              {/* Section Label */}
              <text
                x={section.posX + sectionWidth / 2}
                y={section.posY + sectionHeight / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="14"
                fontWeight="600"
                fill="white"
                pointerEvents="none"
                className="select-none"
              >
                {section.name}
                {isStanding ? " (Standing)" : ""}
              </text>
            </g>
          );
        })}

        {/* Render Landmarks */}
        {landmarks?.map((feature) => (
          <g key={feature.featureId}>
            <rect
              x={feature.posX}
              y={feature.posY}
              width={feature.width}
              height={feature.height}
              rx={4}
              fill="#6b7280"
              opacity={0.6}
            />
            <text
              x={feature.posX + feature.width / 2}
              y={feature.posY + feature.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fontWeight="500"
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