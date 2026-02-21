# Seat Map Booking Flow - Frontend Implementation Spec

## Overview

This specification outlines the frontend implementation for integrating the seat map into the user booking flow. The goal is to enable users to browse events, select seats, and complete bookings through an intuitive, real-time interface.

---

## Current State

- Seat map exists at `/seatmap` as a demo/testing page
- `SeatMapRenderer` component is functional with static configurations
- `SeatMapDemo` component demonstrates basic interactions
- No integration with event booking flow

---

## Target User Flow

```
Event Discovery → Event Detail → Book Tickets → Seat Selection → Hold Seats → Payment → Confirmation
```

### Detailed Flow:

1. User browses events on Event Discovery or Event Detail page
2. User clicks "Book Tickets" button for a specific event
3. App navigates to `/events/[eventId]/book`
4. Seat map loads with real-time availability for that event
5. User selects seats (seated) or quantity (standing)
6. Selected seats are temporarily held (2-minute timer)
7. User proceeds to payment
8. Booking confirmed → digital ticket issued

---

## Route Structure (Next.js App Router)

### Recommended Routes:

```
/seatmap                           # Demo/testing page (keep as-is)
/events                            # Event listing page
/events/[eventId]                  # Event detail page
/events/[eventId]/book             # Seat selection page (NEW)
/bookings/[bookingId]/payment      # Payment page (NEW)
/bookings/[bookingId]/confirmation # Confirmation page (NEW)
```

### Route Responsibilities:

| Route | Type | Purpose | Key Components |
|-------|------|---------|----------------|
| `/seatmap` | Client | Demo/testing | `SeatMapDemo` |
| `/events/[eventId]` | Server/Client | Event details, "Book Tickets" CTA | `EventDetail`, `BookTicketsButton` |
| `/events/[eventId]/book` | Client | Interactive seat selection | `EventSeatMap`, `SeatSelectionPanel`, `HoldTimer` |
| `/bookings/[bookingId]/payment` | Client | Payment processing | `PaymentForm`, `BookingSummary` |
| `/bookings/[bookingId]/confirmation` | Server/Client | Booking success | `DigitalTicket`, `BookingDetails` |

---

## Component Architecture

### 1. Reusable Components (Already Exist)

#### `SeatMapRenderer` (Core Component)
**Location**: `src/components/seat-map/SeatMapRenderer.tsx`

**Purpose**: Pure rendering component for SVG-based seat maps

**Props Contract**:
```typescript
interface SeatMapRendererProps {
  config: SeatMapConfig;           // Stadium layout configuration
  width?: string;                  // SVG width (default: "100%")
  height?: string;                 // SVG height (default: "600px")
  showLabels?: boolean;            // Show section labels
  selectedSeats?: string[];        // Array of selected seat IDs
  onSectionHover?: (section: Section | null) => void;
  onSectionClick?: (section: Section) => void;
  onSeatClick?: (seat: Seat) => void;  // NEW: Individual seat click
  className?: string;
}
```

**Responsibilities**:
- Render SVG sections and seats
- Handle hover/click events
- Visual feedback for selected/held/confirmed states
- NO business logic (stateless)

---

### 2. New Components to Create

#### `EventSeatMap` (Smart Component)
**Location**: `src/components/booking/EventSeatMap.tsx`

**Purpose**: Event-specific seat map with real-time updates and booking logic

**Props**:
```typescript
interface EventSeatMapProps {
  eventId: string;
  onSeatsSelected: (seats: SelectedSeat[]) => void;
  onHoldComplete: (holdData: HoldResponse) => void;
}

interface SelectedSeat {
  eventSeatId: string;
  sectionId: string;
  seatLabel: string;
  price: number;
  seatType: 'seated' | 'standing';
}
```

**Responsibilities**:
- Fetch event seat map data from API
- Connect to SignalR for real-time updates
- Manage seat selection state
- Trigger seat hold API calls
- Display seat status colors (Available/Held/Confirmed)
- Handle standing section quantity selection

**State Management**:
```typescript
const [seatMapData, setSeatMapData] = useState<EventSeatMapData | null>(null);
const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
const [heldSeats, setHeldSeats] = useState<string[]>([]);
const [loading, setLoading] = useState(true);
```


---

#### `SeatSelectionPanel` (UI Component)
**Location**: `src/components/booking/SeatSelectionPanel.tsx`

**Purpose**: Display selected seats summary and actions

**Props**:
```typescript
interface SeatSelectionPanelProps {
  selectedSeats: SelectedSeat[];
  totalPrice: number;
  onRemoveSeat: (seatId: string) => void;
  onClearAll: () => void;
  onProceedToHold: () => void;
  disabled?: boolean;
}
```

