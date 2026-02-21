"use client";

import { useParams } from "next/navigation";
import { SeatMapRenderer } from "@/components/seat-map/SeatMapRenderer";
import type { SeatMapConfig } from "@/components/seat-map/types";

/**
 * Mock seat map configuration for Stage 1
 * This will be replaced with API data in Stage 3
 */
const mockEventSeatMap: SeatMapConfig = {
  id: "event-seat-map-mock",
  name: "Concert Arena",
  viewBox: {
    x: 0,
    y: 0,
    width: 1000,
    height: 800,
  },
  sections: [
    // North Section
    {
      type: "rect",
      id: "north-section",
      label: "North Stand",
      x: 350,
      y: 50,
      width: 300,
      height: 100,
      colorKey: "standard",
    },
    // South Section
    {
      type: "rect",
      id: "south-section",
      label: "South Stand",
      x: 350,
      y: 650,
      width: 300,
      height: 100,
      colorKey: "standard",
    },
    // East Section
    {
      type: "rect",
      id: "east-section",
      label: "East Stand",
      x: 700,
      y: 300,
      width: 100,
      height: 200,
      colorKey: "premium",
    },
    // West Section
    {
      type: "rect",
      id: "west-section",
      label: "West Stand",
      x: 200,
      y: 300,
      width: 100,
      height: 200,
      colorKey: "premium",
    },
    // VIP Section (Polygon)
    {
      type: "polygon",
      id: "vip-section",
      label: "VIP",
      points: [
        { x: 400, y: 350 },
        { x: 600, y: 350 },
        { x: 600, y: 450 },
        { x: 400, y: 450 },
      ],
      colorKey: "vip",
    },
    // Stage (Blocked)
    {
      type: "rect",
      id: "stage",
      label: "Stage",
      x: 400,
      y: 200,
      width: 200,
      height: 80,
      colorKey: "blocked",
    },
  ],
  colors: {
    standard: {
      name: "Standard",
      fill: "#3b82f6",
      stroke: "#1e40af",
      opacity: 0.85,
      hoverFill: "#1d4ed8",
    },
    premium: {
      name: "Premium",
      fill: "#f59e0b",
      stroke: "#d97706",
      opacity: 0.85,
      hoverFill: "#d97706",
    },
    vip: {
      name: "VIP",
      fill: "#ec4899",
      stroke: "#be185d",
      opacity: 0.85,
      hoverFill: "#be185d",
    },
    blocked: {
      name: "Not Available",
      fill: "#6b7280",
      stroke: "#374151",
      opacity: 0.6,
      hoverFill: "#6b7280",
    },
  },
  metadata: {
    capacity: 5000,
    region: "North America",
  },
};

export default function EventBookingPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Select Your Seats
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Event ID: {eventId}
        </p>
      </div>

      {/* Seat Map */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <SeatMapRenderer
          config={mockEventSeatMap}
          width="100%"
          height="600px"
          showLabels={true}
        />
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Stage 1:</strong> This is a static seat map. Seat selection, booking, and payment features will be added in future stages.
        </p>
      </div>
    </div>
  );
}
