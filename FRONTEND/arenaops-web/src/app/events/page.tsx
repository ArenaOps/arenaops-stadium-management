// app/events/page.tsx
import { EventDiscovery } from "@/components/landing/EventDiscovery";
import { Metadata } from "next";

export const metadata:Metadata = {
  title: "Upcoming Events | ArenaOps",
  description: "Discover upcoming sports and concerts near you."
};

export default async function EventsPage() {
  const res = await fetch("https://api.example.com/events", {
    next: { revalidate: 60 }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch events");
  }

  const events = await res.json();

  return <EventDiscovery events={events} />;
}