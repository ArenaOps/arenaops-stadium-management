"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { coreService, type Booking } from "@/services/coreService";
import { publicQueryKeys } from "./queryKeys";

export function useBookingsQuery(enabled = true) {
  return useQuery<Booking[]>({
    queryKey: publicQueryKeys.bookings,
    queryFn: async () => {
      const response = await coreService.getMyBookings();
      return response.data ?? [];
    },
    enabled,
    staleTime: 1000 * 30,
  });
}

export function useBookingDetailQuery(bookingId: string, enabled = true) {
  return useQuery<Booking>({
    queryKey: publicQueryKeys.bookingDetail(bookingId),
    queryFn: async () => {
      const response = await coreService.getBooking(bookingId);
      return response.data;
    },
    enabled: enabled && Boolean(bookingId),
    staleTime: 1000 * 30,
  });
}

export function useCreateBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { eventId: string; seatIds: string[] }) => {
      const createResponse = await coreService.createBooking(payload);
      const createdBooking = createResponse.data;

      try {
        await coreService.confirmBooking(createdBooking.bookingId);
      } catch {
        // Booking can still be valid even if immediate confirmation fails.
      }

      return createdBooking;
    },
    onSuccess: async (booking) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: publicQueryKeys.bookings }),
        queryClient.invalidateQueries({
          queryKey: publicQueryKeys.bookingDetail(booking.bookingId),
        }),
      ]);
    },
  });
}
