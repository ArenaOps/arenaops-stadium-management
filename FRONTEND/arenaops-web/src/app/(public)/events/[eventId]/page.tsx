import type { Metadata } from "next";
import { EventDetailView } from "@/components/events/EventDetailView";
import { coreService } from "@/services/coreService";

type Props = {
  params: {
    eventId: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventId } = params;

  try {
    const response = await coreService.getEvent(eventId);
    const event = response.data;

    return {
      title: `${event?.name || "Event"} | ArenaOps`,
      description: event?.description || "Details for event",
    };
  } catch {
    return {
      title: `Event ${eventId} | ArenaOps`,
      description: `Details for event ${eventId}`,
    };
  }
}

export default function EventDetailPage({ params }: Props) {
  return <EventDetailView eventId={params.eventId} />;
}
