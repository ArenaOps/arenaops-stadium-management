# Seat Map Booking Flow - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide helps you start implementing the seat map booking flow immediately.

---

## Step 1: Review the Documentation (5 min)

Read these documents in order:

1. **SEAT_MAP_BOOKING_FLOW_SPEC.md** - Complete specification
2. **SEAT_MAP_FLOW_DIAGRAM.md** - Visual diagrams
3. **SEAT_MAP_IMPLEMENTATION_CHECKLIST.md** - Track your progress

---

## Step 2: Create Your First Route (10 min)

### Create the seat selection page:

**File**: `src/app/events/[eventId]/book/page.tsx`

```typescript
"use client";

import { useParams } from "next/navigation";

export default function EventBookingPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Book Tickets</h1>
      <p>Event ID: {eventId}</p>
      {/* EventSeatMap component will go here */}
    </div>
  );
}
```

### Test it:
- Navigate to `http://localhost:3000/events/test-event-123/book`
- You should see "Book Tickets" and the event ID

---

## Step 3: Add "Book Tickets" Button (5 min)

### Update your Event Detail page:

**File**: `src/app/events/[eventId]/page.tsx` (or wherever your event detail is)

```typescript
import Link from "next/link";

export default function EventDetailPage({ params }: { params: { eventId: string } }) {
  return (
    <div className="container mx-auto py-8">
      <h1>Event Detail</h1>
      {/* Your existing event detail content */}
      
      <Link
        href={`/events/${params.eventId}/book`}
        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Book Tickets
      </Link>
    </div>
  );
}
```

### Test it:
- Click "Book Tickets" → should navigate to `/events/[eventId]/book`

---

## Step 4: Create EventSeatMap Component (15 min)

### Create the component:

**File**: `src/components/booking/EventSeatMap.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { SeatMapRenderer } from "@/components/seat-map/SeatMapRenderer";
import { defaultStadiumConfig } from "@/components/seat-map/seatMap.config";

interface EventSeatMapProps {
  eventId: string;
}

export function EventSeatMap({ eventId }: EventSeatMapProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch real event seat map data
    // For now, just simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, [eventId]);

  if (loading) {
    return <div>Loading seat map...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Select Your Seats</h2>
      
      {/* Reuse existing SeatMapRenderer with mock data */}
      <SeatMapRenderer
        config={defaultStadiumConfig}
        width="100%"
        height="600px"
        showLabels={true}
      />
    </div>
  );
}
```

### Create index file:

**File**: `src/components/booking/index.ts`

```typescript
export { EventSeatMap } from "./EventSeatMap";
```

### Update the booking page:

**File**: `src/app/events/[eventId]/book/page.tsx`

```typescript
"use client";

import { useParams } from "next/navigation";
import { EventSeatMap } from "@/components/booking";

export default function EventBookingPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  return (
    <div className="container mx-auto py-8">
      <EventSeatMap eventId={eventId} />
    </div>
  );
}
```

### Test it:
- Navigate to `/events/test-event-123/book`
- You should see the seat map rendering!

---

## Step 5: Add Seat Selection (20 min)

### Update EventSeatMap with selection logic:

