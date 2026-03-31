import type { Booking } from "@/services/coreService";

type BookingStatus = Booking["status"];

const statusClassMap: Record<BookingStatus, string> = {
  PendingPayment: "bg-amber-500/15 text-amber-200 border-amber-400/40",
  Confirmed: "bg-emerald-500/15 text-emerald-200 border-emerald-400/40",
  Cancelled: "bg-red-500/15 text-red-200 border-red-400/40",
  Expired: "bg-slate-500/15 text-slate-200 border-slate-400/40",
  Failed: "bg-rose-500/15 text-rose-200 border-rose-400/40",
};

type BookingStatusBadgeProps = {
  status: BookingStatus;
};

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClassMap[status]}`}
      aria-label={`Booking status: ${status}`}
    >
      {status}
    </span>
  );
}
