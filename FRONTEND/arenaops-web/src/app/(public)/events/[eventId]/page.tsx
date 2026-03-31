import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import {
  coreService,
  type CoreServiceError,
  normalizeCoreServiceError,
  type Event,
  type EventSlot,
} from "@/services/coreService";

type Props = {
  params: Promise<{
    eventId: string;
  }>;
};

const isDev = process.env.NODE_ENV === "development";

function EventErrorState({ eventId, error }: { eventId: string; error: CoreServiceError }) {
  const status = error?.status ?? 0;
  const isNotFound = status === 404;
  const isSessionExpired = status === 401;
  const isNetworkError = status === 0;

  const title = isNotFound
    ? "Event Not Found"
    : isSessionExpired
      ? "Session expired"
      : isNetworkError
        ? "Network error"
        : "Something went wrong";

  const description = isNotFound
    ? "The event you are looking for does not exist or has been removed."
    : isSessionExpired
      ? "Your session expired while loading this event. Please sign in again and retry."
      : isNetworkError
        ? "We could not reach the server. Please check your connection and retry."
        : "We could not load this event right now. Please try again.";

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-lg px-6">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-muted-foreground mb-6">{description}</p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href={isSessionExpired ? "/login" : `/events/${eventId}`}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            {isSessionExpired ? "Go to Login" : "Retry"}
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Back to Events
          </Link>
        </div>
      </div>
    </div>
  );
}

function buildRequestConfig(cookieHeader: string) {
  return cookieHeader ? { headers: { Cookie: cookieHeader } } : undefined;
}

export async function generateMetadata({ params }: Props) {
  const { eventId } = await params;

  try {
    const cookieStore = await cookies();
    const response = await coreService.getEvent(eventId, buildRequestConfig(cookieStore.toString()));
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

export default async function EventDetailPage({ params }: Props) {
  const { eventId } = await params;

  const cookieStore = await cookies();
  const requestConfig = buildRequestConfig(cookieStore.toString());

  let event: Event | null = null;
  let slots: EventSlot[] = [];
  let eventError: CoreServiceError | null = null;

  try {
    const eventResponse = await coreService.getEvent(eventId, requestConfig);
    event = eventResponse.data;
  } catch (error) {
    eventError = normalizeCoreServiceError(error, "Unable to load event details");

    if (isDev) {
      console.error("[EventDetailPage] Event load failed", {
        eventId,
        status: eventError?.status ?? null,
        message: eventError?.message ?? "Unknown error",
        code: eventError?.code ?? null,
      });
    }
  }

  if (!event) {
    return (
      <EventErrorState
        eventId={eventId}
        error={
          eventError ?? {
            message: "Event not found",
            status: 404,
            code: "NOT_FOUND",
          }
        }
      />
    );
  }

  try {
    const slotsResponse = await coreService.getEventSlots(eventId, requestConfig);
    slots = slotsResponse.data || [];
  } catch (error) {
    const slotError = normalizeCoreServiceError(error, "Unable to load event slots");

    if (isDev) {
      console.warn("[EventDetailPage] Slot load failed; rendering event with fallback", {
        eventId,
        status: slotError?.status ?? null,
        message: slotError?.message ?? "Unknown error",
        code: slotError?.code ?? null,
      });
    }

    slots = [];
  }

  const startDate = event.startDate ? new Date(event.startDate) : null;
  const firstSlot = slots[0];

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
              {event.description ||
                "No description available for this event. Check back for more information."}
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
              <p className="font-semibold capitalize">{event.status || "Live"}</p>
            </div>

            {event.status === "Live" ? (
              <Link
                href={`/events/${eventId}/book`}
                className="block w-full text-center py-3 bg-primary text-primary-foreground font-semibold rounded-[var(--radius-md)] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                Book Tickets
              </Link>
            ) : (
              <button
                disabled
                className="block w-full text-center py-3 bg-muted text-muted-foreground font-semibold rounded-[var(--radius-md)] cursor-not-allowed"
              >
                Coming Soon
              </button>
            )}

            <Link
              href="/"
              className="block w-full text-center py-3 bg-secondary text-secondary-foreground font-medium rounded-[var(--radius-md)] hover:bg-secondary/80 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
