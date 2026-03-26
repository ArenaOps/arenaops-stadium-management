"use client";

import { useQuery } from "@tanstack/react-query";
import { coreService } from "@/services/coreService";
import { publicQueryKeys } from "./queryKeys";

export function useEventLayoutQuery(eventId: string) {
  return useQuery({
    queryKey: publicQueryKeys.eventLayout(eventId),
    queryFn: async () => {
      const response = await coreService.getEventLayout(eventId);
      return response.data;
    },
    enabled: Boolean(eventId),
    staleTime: 1000 * 30,
  });
}
