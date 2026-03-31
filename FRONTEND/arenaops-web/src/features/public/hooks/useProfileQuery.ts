"use client";

import { useQuery } from "@tanstack/react-query";
import { authService, type UserProfile } from "@/services/authService";

export function useProfileQuery(enabled = true) {
  return useQuery<UserProfile>({
    queryKey: ["public", "profile"],
    queryFn: async () => {
      const response = await authService.getProfile();
      console.log("[useProfileQuery] response", response);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Profile fetch failed");
      }
      return response.data;
    },
    enabled,
    staleTime: 1000 * 60,
  });
}
