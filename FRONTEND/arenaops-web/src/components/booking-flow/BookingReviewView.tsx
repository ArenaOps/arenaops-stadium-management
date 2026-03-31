"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToastActions } from "@/components/ui/toast";
import { useBooking } from "@/features/bookings/useBooking";
import {
  useCreateBookingMutation,
  useEventDetailQuery,
  useRequireAuth,
} from "@/features/public/hooks";

type BookingReviewViewProps = {
  eventId: string;
};

const TICKET_PRICE = 999;

export function BookingReviewView({ eventId }: BookingReviewViewProps) {
  const router = useRouter();
  const isAuthenticated = useRequireAuth();
  const { state, clearAll } = useBooking();
  const { success, error: showError } = useToastActions();
  const eventQuery = useEventDetailQuery(eventId);
  const createBookingMutation = useCreateBookingMutation();

  const selectedSeats = state.selectedSeats;
  const totalAmount = useMemo(() => selectedSeats.length * TICKET_PRICE, [selectedSeats.length]);

  useEffect(() => {
    if (isAuthenticated && selectedSeats.length === 0) {
      router.replace(`/events/${eventId}/book`);
    }
  }, [eventId, isAuthenticated, router, selectedSeats.length]);

  if (!isAuthenticated || selectedSeats.length === 0) {
    return null;
  }

  const eventName = eventQuery.data?.event.name || "Event";

  const handleConfirmBooking = async () => {
    try {
      const booking = await createBookingMutation.mutateAsync({
        eventId,
        seatIds: selectedSeats,
      });

      clearAll();
      success("Booking confirmed successfully.");
      router.replace(`/bookings/${booking.bookingId}`);
    } catch {
      showError("Booking confirmation failed. Please retry.");
    }
  };

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-emerald-400">Step 2 of 2</p>
          <h1 className="text-3xl font-bold">Review and Confirm</h1>
          <p className="text-muted-foreground">
            Validate selected seats for <span className="font-medium text-foreground">{eventName}</span>.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <article className="md:col-span-2 rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Selected Seats</h2>

            <div className="flex flex-wrap gap-2 mb-5" aria-label="Selected seats">
              {selectedSeats.map((seatId) => (
                <span
                  key={seatId}
                  className="rounded-full border border-emerald-300/40 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-200"
                >
                  {seatId}
                </span>
              ))}
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm space-y-1">
              <p>Tickets: {selectedSeats.length}</p>
              <p>Price per ticket: Rs. {TICKET_PRICE}</p>
              <p className="font-semibold text-base pt-2">Estimated total: Rs. {totalAmount}</p>
            </div>
          </article>

          <aside className="rounded-xl border border-border bg-card p-6 h-fit space-y-4">
            <h2 className="text-lg font-semibold">Confirm Booking</h2>
            <p className="text-sm text-muted-foreground">
              By confirming, seats are reserved under your account.
            </p>

            <Button
              type="button"
              onClick={() => void handleConfirmBooking()}
              disabled={createBookingMutation.isPending}
              className="w-full"
              aria-label="Confirm booking"
            >
              {createBookingMutation.isPending ? "Confirming..." : "Confirm Booking"}
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href={`/events/${eventId}/book`}>Back to Seat Selection</Link>
            </Button>
          </aside>
        </div>
      </div>
    </section>
  );
}
