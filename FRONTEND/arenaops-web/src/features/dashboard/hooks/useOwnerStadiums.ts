import { useQuery } from "@tanstack/react-query";
import { coreService } from "@/services/coreService";

export function useOwnerStadiums(ownerId: string | null) {
  return useQuery({
    queryKey: ["owner-stadiums", ownerId],
    queryFn: () => coreService.getStadiumsByOwner(ownerId!),
    enabled: !!ownerId,
    staleTime: 30_000,
    retry: 1,
  });
}
