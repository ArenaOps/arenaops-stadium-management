# Seat Map Booking Flow - Implementation Checklist

## Overview
Use this checklist to track your progress implementing the seat map booking flow. Check off items as you complete them.

---

## Stage 1: Static Event Seat Map (No Backend)

### Routes & Pages
- [ ] Create `/events/[eventId]/book/page.tsx`
- [ ] Add "Book Tickets" button to Event Detail page (`/events/[eventId]/page.tsx`)
- [ ] Test navigation from Event Detail → Seat Selection

### Components
- [ ] Create `EventSeatMap.tsx` component skeleton
- [ ] Import and render `SeatMapRenderer` inside `EventSeatMap`
- [ ] Create mock `EventSeatMapData` for testing
- [ ] Verify seat map renders with mock data

### Styling
- [ ] Add responsive layout for seat map page
- [ ] Test on mobile, tablet, desktop breakpoints

**Stage 1 Complete**: ✅ User can navigate to seat map page and see static layout

---

## Stage 2: Seat Selection (Client-Side Only)

### Seat Selection Logic
- [ ] Add `selectedSeats` state to `EventSeatMap`
- [ ] Implement `handleSeatClick` function
- [ ] Pass `selectedSeats` to `SeatMapRenderer` as prop
- [ ] Update `SeatMapRenderer` to highlight selected seats (yellow)
- [ ] Test: Click seat → turns yellow, click again → turns green

### Selection Panel Component
- [ ] Create `SeatSelectionPanel.tsx`
- [ ] Display list of selected seats
- [ ] Calculate and display total price
- [ ] Add "Remove" button for each seat
- [ ] Add "Clear All" button
- [ ] Test: Remove seat → updates list and total

### UI Polish
- [ ] Add seat hover effects
- [ ] Add transition animations for seat color changes
- [ ] Show empty state when no seats selected
- [ ] Disable "Hold Seats" button when no seats selected

**Stage 2 Complete**: ✅ User can select/deselect seats and see summary

---

## Stage 3: API Integration (Seat Hold)

### API Setup
- [ ] Create `lib/api/booking.ts` with API functions
- [ ] Implement `fetchEventSeatMap(eventId)` function
- [ ] Implement `holdSeat(eventId, seatId)` function
- [ ] Implement `releaseSeat(eventId, seatId)` function
- [ ] Add error handling and TypeScript types

### Data Fetching
- [ ] Replace mock data with API call in `EventSeatMap`
- [ ] Add loading state while fetching seat map
- [ ] Add error state if API call fails
- [ ] Display loading spinner or skeleton

### Seat Hold Flow
- [ ] Implement "Hold Seats" button click handler
- [ ] Call `holdSeat` API for each selected seat
- [ ] Handle hold success: update `heldSeats` state
- [ ] Handle hold failure: show error toast
- [ ] Update seat colors after hold (orange for held by you)

### Hold Timer Component
- [ ] Create `HoldTimer.tsx` component
- [ ] Display countdown in MM:SS format
- [ ] Add visual warning when < 30 seconds remaining
- [ ] Implement `onExpired` callback
- [ ] Auto-release seats when timer expires
- [ ] Test: Hold seats → see timer → wait for expiration

### Error Handling
- [ ] Handle "Seat already held" error (409)
- [ ] Handle network errors (timeout, 500)
- [ ] Show user-friendly error messages
- [ ] Add retry mechanism for failed holds

**Stage 3 Complete**: ✅ User can hold seats with 2-minute timer

---

## Stage 4: Real-Time Updates (SignalR)

### SignalR Setup
- [ ] Create `lib/signalr.ts` utility
- [ ] Install SignalR client package: `npm install @microsoft/signalr`
- [ ] Configure SignalR connection to `/hubs/seat-status`
- [ ] Add auto-reconnect logic

### Connection Management
- [ ] Connect to SignalR when `EventSeatMap` mounts
- [ ] Invoke `JoinEventRoom(eventId)` after connection
- [ ] Invoke `LeaveEventRoom(eventId)` before unmount
- [ ] Handle connection errors gracefully

### Event Listeners
- [ ] Listen for `SeatStatusChanged` event
- [ ] Implement `updateSeatStatus` function
- [ ] Update seat colors in real-time
- [ ] Listen for `BulkSeatStatusChanged` event
- [ ] Handle bulk updates efficiently

### Testing
- [ ] Open 2 browser windows
- [ ] Hold seat in Window A
- [ ] Verify seat turns red in Window B (real-time)
- [ ] Release seat in Window A
- [ ] Verify seat turns green in Window B
- [ ] Test with multiple users simultaneously

