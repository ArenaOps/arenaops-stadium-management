"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import type {
    SeatMapRendererProps,
    Section,
    RectSection,
    PolygonSection,
    CircleSection,
} from "./types";

/**
 * SeatMapRenderer
 *
 * Renders a stadium seat map as an SVG with sections colored based on configuration.
 * This is the foundation layer supporting static rendering.
 *
 * Features:
 * - Dynamic SVG generation from configuration
 * - Section rendering (rectangles, polygons, circles)
 * - Color management from config
 * - Responsive viewBox scaling
 * - Optional section labels
 * - Future-ready for interactions (hover, click)
 *
 * @example
 * ```tsx
 * import { SeatMapRenderer } from "@/components/seat-map";
 * import { defaultStadiumConfig } from "@/components/seat-map/seatMap.config";
 *
 * export function MyStadium() {
 *   return (
 *     <SeatMapRenderer
 *       config={defaultStadiumConfig}
 *       width="100%"
 *       height="600px"
 *       showLabels
 *     />
 *   );
 * }
 * ```
 */
export const SeatMapRenderer = React.forwardRef<
    SVGSVGElement,
    SeatMapRendererProps
>(
    (
        {
            config,
            width = "100%",
            height = "600px",
            className,
            onSectionClick,
            onSectionHover,
            showLabels = true,
            defaultColorKey = "standard",
            svgProps,
        },
        ref
    ) => {
        const viewBox = useMemo(() => {
            const { x, y, width: w, height: h } = config.viewBox;
            return `${x} ${y} ${w} ${h}`;
        }, [config.viewBox]);

        /**
         * Get the color for a section by its colorKey
         */
        const getColorForSection = (colorKey: string) => {
            return (
                config.colors[colorKey] || config.colors[defaultColorKey]
            );
        };

        /**
         * Render a rectangular section
         */
        const renderRectSection = (section: RectSection) => {
            const color = getColorForSection(section.colorKey);
            const transform = section.rotation
                ? `rotate(${section.rotation} ${section.x + section.width / 2} ${section.y + section.height / 2})`
                : undefined;

            return (
                <g key={section.id} data-section-id={section.id}>
                    <rect
                        x={section.x}
                        y={section.y}
                        width={section.width}
                        height={section.height}
                        fill={color.fill}
                        stroke={color.stroke || "none"}
                        strokeWidth="1.5"
                        opacity={color.opacity ?? 1}
                        transform={transform}
                        className="transition-all duration-200 cursor-pointer"
                        onMouseEnter={() => {
                            onSectionHover?.(section);
                        }}
                        onMouseLeave={() => {
                            onSectionHover?.(null);
                        }}
                        onClick={() => {
                            onSectionClick?.(section);
                        }}
                    />
                    {showLabels && (
                        <text
                            x={section.x + section.width / 2}
                            y={section.y + section.height / 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="14"
                            fontWeight="600"
                            fill="white"
                            pointerEvents="none"
                            className="select-none"
                        >
                            {section.label}
                        </text>
                    )}
                </g>
            );
        };

        /**
         * Render a polygon section
         */
        const renderPolygonSection = (section: PolygonSection) => {
            const color = getColorForSection(section.colorKey);
            const pointsString = section.points
                .map((p) => `${p.x},${p.y}`)
                .join(" ");

            // Calculate centroid for label positioning
            const centroid = section.points.reduce(
                (acc, p) => ({
                    x: acc.x + p.x / section.points.length,
                    y: acc.y + p.y / section.points.length,
                }),
                { x: 0, y: 0 }
            );

            return (
                <g key={section.id} data-section-id={section.id}>
                    <polygon
                        points={pointsString}
                        fill={color.fill}
                        stroke={color.stroke || "none"}
                        strokeWidth="1.5"
                        opacity={color.opacity ?? 1}
                        className="transition-all duration-200 cursor-pointer"
                        onMouseEnter={() => {
                            onSectionHover?.(section);
                        }}
                        onMouseLeave={() => {
                            onSectionHover?.(null);
                        }}
                        onClick={() => {
                            onSectionClick?.(section);
                        }}
                    />
                    {showLabels && (
                        <text
                            x={centroid.x}
                            y={centroid.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="14"
                            fontWeight="600"
                            fill="white"
                            pointerEvents="none"
                            className="select-none"
                        >
                            {section.label}
                        </text>
                    )}
                </g>
            );
        };

        /**
         * Render a circular section
         */
        const renderCircleSection = (section: CircleSection) => {
            const color = getColorForSection(section.colorKey);

            return (
                <g key={section.id} data-section-id={section.id}>
                    <circle
                        cx={section.cx}
                        cy={section.cy}
                        r={section.r}
                        fill={color.fill}
                        stroke={color.stroke || "none"}
                        strokeWidth="1.5"
                        opacity={color.opacity ?? 1}
                        className="transition-all duration-200 cursor-pointer"
                        onMouseEnter={() => {
                            onSectionHover?.(section);
                        }}
                        onMouseLeave={() => {
                            onSectionHover?.(null);
                        }}
                        onClick={() => {
                            onSectionClick?.(section);
                        }}
                    />
                    {showLabels && (
                        <text
                            x={section.cx}
                            y={section.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="14"
                            fontWeight="600"
                            fill="white"
                            pointerEvents="none"
                            className="select-none"
                        >
                            {section.label}
                        </text>
                    )}
                </g>
            );
        };

        /**
         * Render section based on its type
         */
        const renderSection = (section: Section) => {
            switch (section.type) {
                case "rect":
                    return renderRectSection(section);
                case "polygon":
                    return renderPolygonSection(section);
                case "circle":
                    return renderCircleSection(section);
                default: {
                    // @ts-expect-error - exhaustiveness check for unknown types
                    const _exhaustive: never = section.type;
                    console.warn(`Unknown section type: ${_exhaustive}`);
                    return null;
                }
            }
        };

        return (
            <svg
                ref={ref}
                viewBox={viewBox}
                style={{
                    width,
                    height,
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e5e7eb",
                }}
                className={cn("rounded-lg", className)}
                preserveAspectRatio="xMidYMid meet"
                {...svgProps}
            >
                {/* Background */}
                <defs>
                    <style>{`
                        @media (prefers-color-scheme: dark) {
                            svg { background-color: #1f2937; border-color: #374151; }
                        }
                    `}</style>
                </defs>

                {/* Render all sections */}
                {config.sections.map((section) => renderSection(section))}

                {/* Optional: Stadium name/title */}
                {config.name && (
                    <text
                        x={config.viewBox.width / 2}
                        y={config.viewBox.height - 20}
                        textAnchor="middle"
                        fontSize="20"
                        fontWeight="700"
                        fill="#374151"
                        className="dark:fill-gray-300"
                    >
                        {config.name}
                    </text>
                )}
            </svg>
        );
    }
);

SeatMapRenderer.displayName = "SeatMapRenderer";