**Responsibilities**:
- Show selected seats list
- Display total price
- "Remove" and "Clear All" actions
- "Hold Seats" button (triggers hold API)

---

#### `HoldTimer` (UI Component)
**Location**: `src/components/booking/HoldTimer.tsx`

**Purpose**: Countdown timer for held seats

**Props**:
```typescript
interface HoldTimerProps {
  expiresAt: Date;
  onExpired: () => void;
}
```

**Responsibilities**:
- Display countdown (MM:SS format)
- Visual warning when < 30 seconds
- Trigger callback on expiration
- Auto-release seats on expiration

---

#### `StandingSectionSelector` (UI Component)
**Location**: `src/components/booking/StandingSectionSelector.tsx`

**Purpose**: Quantity selector for standing sections

**Props**:
```typescript
interface StandingSectionSelectorProps {
  sectionId: string;
  sectionName: string;
  availableCapacity: number;
  pricePerSlot: number;
  onQuantityChange: (quantity: number) => void;
}
```

**Responsibilities**:
- Quantity input (1 to availableCapacity)
- Show price calculation
- Validate against capacity

---

## Data Contracts

### API Response Types

#### Event Seat Map Data
```typescript
interface EventSeatMapData {
  eventId: string;
  eventName: string;
  stadiumName: string;
  viewBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  sections: EventSection[];
  landmarks: Landmark[];
}

interface EventSection {
  sectionId: string;
  label: string;
  type: 'seated' | 'standing';
  colorKey: string;
  position: { x: number; y: number; width: number; height: number };
  seats?: EventSeat[];           // Only for seated sections
  capacity?: number;             // Only for standing sections
  availableCount: number;
  ticketPrice: number;
}

interface EventSeat {
  eventSeatId: string;
  seatLabel: string;             // e.g., "A-12"
  row: string;
  number: string;
  position: { x: number; y: number };
  status: 'Available' | 'Held' | 'Confirmed' | 'Inactive';
  price: number;
  isAccessible: boolean;
  lockedByCurrentUser: boolean;  // True if held by current user
}
```

#### Hold Response
```typescript
interface HoldResponse {
  success: boolean;
  bookingId?: string;
  heldSeats: HeldSeat[];
  expiresAt: Date;               // 2 minutes from now
  message?: string;
}

interface HeldSeat {
  eventSeatId: string;
  seatLabel: string;
  sectionName: string;
  price: number;
}
```

---

## API Integration Points

### Required API Endpoints (Backend provides these)

| Endpoint | Method | Purpose | Request | Response |
|----------|--------|---------|---------|----------|
| `/api/core/events/{eventId}/seats` | GET | Get seat map with real-time status | - | `EventSeatMapData` |
| `/api/core/events/{eventId}/seats/{seatId}/hold` | POST | Hold a specific seat | `{ userId }` | `HoldResponse` |
| `/api/core/events/{eventId}/standing/{sectionId}/hold` | POST | Hold N standing slots | `{ quantity, userId }` | `HoldResponse` |
| `/api/core/events/{eventId}/seats/{seatId}/release` | POST | Release held seat | `{ userId }` | `{ success: boolean }` |
| `/api/core/bookings` | POST | Create booking from held seats | `{ eventId, seats[] }` | `{ bookingId, totalPrice }` |

### API Call Flow:

```
1. Page Load → GET /api/core/events/{eventId}/seats
2. User Selects Seats → Local state update (no API call yet)
3. User Clicks "Hold Seats" → POST /api/core/events/{eventId}/seats/{seatId}/hold (for each seat)
4. Hold Success → Start 2-minute timer
5. User Clicks "Proceed to Payment" → POST /api/core/bookings
6. Navigate to /bookings/{bookingId}/payment
```

---

## SignalR Integration (Real-Time Updates)

### Connection Setup

**When to Connect**:
- Connect when user enters `/events/[eventId]/book` page
- Disconnect when user leaves the page

**Hub URL**: `/hubs/seat-status` (provided by backend)

**Connection Code** (conceptual):
```typescript
// In EventSeatMap component
useEffect(() => {
  const connection = new HubConnectionBuilder()
    .withUrl('/hubs/seat-status')
    .withAutomaticReconnect()
    .build();

  connection.start()
    .then(() => {
      // Join event-specific room
      connection.invoke('JoinEventRoom', eventId);
    });

  // Listen for seat status changes
  connection.on('SeatStatusChanged', (data: SeatStatusUpdate) => {
    updateSeatStatus(data);
  });

  return () => {
    connection.invoke('LeaveEventRoom', eventId);
    connection.stop();
  };
}, [eventId]);
```

### SignalR Events