```typescript
"use client";

import { useState, useEffect } from "react";
import { SeatMapRenderer } from "@/components/seat-map/SeatMapRenderer";
import { defaultStadiumConfig } from "@/components/seat-map/seatMap.config";
import type { Section } from "@/components/seat-map/types";

interface EventSeatMapProps {
  eventId: string;
}

interface SelectedSeat {
  sectionId: string;
  seatLabel: string;
  price: number;
}

export function EventSeatMap({ eventId }: EventSeatMapProps) {
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, [eventId]);

  const handleSectionClick = (section: Section) => {
    // For now, just add the section as a "seat"
    // Later, you'll handle individual seat clicks
    const isSelected = selectedSeats.some(s => s.sectionId === section.id);
    
    if (isSelected) {
      // Remove from selection
      setSelectedSeats(prev => prev.filter(s => s.sectionId !== section.id));
    } else {
      // Add to selection
      setSelectedSeats(prev => [...prev, {
        sectionId: section.id,
        seatLabel: section.label,
        price: 50, // Mock price
      }]);
    }
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  if (loading) {
    return <div>Loading seat map...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Seat Map */}
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold mb-4">Select Your Seats</h2>
        <SeatMapRenderer
          config={defaultStadiumConfig}
          width="100%"
          height="600px"
          showLabels={true}
          onSectionClick={handleSectionClick}
        />
      </div>

      {/* Selection Panel */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 sticky top-4">
          <h3 className="text-xl font-semibold mb-4">Your Selection</h3>
          
          {selectedSeats.length === 0 ? (
            <p className="text-gray-500">No seats selected</p>
          ) : (
            <>
              <ul className="space-y-2 mb-4">
                {selectedSeats.map(seat => (
                  <li key={seat.sectionId} className="flex justify-between">
                    <span>{seat.seatLabel}</span>
                    <span>${seat.price}</span>
                  </li>
                ))}
              </ul>
              
              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${totalPrice}</span>
                </div>
              </div>
              
              <button
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => alert("Hold seats - API integration coming next!")}
              >
                Hold Seats
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Test it:
- Click on sections in the seat map
- See them appear in the selection panel
- See total price update
- Click "Hold Seats" button

---

## Step 6: What's Next?

You now have a working seat selection UI! Next steps:

### Immediate (Stage 2 Complete):
- [ ] Extract `SeatSelectionPanel` into its own component
- [ ] Add "Remove" button for each seat
- [ ] Add "Clear All" button
- [ ] Improve styling and animations

### Short-term (Stage 3):
- [ ] Create API functions in `lib/api/booking.ts`
- [ ] Replace mock data with real API calls
- [ ] Implement seat hold functionality
- [ ] Add `HoldTimer` component

### Medium-term (Stage 4):
- [ ] Set up SignalR connection
- [ ] Implement real-time seat updates
- [ ] Test with multiple browsers

### Long-term (Stages 5-6):
- [ ] Add standing section support
- [ ] Implement payment flow
- [ ] Create confirmation page

---

## Common Issues & Solutions

### Issue: "Module not found" error
**Solution**: Make sure you've created all the files in the correct locations. Check import paths.

### Issue: Seat map not rendering
**Solution**: Verify `SeatMapRenderer` is imported correctly. Check browser console for errors.

### Issue: Styling looks broken
**Solution**: Ensure Tailwind CSS is configured. Check `tailwind.config.ts` includes the new paths.

### Issue: TypeScript errors
**Solution**: Make sure types are imported from `@/components/seat-map/types`. Run `npm run build` to check.

---

## Development Tips

### Use the Demo Page for Testing
- Keep `/seatmap` page for quick testing
- Test new features there before integrating into booking flow

### Mock Data First
- Start with mock data (like `defaultStadiumConfig`)
- Get the UI working before adding API calls
- This lets you work independently of backend

### Incremental Development
- Don't try to build everything at once
- Follow the stages in the spec
- Test each stage before moving to the next

### Use Browser DevTools
- React DevTools to inspect component state
- Network tab to debug API calls
- Console to check for errors

---

## Resources

### Documentation:
- Full Spec: `SEAT_MAP_BOOKING_FLOW_SPEC.md`
- Diagrams: `SEAT_MAP_FLOW_DIAGRAM.md`
- Checklist: `SEAT_MAP_IMPLEMENTATION_CHECKLIST.md`

### Existing Components:
- `src/components/seat-map/SeatMapRenderer.tsx`
- `src/components/seat-map/SeatMapDemo.tsx`
- `src/components/seat-map/seatMap.config.ts`

### Project Docs:
- `docs/01-Description.md` - Project overview
- `docs/02-High-Level-Architecture.md` - Architecture
- `docs/04-Api-Documentation.md` - API endpoints

---

## Need Help?

### Questions to Ask Your Team:

**Backend Team**:
- What's the exact API endpoint for event seat map data?
- Is the SignalR hub deployed and accessible?
- What's the authentication approach for booking APIs?

**Frontend Team**:
- How should we handle authentication tokens?
- What's our state management strategy (Redux vs local state)?
- Are there existing API utility functions we should use?

**Design Team**:
- What are the exact colors for seat states?
- Do we have designs for the selection panel?
- What's the mobile layout approach?

---

## Success Checklist

After completing this quick start, you should have:

- ✅ `/events/[eventId]/book` route created
- ✅ "Book Tickets" button on event detail page
- ✅ `EventSeatMap` component rendering
- ✅ Seat selection working (click to select/deselect)
- ✅ Selection panel showing selected seats and total
- ✅ Basic layout (seat map + selection panel side-by-side)

**Time to complete**: ~1 hour

**Next**: Continue with Stage 2 tasks from the checklist!

---

**Quick Start Version**: 1.0  
**Last Updated**: 2026-02-20  
**Estimated Time**: 1 hour for basic setup
