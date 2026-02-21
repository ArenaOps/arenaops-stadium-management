"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const router = useRouter()
  const handleTicket =()=>{
    router.push("/stadiums")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Event Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Summer Concert 2026
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Event ID: {eventId}
        </p>
      </div>

      {/* Event Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Event Details</h2>
        <div className="space-y-2 text-gray-700 dark:text-gray-300">
          <p><strong>Date:</strong> July 15, 2026</p>
          <p><strong>Time:</strong> 7:00 PM</p>
          <p><strong>Venue:</strong> Concert Arena</p>
          <p><strong>Capacity:</strong> 5,000 seats</p>
        </div>
      </div>

      {/* Book Tickets Button */}
      <div className="flex gap-4">
        <Link
          href={`/events/${eventId}/book`}
          onClick={handleTicket}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Book Tickets
        </Link>
        
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Back to Home
        </Link>
      </div>

      {/* Info */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> This is a placeholder event detail page for Stage 1 testing. Replace with your actual event detail implementation.
        </p>
      </div>
    </div>
  );
}