| Event | Direction | Payload | When |
|-------|-----------|---------|------|
| `JoinEventRoom` | Client → Server | `eventId` | User opens seat map |
| `LeaveEventRoom` | Client → Server | `eventId` | User leaves seat map |
| `SeatStatusChanged` | Server → Client | `{ eventSeatId, seatLabel, oldStatus, newStatus }` | Any seat status changes |
| `BulkSeatStatusChanged` | Server → Client | `[{ eventSeatId, newStatus }]` | Cleanup job releases multiple seats |

### Handling Real-Time Updates

```typescript
interface SeatStatusUpdate {
  eventSeatId: string;
  seatLabel: string;
  oldStatus: SeatStatus;
  newStatus: SeatStatus;
  sectionType: 'seated' | 'standing';
}

function updateSeatStatus(update: SeatStatusUpdate) {
  setSeatMapData(prev => {
    if (!prev) return prev;
    
    // Find and update the seat in the data structure
    const updatedSections = prev.sections.map(section => {
      if (section.type === 'seated' && section.seats) {
        return {
          ...section,
          seats: section.seats.map(seat =>
            seat.eventSeatId === update.eventSeatId
              ? { ...seat, status: update.newStatus }
              : seat
          )
        };
      }
      return section;
    });
    
    return { ...prev, sections: updatedSections };
  });
}
```

---

## State Management Strategy

### Component-Level State (Recommended for MVP)

Use React hooks in `EventSeatMap` component:

```typescript
// Seat map data from API
const [seatMapData, setSeatMapData] = useState<EventSeatMapData | null>(null);

// User's current selection (not yet held)
const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);

// Seats held by current user (after hold API call)
const [heldSeats, setHeldSeats] = useState<HeldSeat[]>([]);

// Hold expiration time
const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);

// Loading states
const [loading, setLoading] = useState(true);
const [holdingSeats, setHoldingSeats] = useState(false);
```

### Future: Redux/Zustand (Optional)

If booking state needs to persist across pages:

```typescript
// store/bookingSlice.ts
interface BookingState {
  currentBooking: {
    eventId: string;
    selectedSeats: SelectedSeat[];
    heldSeats: HeldSeat[];
    holdExpiresAt: Date | null;
    bookingId: string | null;
  } | null;
}
```

---

## Seat Status Color Coding

### Visual States:

| Status | Color | Icon | Meaning |
|--------|-------|------|---------|
| Available | 🟢 Green (`#10b981`) | - | Can be selected |
| Selected (by you) | 🟡 Yellow (`#fbbf24`) | ✓ | In your cart, not held yet |
| Held (by you) | 🟠 Orange (`#f97316`) | 🔒 | Temporarily reserved for you |
| Held (by others) | 🔴 Red (`#ef4444`) | 🔒 | Reserved by another user |
| Confirmed | ⚫ Dark Red (`#991b1b`) | ✓ | Booked and paid |
| Inactive | ⚪ Gray (`#6b7280`) | ✕ | Not available (aisle, obstruction) |
| Accessible | 🔵 Blue outline | ♿ | Wheelchair accessible |

### CSS Classes:

```css
.seat-available { fill: #10b981; cursor: pointer; }
.seat-selected { fill: #fbbf24; stroke: #f59e0b; stroke-width: 2; }
.seat-held-by-you { fill: #f97316; stroke: #ea580c; }
.seat-held-by-others { fill: #ef4444; cursor: not-allowed; }
.seat-confirmed { fill: #991b1b; cursor: not-allowed; }
.seat-inactive { fill: #6b7280; cursor: not-allowed; opacity: 0.5; }
.seat-accessible { stroke: #3b82f6; stroke-width: 2; }
```

---

## Implementation Stages

### Stage 1: Static Event Seat Map (No Backend)
**Goal**: Display seat map for a specific event using mock data

**Tasks**:
1. Create `/events/[eventId]/book` route
2. Create `EventSeatMap` component with mock data
3. Reuse `SeatMapRenderer` to display sections
4. Add "Book Tickets" button to Event Detail page
5. Test navigation flow

**Deliverable**: User can navigate from event detail to seat map page

---

### Stage 2: Seat Selection (Client-Side Only)
**Goal**: Allow users to select seats without API integration

**Tasks**:
1. Implement seat click handler in `EventSeatMap`
2. Create `SeatSelectionPanel` component
3. Manage selected seats state
4. Display selected seats summary
5. Calculate total price
6. Add "Clear All" and "Remove" actions

**Deliverable**: User can select/deselect seats and see summary

---

### Stage 3: API Integration (Seat Hold)
**Goal**: Connect to backend APIs for seat holding

**Tasks**:
1. Integrate with `/api/core/events/{eventId}/seats` (GET)
2. Implement "Hold Seats" button → POST to hold API
3. Create `HoldTimer` component
4. Handle hold success/failure responses
5. Update seat status after hold
6. Implement seat release on timer expiration

