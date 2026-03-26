"use client";

import { useQuery } from "@tanstack/react-query";
import { coreService, type Event, type EventSlot } from "@/services/coreService";
import { publicQueryKeys } from "./queryKeys";

type EventDetailResult = {
  event: Event;
  slots: EventSlot[];
};

export function useEventDetailQuery(eventId: string) {
  return useQuery<EventDetailResult>({
    queryKey: publicQueryKeys.eventDetail(eventId),
    queryFn: async () => {
      const [eventResponse, slotsResponse] = await Promise.all([
        coreService.getEvent(eventId),
        coreService.getEventSlots(eventId),
      ]);

      return {
        event: eventResponse.data,
        slots: slotsResponse.data ?? [],
      };
    },
    enabled: Boolean(eventId),
    staleTime: 1000 * 30,
  });
}
