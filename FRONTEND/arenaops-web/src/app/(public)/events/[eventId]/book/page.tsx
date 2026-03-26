import { SeatSelectionView } from "@/components/booking-flow/SeatSelectionView";

type Props = {
  params: {
    eventId: string;
  };
};

export default function EventBookingPage({ params }: Props) {
  return <SeatSelectionView eventId={params.eventId} />;
}
