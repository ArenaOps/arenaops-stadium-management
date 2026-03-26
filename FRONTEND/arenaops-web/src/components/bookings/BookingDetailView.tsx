"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loading";
import { useBookingDetailQuery, useRequireAuth } from "@/features/public/hooks";
import { BookingStatusBadge } from "./BookingStatusBadge";

type BookingDetailViewProps = {
  bookingId: string;
};

function BookingDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-36 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function BookingDetailView({ bookingId }: BookingDetailViewProps) {
  const isAuthenticated = useRequireAuth();
  const bookingQuery = useBookingDetailQuery(bookingId, isAuthenticated);

  if (!isAuthenticated) {
    return null;
  }

  if (bookingQuery.isLoading) {
    return <BookingDetailSkeleton />;
  }

  if (bookingQuery.isError) {
    return (
      <section className="container mx-auto px-4 py-10">
        <div className="max-w-xl mx-auto rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-center">
          <h1 className="text-xl font-semibold text-red-100 mb-2">Booking failed to load</h1>
          <p className="text-sm text-red-200 mb-4">Try again to fetch booking details.</p>
          <div className="flex items-center justify-center gap-3">
            <Button type="button" onClick={() => void bookingQuery.refetch()}>
              Retry
            </Button>
            <Button asChild variant="outline">
              <Link href="/bookings">Back to Bookings</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (!bookingQuery.data) {
    return null;
  }

  const booking = bookingQuery.data;

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Booking Details</h1>
            <p className="text-sm text-muted-foreground">Booking ID: {booking.bookingId}</p>
          </div>
          <BookingStatusBadge status={booking.status} />
        </header>

        <article className="rounded-xl border border-border bg-card p-6 space-y-3">
          <h2 className="text-lg font-semibold">{booking.eventName || "Event Booking"}</h2>
          <p className="text-sm text-muted-foreground">Created: {new Date(booking.createdAt).toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Seat count: {booking.seatCount}</p>
          <p className="text-base font-semibold">Total paid: Rs. {booking.totalAmount}</p>
        </article>

        <article className="rounded-xl border border-border bg-card p-6 space-y-3">
          <h2 className="text-lg font-semibold">Seat Allocation</h2>

          {booking.seats && booking.seats.length > 0 ? (
            <ul className="space-y-2">
              {booking.seats.map((seat) => (
                <li
                  key={`${seat.sectionName}-${seat.seatLabel}`}
                  className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm flex items-center justify-between gap-3"
                >
                  <span>
                    {seat.sectionName} | {seat.seatLabel}
                  </span>
                  <span className="font-medium">Rs. {seat.price}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Seat-level details are not available for this booking.</p>
          )}
        </article>

        <Button asChild variant="outline">
          <Link href="/bookings">Back to All Bookings</Link>
        </Button>
      </div>
    </section>
  );
}
