"use client";

import { useMemo } from "react";
import { SeatMapContainer } from "@/components/seat-map/SeatMapContainer";
import { buildDirectionalStadiumLayout } from "@/components/seat-map/stadiumLayout.config";
import { toSeatingPlanLayout } from "@/components/seat-map/layoutTransform";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loading";
import { useEventDetailQuery, useEventLayoutQuery, useRequireAuth } from "@/features/public/hooks";

type SeatSelectionViewProps = {
  eventId: string;
};

function SeatSelectionSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-4">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-5 w-44" />
      <Skeleton className="h-[720px] w-full rounded-xl" />
    </div>
  );
}

export function SeatSelectionView({ eventId }: SeatSelectionViewProps) {
  const isAuthenticated = useRequireAuth();
  const eventQuery = useEventDetailQuery(eventId);
  const layoutQuery = useEventLayoutQuery(eventId);

  const layout = useMemo(() => {
    const fallbackLayout = buildDirectionalStadiumLayout();
    const mappedLayout = toSeatingPlanLayout(layoutQuery.data);
    return mappedLayout ?? fallbackLayout;
  }, [layoutQuery.data]);

  if (!isAuthenticated) {
    return null;
  }

  if (eventQuery.isLoading || layoutQuery.isLoading) {
    return <SeatSelectionSkeleton />;
  }

  if (eventQuery.isError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-center">
          <h2 className="text-lg font-semibold text-red-100 mb-2">Event data could not be loaded</h2>
          <p className="text-sm text-red-200 mb-4">Please retry and continue your booking.</p>
          <Button type="button" onClick={() => void eventQuery.refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const eventName = eventQuery.data?.event.name || "Event";

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Select Your Seats</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {eventName} | Event ID: {eventId}
        </p>
      </div>

      {layoutQuery.isError && (
        <div className="rounded-lg border border-amber-400/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 mb-6">
          Live seat layout is unavailable. Showing default stadium layout.
        </div>
      )}

      <div className="seat-map-shell rounded-lg border p-6">
        <SeatMapContainer layout={layout} eventId={eventId} />
      </div>
    </div>
  );
}
