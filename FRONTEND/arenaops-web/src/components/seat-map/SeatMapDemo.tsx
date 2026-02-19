"use client";

import React, { useState } from "react";
import { SeatMapRenderer, STADIUM_CONFIGS } from "./index";
import type { Section } from "./types";

/**
 * SeatMapDemo
 *
 * Demo component showcasing the SeatMapRenderer with different stadium configurations.
 * This demonstrates:
 * - Basic rendering with different configs
 * - Section label toggling
 * - Hover/click callbacks
 * - Multiple stadium layouts
 *
 * Use this as a reference or testing ground for seat map features.
 */
export function SeatMapDemo() {
    const [selectedConfig, setSelectedConfig] = useState<"default" | "compact" | "football">("default");
    const [showLabels, setShowLabels] = useState(true);
    const [hoveredSection, setHoveredSection] = useState<Section | null>(null);
    const [selectedSection, setSelectedSection] = useState<Section | null>(null);

    const config = STADIUM_CONFIGS[selectedConfig];

    return (
        <div className="w-full space-y-6 p-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Stadium Seat Map
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Interactive SVG-based seat map renderer. This is the foundation layer for stadium visualization.
                </p>
            </div>

            {/* Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                {/* Stadium Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Stadium Configuration
                    </label>
                    <div className="flex gap-2">
                        {(["default", "compact", "football"] as const).map((name) => (
                            <button
                                key={name}
                                onClick={() => {
                                    setSelectedConfig(name);
                                    setSelectedSection(null);
                                    setHoveredSection(null);
                                }}
                                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                                    selectedConfig === name
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600"
                                }`}
                            >
                                {name === "default" && "Default Stadium"}
                                {name === "compact" && "Compact Arena"}
                                {name === "football" && "Football Stadium"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Labels Toggle */}
                <div>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={showLabels}
                            onChange={(e) => setShowLabels(e.target.checked)}
                            className="rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Show Section Labels
                        </span>
                    </label>
                </div>

                {/* Info */}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>
                        {hoveredSection && (
                            <>
                                <strong>Hovered:</strong> {hoveredSection.label}
                            </>
                        )}
                        {!hoveredSection && "Hover over a section to see details"}
                    </p>
                    {selectedSection && (
                        <p className="mt-2">
                            <strong>Selected:</strong> {selectedSection.label} (ID: {selectedSection.id})
                        </p>
                    )}
                </div>
            </div>

            {/* Seat Map */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <SeatMapRenderer
                    config={config}
                    width="100%"
                    height="600px"
                    showLabels={showLabels}
                    onSectionHover={setHoveredSection}
                    onSectionClick={setSelectedSection}
                    className="shadow-md"
                />
            </div>

            {/* Legend */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Color Legend
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(config.colors).map(([key, color]) => (
                        <div key={key} className="flex items-center gap-2">
                            <div
                                className="w-6 h-6 rounded border"
                                style={{
                                    backgroundColor: color.fill,
                                    borderColor: color.stroke,
                                    opacity: color.opacity,
                                }}
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {color.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Configuration Info */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    About This Component
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                    <li>SVG-based stadium section renderer</li>
                    <li>Supports rectangles, polygons, and circles</li>
                    <li>Color-coded sections from configuration</li>
                    <li>Responsive viewBox scaling</li>
                    <li>Ready for future interactions (zoom, click, hover)</li>
                    <li>Foundation layer - no seat-level rendering yet</li>
                </ul>
            </div>

            {/* Code Example */}
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Usage Example
                </h3>
                <pre className="overflow-x-auto text-xs bg-gray-900 text-gray-100 p-3 rounded">
{`import { SeatMapRenderer, defaultStadiumConfig } from "@/components/seat-map";

export function MyStadium() {
  return (
    <SeatMapRenderer
      config={defaultStadiumConfig}
      width="100%"
      height="600px"
      showLabels={true}
      onSectionClick={(section) => console.log(section)}
    />
  );
}`}
                </pre>
            </div>
        </div>
    );
}
