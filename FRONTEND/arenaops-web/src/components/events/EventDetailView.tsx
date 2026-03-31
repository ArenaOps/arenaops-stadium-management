"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loading";
import { useEventDetailQuery } from "@/features/public/hooks";

type EventDetailViewProps = {
  eventId: string;
};

function EventDetailSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="relative h-[320px] w-full overflow-hidden">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
      <div className="container mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
        <div>
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    </div>
  );
}

export function EventDetailView({ eventId }: EventDetailViewProps) {
  const { data, isLoading, isError, refetch } = useEventDetailQuery(eventId);

  if (isLoading) {
    return <EventDetailSkeleton />;
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4">Unable to Load Event</h1>
          <p className="text-muted-foreground mb-6">
            Event details could not be fetched right now.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button type="button" onClick={() => void refetch()}>
              Retry
            </Button>
            <Button asChild variant="outline">
              <Link href="/events">Back to Events</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The event you are looking for does not exist.
          </p>
          <Button asChild variant="outline">
            <Link href="/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { event, slots } = data;
  const startDate = event.startDate ? new Date(event.startDate) : null;
  const firstSlot = slots[0];
  const eventStatus = event.status || "Live";

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="relative h-[320px] w-full overflow-hidden">
        <Image
          src={event.imageUrl || "https://images.unsplash.com/photo-1506157786151-b8491531f063"}
          alt={event.name}
          fill
          priority
          className="object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative container mx-auto px-6 py-16 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.name}</h1>
          <p className="text-lg text-gray-200">{event.description || `Event ID: ${eventId}`}</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-8 tracking-tight">Event Details</h2>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted transition-colors">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold">
                    {startDate
                      ? startDate.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "TBD"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted transition-colors">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-semibold">
                    {firstSlot?.startTime
                      ? new Date(firstSlot.startTime).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "TBD"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted transition-colors">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Venue</p>
                  <p className="font-semibold">{event.stadiumName || "Arena"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted transition-colors">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-semibold">{event.eventType || "Event"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-4 tracking-tight">About This Event</h2>
            <p className="text-muted-foreground leading-relaxed">
              {event.description || "No description available for this event yet."}
            </p>
          </div>
        </div>

        <div className="sticky top-24 h-fit">
          <div className="bg-card text-card-foreground rounded-[var(--radius-lg)] shadow-2xl p-8 border border-border space-y-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Starting From</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-extrabold text-primary">Rs. 999</h3>
                <span className="text-muted-foreground text-sm">per ticket</span>
              </div>
              <p className="text-xs text-muted-foreground">Limited seats available</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Status</p>
              <p className="font-semibold capitalize">{eventStatus.toLowerCase()}</p>
            </div>

            {eventStatus === "Live" ? (
              <Button asChild className="w-full h-11 font-semibold">
                <Link href={`/events/${eventId}/book`}>Book Tickets</Link>
              </Button>
            ) : (
              <Button disabled className="w-full h-11">
                Coming Soon
              </Button>
            )}

            <Button asChild variant="outline" className="w-full h-11 font-medium">
              <Link href="/events">Back to Events</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
