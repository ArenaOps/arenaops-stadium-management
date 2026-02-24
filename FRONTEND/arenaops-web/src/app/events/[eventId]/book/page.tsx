"use client";

import { useParams } from "next/navigation";
import { SeatMapContainer } from "@/components/seat-map/SeatMapContainer";
import type { SeatingPlanLayout } from "@/components/seat-map/types";

const mockLayout: SeatingPlanLayout = {
  stadium: {
    stadiumId: "1",
    name: "Concert Arena",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    latitude: 0,
    longitude: 0,
    isApproved: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  seatingPlan: {
    seatingPlanId: "1",
    stadiumId: "1",
    name: "Concert Layout",
    description: "",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  sections: [
  {
    sectionId: "north",
    seatingPlanId: "1",
    name: "North Stand",
    type: "Seated",
    seatType: "Standard",
    color: "#3b82f6",
    posX: 250,
    posY: 50,
    width: 500,
    height: 120,
    isActive: true,
  },
  {
    sectionId: "south",
    seatingPlanId: "1",
    name: "South Stand",
    type: "Seated",
    seatType: "Standard",
    color: "#3b82f6",
    posX: 250,
    posY: 630,
    width: 500,
    height: 120,
    isActive: true,
  },
  {
    sectionId: "west",
    seatingPlanId: "1",
    name: "West Stand",
    type: "Seated",
    seatType: "Premium",
    color: "#f59e0b",
    posX: 100,
    posY: 220,
    width: 120,
    height: 360,
    isActive: true,
  },
  {
    sectionId: "east",
    seatingPlanId: "1",
    name: "East Stand",
    type: "Seated",
    seatType: "Premium",
    color: "#f59e0b",
    posX: 780,
    posY: 220,
    width: 120,
    height: 360,
    isActive: true,
  },
],
  seats: [
    {
      seatId: "s1",
      sectionId: "north",
      rowLabel: "A",
      seatNumber: 1,
      seatLabel: "A1",
      posX: 400,
      posY: 200,
      isActive: true,
      isAccessible: false,
    },
  ],
  landmarks: [
  {
    featureId: "field",
    seatingPlanId: "1",
    type: "STAGE",
    label: "FIELD",
    posX: 300,
    posY: 250,
    width: 400,
    height: 300,
  }
]
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
        <SeatMapContainer layout={mockLayout} />
      </div>
    </div>
  );
}
