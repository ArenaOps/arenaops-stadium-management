"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loading";
import { useBookingsQuery, useRequireAuth } from "@/features/public/hooks";
import { BookingStatusBadge } from "./BookingStatusBadge";

function BookingListSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading bookings">
      {Array.from({ length: 4 }).map((_, index) => (
        <article key={`booking-skeleton-${index}`} className="rounded-xl border border-border p-5 space-y-3">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-10 w-40" />
        </article>
      ))}
    </div>
  );
}

export function BookingsListView() {
  const isAuthenticated = useRequireAuth();
  const bookingsQuery = useBookingsQuery(isAuthenticated);
  const bookings = bookingsQuery.data ?? [];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground">Track all your bookings and open full ticket details.</p>
        </header>

        {bookingsQuery.isLoading && <BookingListSkeleton />}

        {bookingsQuery.isError && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-6">
            <p className="text-sm text-red-200 mb-4">Bookings failed to load.</p>
            <Button type="button" onClick={() => void bookingsQuery.refetch()}>
              Retry
            </Button>
          </div>
        )}

        {!bookingsQuery.isLoading && !bookingsQuery.isError && bookings.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <h2 className="text-xl font-semibold mb-2">No bookings yet</h2>
            <p className="text-muted-foreground mb-4">Once you confirm a booking, it will appear here.</p>
            <Button asChild>
              <Link href="/events">Browse Events</Link>
            </Button>
          </div>
        )}

        {!bookingsQuery.isLoading && !bookingsQuery.isError && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <article
                key={booking.bookingId}
                className="rounded-xl border border-border bg-card p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <h2 className="font-semibold text-lg">{booking.eventName || "Event Booking"}</h2>
                  <p className="text-sm text-muted-foreground">Booking ID: {booking.bookingId}</p>
                  <p className="text-sm text-muted-foreground">
                    Seats: {booking.seatCount} | Total: Rs. {booking.totalAmount}
                  </p>
                  <BookingStatusBadge status={booking.status} />
                </div>

                <Button asChild variant="outline">
                  <Link href={`/bookings/${booking.bookingId}`}>View Details</Link>
                </Button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
