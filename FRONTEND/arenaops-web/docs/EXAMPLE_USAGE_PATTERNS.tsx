/**
 * REAL-WORLD USAGE EXAMPLES
 * 
 * Practical patterns for using UX components in typical application scenarios.
 * 
 * @eslint-disable @typescript-eslint/no-explicit-any
 */

"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
    ErrorBoundary,
    useToastActions,
    PageLoader,
    SectionLoader,
    SkeletonCard,
    SkeletonTable,
} from "@/components/ui";

// ────────────────────────────────────────────────────────────────────────────
// EXAMPLE 1: Fetch & Display List with Skeleton Loading
// ────────────────────────────────────────────────────────────────────────────

export function EventsList() {
    const { data: events, isLoading, error } = useQuery({
        queryKey: ["events"],
        queryFn: async () => {
            const res = await fetch("/api/events");
            if (!res.ok) throw new Error("Failed to load events");
            return res.json();
        },
    });

    if (error) {
        return (
            <div className="text-red-600 p-4">
                Unable to load events. Try refreshing the page.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-4">
            {isLoading
                ? // Show skeleton cards while loading
                  Array.from({ length: 6 }).map((_, i) => (
                      <SkeletonCard key={i} />
                  ))
                : // Show actual content
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (events as Array<any>)?.map((event: any) => (
                      <div
                          key={event.id}
                          className="border rounded-lg p-4 hover:shadow-lg transition"
                      >
                          <h3 className="font-bold">{event.name}</h3>
                          <p className="text-sm text-gray-600">{event.date}</p>
                      </div>
                  ))}
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// EXAMPLE 2: Form Submission with Toast Feedback
// ────────────────────────────────────────────────────────────────────────────

export function BookingForm() {
    const { success, error: errorToast } = useToastActions();

    const bookingMutation = useMutation({
        mutationFn: async (bookingData: unknown) => {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookingData),
            });
            if (!res.ok) throw new Error("Booking failed");
            return res.json();
        },
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate
        const form = e.currentTarget;
        const seats = form.querySelector("input[name='seats']") as HTMLInputElement;

        if (!seats.value) {
            errorToast("Please select seats");
            return;
        }

        // Submit
        try {
            await bookingMutation.mutateAsync({ seats: seats.value });
            success(
                "Booking confirmed! Check your email for details.",
                "Booking Success"
            );
            form.reset();
        } catch {
            errorToast(
                "Unable to complete booking. Try again or contact support.",
                "Booking Failed"
            );
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="text"
                name="seats"
                placeholder="Select seats"
                disabled={bookingMutation.isPending}
            />
            <button
                type="submit"
                disabled={bookingMutation.isPending}
                className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
                {bookingMutation.isPending ? "Booking..." : "Book Now"}
            </button>
        </form>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// EXAMPLE 3: Data Table with Error Handling
// ────────────────────────────────────────────────────────────────────────────

function EventsTableContent() {
    const { data: events, isLoading, error } = useQuery({
        queryKey: ["events-table"],
        queryFn: async () => {
            const res = await fetch("/api/events");
            if (!res.ok) throw new Error("Failed to fetch events table");
            return res.json();
        },
    });

    if (isLoading) {
        return <SkeletonTable rows={8} columns={5} />;
    }

    if (error) {
        return (
            <SectionLoader message="Failed to load events table. Try refreshing." />
        );
    }

    return (
        <table className="w-full border-collapse">
            <thead>
                <tr className="border-b">
                    <th className="text-left p-3">Event Name</th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Location</th>
                    <th className="text-left p-3">Capacity</th>
                    <th className="text-left p-3">Actions</th>
                </tr>
            </thead>
            <tbody>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(events as Array<any>)?.map((event: any) => (
                    <tr key={event.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{event.name}</td>
                        <td className="p-3">{event.date}</td>
                        <td className="p-3">{event.location}</td>
                        <td className="p-3">{event.capacity}</td>
                        <td className="p-3">
                            <button className="text-blue-600 hover:underline">
                                Edit
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export function EventsTable() {
    return (
        <ErrorBoundary errorTitle="Events Table Error">
            <EventsTableContent />
        </ErrorBoundary>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// EXAMPLE 4: Async Action with Pending State
// ────────────────────────────────────────────────────────────────────────────

export function DeleteEventButton({ eventId }: { eventId: string }) {
    const { success, error: errorToast } = useToastActions();

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/events/${eventId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete event");
            return res.json();
        },
        onSuccess: () => {
            success("Event deleted successfully");
        },
        onError: () => {
            errorToast("Failed to delete event");
        },
    });

    return (
        <button
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
        >
            {deleteMutation.isPending ? "Deleting..." : "Delete Event"}
        </button>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// EXAMPLE 5: Complex Component with Multiple States
// ────────────────────────────────────────────────────────────────────────────

function StadiumDetailsContent({ stadiumId }: { stadiumId: string }) {
    const { success, error: errorToast } = useToastActions();

    const { data: stadium, isLoading, error } = useQuery({
        queryKey: ["stadium", stadiumId],
        queryFn: async () => {
            const res = await fetch(`/api/stadiums/${stadiumId}`);
            if (!res.ok) throw new Error("Failed to load stadium");
            return res.json();
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (updates: Partial<typeof stadium>) => {
            const res = await fetch(`/api/stadiums/${stadiumId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            if (!res.ok) throw new Error("Failed to update stadium");
            return res.json();
        },
        onSuccess: () => {
            success("Stadium updated successfully!");
        },
        onError: () => {
            errorToast("Failed to update stadium. Try again.");
        },
    });

    if (isLoading) {
        return <PageLoader message="Loading stadium details…" />;
    }

    if (error) {
        return (
            <div className="text-center p-8">
                <p className="text-red-600 mb-4">Unable to load stadium details</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{stadium?.name}</h1>
                <p className="text-gray-600">{stadium?.location}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="border rounded p-4">
                    <h3 className="font-semibold mb-2">Capacity</h3>
                    <p className="text-xl">{stadium?.capacity}</p>
                </div>
                <div className="border rounded p-4">
                    <h3 className="font-semibold mb-2">Year Built</h3>
                    <p className="text-xl">{stadium?.yearBuilt}</p>
                </div>
            </div>

            <button
                onClick={() => {
                    if (confirm("Update stadium info?")) {
                        updateMutation.mutate({
                            name: stadium?.name,
                        });
                    }
                }}
                disabled={updateMutation.isPending}
                className="px-6 py-2 bg-green-500 text-white rounded disabled:opacity-50"
            >
                {updateMutation.isPending ? "Updating…" : "Update Stadium"}
            </button>
        </div>
    );
}

export function StadiumDetails({ stadiumId }: { stadiumId: string }) {
    return (
        <ErrorBoundary errorTitle="Stadium Details Error">
            <StadiumDetailsContent stadiumId={stadiumId} />
        </ErrorBoundary>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// EXAMPLE 6: Conditional Loading States
// ────────────────────────────────────────────────────────────────────────────

export function SearchResults({ query }: { query: string }) {
    const [results, setResults] = useState([]);
    const [, setSearching] = useState(false);
    const { info } = useToastActions();

    const handleSearch = async () => {
        if (!query.trim()) {
            info("Please enter a search term");
            return;
        }

        setSearching(true);
        try {
            const res = await fetch(`/api/search?q=${query}`);
            const data = await res.json();
            setResults(data);

            if (data.length === 0) {
                info("No results found");
            }
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="space-y-4">
            <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-500 text-white rounded"
            >
                Search
            </button>

            {results.length > 0 && (
                <div className="space-y-2">
                    {results.map((result: Record<string, unknown>) => (
                        <div
                            key={result.id as string}
                            className="border rounded p-4 hover:bg-gray-50"
                        >
                            <h3 className="font-semibold">{result.name as string}</h3>
                            <p className="text-sm text-gray-600">
                                {result.description as string}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
