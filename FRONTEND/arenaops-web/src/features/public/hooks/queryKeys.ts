export const publicQueryKeys = {
  events: ["public", "events"] as const,
  eventDetail: (eventId: string) => ["public", "event", eventId] as const,
  eventSlots: (eventId: string) => ["public", "event", eventId, "slots"] as const,
  bookings: ["public", "bookings"] as const,
  bookingDetail: (bookingId: string) => ["public", "booking", bookingId] as const,
  eventLayout: (eventId: string) => ["public", "event", eventId, "layout"] as const,
};
