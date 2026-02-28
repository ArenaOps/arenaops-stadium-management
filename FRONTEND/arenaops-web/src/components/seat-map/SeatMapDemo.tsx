"use client";

import React, { useMemo, useState } from "react";
import { SeatMapRenderer } from "./SeatMapRenderer";
import { buildDirectionalStadiumLayout } from "./stadiumLayout.config";
import type { SectionTemplate } from "./types";

export function SeatMapDemo() {
  const [selectedSection, setSelectedSection] = useState<SectionTemplate | null>(null);

  const layout = useMemo(() => buildDirectionalStadiumLayout(), []);

  return (
    <div className="w-full space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Stadium Seat Map
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Eight-direction zoning demo with section-level interactions.
        </p>
      </div>

      <div className="seat-map-shell rounded-lg border p-4">
        <SeatMapRenderer
          sections={layout.sections}
          landmarks={layout.landmarks}
          onSectionClick={setSelectedSection}
          width="100%"
          height="600px"
          className="shadow-md"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Section Info
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {selectedSection
            ? `Selected: ${selectedSection.name} (${selectedSection.sectionId})`
            : "Click any section to inspect it."}
        </p>
      </div>
    </div>
  );
}