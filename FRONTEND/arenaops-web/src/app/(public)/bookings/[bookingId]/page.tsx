import { BookingDetailView } from "@/components/bookings";

type Props = {
  params: {
    bookingId: string;
  };
};

export default function BookingDetailPage({ params }: Props) {
  return <BookingDetailView bookingId={params.bookingId} />;
}
