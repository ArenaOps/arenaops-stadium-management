import { BookingReviewView } from "@/components/booking-flow/BookingReviewView";

type Props = {
  params: {
    eventId: string;
  };
};

export default function BookingReviewPage({ params }: Props) {
  return <BookingReviewView eventId={params.eventId} />;
}
