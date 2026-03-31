"use client";

import { useQuery } from "@tanstack/react-query";
import { coreService, type Event } from "@/services/coreService";
import { publicQueryKeys } from "./queryKeys";

export function useEventsQuery() {
  return useQuery<Event[]>({
    queryKey: publicQueryKeys.events,
    queryFn: async () => {
      const response = await coreService.getEvents("Live");
      return response.data ?? [];
    },
    staleTime: 1000 * 60,
  });
}