**Stage 4 Complete**: ✅ Seat map updates in real-time

---

## Stage 5: Standing Sections

### Standing Section Component
- [ ] Create `StandingSectionSelector.tsx`
- [ ] Add quantity input (1 to availableCapacity)
- [ ] Display price per slot
- [ ] Calculate total price for quantity
- [ ] Add validation (max = availableCapacity)

### Integration
- [ ] Detect standing sections in `EventSeatMap`
- [ ] Render `StandingSectionSelector` for standing sections
- [ ] Implement `holdStandingSlots(sectionId, quantity)` API call
- [ ] Add standing slots to `selectedSeats` state
- [ ] Display standing slots in `SeatSelectionPanel`

### Visual Representation
- [ ] Show standing section as capacity block in SVG
- [ ] Display available capacity count
- [ ] Update capacity in real-time via SignalR

**Stage 5 Complete**: ✅ User can book standing section slots

---

## Stage 6: Payment Flow

### Booking Creation
- [ ] Create `/bookings/[bookingId]/payment/page.tsx`
- [ ] Implement "Proceed to Payment" button
- [ ] Call `createBooking` API with held seats
- [ ] Navigate to payment page with `bookingId`
- [ ] Pass booking data via URL params or state

### Payment Page
- [ ] Create `BookingSummary.tsx` component
- [ ] Display event details, seats, total price
- [ ] Create `PaymentForm.tsx` component (or integrate gateway)
- [ ] Implement payment initiation
- [ ] Handle payment success/failure

### Confirmation Page
- [ ] Create `/bookings/[bookingId]/confirmation/page.tsx`
- [ ] Display booking confirmation message
- [ ] Show digital ticket view
- [ ] Display booking ID and seat details
- [ ] Add "Download Ticket" button (optional)

### Error Handling
- [ ] Handle hold expiration during payment
- [ ] Redirect to seat map if hold expires
- [ ] Show appropriate error messages
- [ ] Implement payment retry logic

**Stage 6 Complete**: ✅ End-to-end booking flow works

---

## Polish & Testing

### UI/UX Polish
- [ ] Add loading states for all API calls
- [ ] Add success/error toast notifications
- [ ] Improve seat hover effects
- [ ] Add smooth transitions for seat color changes
- [ ] Optimize SVG rendering for large stadiums
- [ ] Add accessibility labels (ARIA)

### Responsive Design
- [ ] Test on mobile devices
- [ ] Test on tablets
- [ ] Test on desktop (various screen sizes)
- [ ] Adjust layout for small screens
- [ ] Make selection panel sticky on mobile

### Error Scenarios
- [ ] Test with slow network (throttle)
- [ ] Test with network disconnection
- [ ] Test SignalR reconnection
- [ ] Test hold expiration edge cases
- [ ] Test concurrent booking attempts

### Performance
- [ ] Optimize seat map rendering (500+ seats)
- [ ] Implement virtualization if needed
- [ ] Minimize re-renders
- [ ] Add React.memo where appropriate
- [ ] Run Lighthouse audit (target > 90)

### Browser Testing
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge
- [ ] Test on mobile browsers

---

## Documentation

- [ ] Update README with seat map booking flow
- [ ] Document API endpoints used
- [ ] Document SignalR events
- [ ] Add code comments for complex logic
- [ ] Create user guide (optional)

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] API endpoints point to correct backend
- [ ] SignalR hub URL configured
- [ ] Error logging set up
- [ ] Analytics tracking added (optional)
- [ ] Build succeeds without errors
- [ ] All tests pass

---

## Success Criteria

- ✅ User can navigate from Event Detail to Seat Map
- ✅ User can select multiple seats
- ✅ User can hold seats with 2-minute timer
- ✅ Seat map updates in real-time (SignalR)
- ✅ User can book standing section slots
- ✅ User can complete payment and see confirmation
- ✅ All error scenarios handled gracefully
- ✅ Responsive design works on all devices
- ✅ Performance is acceptable (Lighthouse > 90)

---

## Notes & Issues

Use this section to track blockers, questions, or deviations from the spec:

```
Date       | Issue                          | Resolution
-----------|--------------------------------|---------------------------
2026-02-20 | Example: API endpoint changed  | Updated to new endpoint
           |                                |
           |                                |
```

---

**Checklist Version**: 1.0  
**Last Updated**: 2026-02-20  
**Status**: Ready to Use