**Deliverable**: User can hold seats with 2-minute timer

---

### Stage 4: Real-Time Updates (SignalR)
**Goal**: Show live seat status changes from other users

**Tasks**:
1. Set up SignalR connection in `EventSeatMap`
2. Join event room on mount
3. Listen for `SeatStatusChanged` events
4. Update seat colors in real-time
5. Handle bulk updates from cleanup job
6. Test with multiple browser windows

**Deliverable**: Seat map updates in real-time as others book

---

### Stage 5: Standing Sections
**Goal**: Support standing section booking

**Tasks**:
1. Create `StandingSectionSelector` component
2. Implement quantity selection UI
3. Integrate with standing hold API
4. Display standing capacity in seat map
5. Handle standing section in selection panel

**Deliverable**: User can book standing section slots

---

### Stage 6: Payment Flow
**Goal**: Complete booking after seat hold

**Tasks**:
1. Create `/bookings/[bookingId]/payment` route
2. Create `PaymentForm` component
3. Implement "Proceed to Payment" button
4. Create booking via API
5. Navigate to payment page with booking ID
6. Handle payment success/failure

**Deliverable**: End-to-end booking flow complete

---

## File Structure

```
FRONTEND/arenaops-web/src/
├── app/
│   ├── events/
│   │   ├── [eventId]/
│   │   │   ├── page.tsx                    # Event detail page
│   │   │   └── book/
│   │   │       └── page.tsx                # NEW: Seat selection page
│   ├── bookings/
│   │   └── [bookingId]/
│   │       ├── payment/
│   │       │   └── page.tsx                # NEW: Payment page
│   │       └── confirmation/
│   │           └── page.tsx                # NEW: Confirmation page
│   └── seatmap/
│       └── page.tsx                        # KEEP: Demo page
│
├── components/
│   ├── seat-map/                           # EXISTING
│   │   ├── SeatMapRenderer.tsx
│   │   ├── SeatMapDemo.tsx
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   └── booking/                            # NEW
│       ├── EventSeatMap.tsx                # Smart component
│       ├── SeatSelectionPanel.tsx          # Selection summary
│       ├── HoldTimer.tsx                   # Countdown timer
│       ├── StandingSectionSelector.tsx     # Standing quantity
│       ├── BookingSummary.tsx              # Payment summary
│       └── index.ts
│
├── lib/
│   ├── signalr.ts                          # SignalR connection utility
│   └── api/
│       └── booking.ts                      # Booking API calls
│
└── types/
    └── booking.ts                          # Booking-related types
```

---

## Testing Checklist

### Manual Testing:

- [ ] Navigate from Event Detail → Seat Map
- [ ] Select multiple seats
- [ ] See selected seats in summary panel
- [ ] Remove individual seat from selection
- [ ] Clear all selections
- [ ] Hold seats (API call)
- [ ] See 2-minute countdown timer
- [ ] Timer expires → seats released
- [ ] Open 2 browsers → hold seat in one → see update in other (SignalR)
- [ ] Select standing section quantity
- [ ] Proceed to payment with held seats
- [ ] Handle API errors gracefully

### Edge Cases:

- [ ] Seat already held by another user (show error)
- [ ] Hold expires during payment (redirect back)
- [ ] SignalR connection drops (auto-reconnect)
- [ ] User refreshes page during hold (restore state or release)
- [ ] Standing section at capacity (disable selection)

---

## Key Decisions & Rationale

### 1. Keep `/seatmap` Demo Page
**Why**: Useful for development, testing, and showcasing seat map features without event context

### 2. Component-Level State (Not Redux Initially)
**Why**: Simpler to implement, booking state is page-specific, can migrate to Redux later if needed

### 3. SignalR Connection Per Page
**Why**: Only connect when user is actively viewing seat map, reduces server load

### 4. Separate Routes for Payment/Confirmation
**Why**: Clear separation of concerns, allows users to bookmark/share payment links

### 5. Reuse `SeatMapRenderer` Component
**Why**: Already built and tested, just needs different data source (mock vs API)

---

## Next Steps

1. **Review this spec** with your team
2. **Start with Stage 1** (static seat map with mock data)
3. **Iterate through stages** as backend APIs become available
4. **Test each stage** before moving to the next
5. **Document any deviations** from this spec as you implement

---

## Questions for Backend Team

1. What is the exact API endpoint structure for seat map data?
2. Is SignalR hub already deployed and accessible?
3. What authentication is required for hold/booking APIs?
4. How should we handle hold expiration on the frontend?
5. What is the payment gateway integration approach?

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-20  
**Author**: Frontend Team  
**Status**: Ready for Implementation
