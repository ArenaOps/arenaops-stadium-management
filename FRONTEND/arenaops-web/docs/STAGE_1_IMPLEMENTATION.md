# Stage 1: Static Seat Map Integration - Implementation Guide

## ✅ What Was Implemented

Stage 1 creates a static seat map page at `/events/[eventId]/book` with no interactivity, API calls, or booking logic.

---

## 📁 Files Created

```
FRONTEND/arenaops-web/src/app/events/
└── [eventId]/
    ├── page.tsx                    # Event detail page (example)
    └── book/
        └── page.tsx                # Seat booking page (Stage 1)
```

### 1. `/events/[eventId]/book/page.tsx`
**Purpose**: Displays a static seat map for an event

**What it does**:
- Extracts `eventId` from URL params
- Displays "Select Your Seats" heading
- Renders `SeatMapRenderer` with mock data
- Shows event ID for reference

**What it does NOT do**:
- ❌ No seat selection logic
- ❌ No API calls
- ❌ No real-time updates
- ❌ No booking functionality

### 2. `/events/[eventId]/page.tsx`
**Purpose**: Example event detail page with "Book Tickets" button

**What it does**:
- Shows mock event details
- Provides "Book Tickets" button that navigates to `/events/[eventId]/book`
- Provides "Back to Home" button

**Note**: Replace this with your actual event detail implementation

---

## 🎨 Mock Data Structure

The seat map uses a hardcoded `SeatMapConfig` object:

```typescript
const mockEventSeatMap: SeatMapConfig = {
  id: "event-seat-map-mock",
  name: "Concert Arena",
  viewBox: { x: 0, y: 0, width: 1000, height: 800 },
  sections: [
    {
      type: "rect",
      id: "north-section",
      label: "North Stand",
      x: 350,
      y: 50,
      width: 300,
      height: 100,
      colorKey: "standard",
    },
    // ... more sections
  ],
  colors: {
    standard: { name: "Standard", fill: "#3b82f6", ... },
    premium: { name: "Premium", fill: "#f59e0b", ... },
    vip: { name: "VIP", fill: "#ec4899", ... },
    blocked: { name: "Not Available", fill: "#6b7280", ... },
  },
};
```

### Section Types Included:
- **Rectangular sections**: North, South, East, West stands
- **Polygon section**: VIP area
- **Blocked section**: Stage (non-bookable)

### Color Scheme:
- 🔵 Blue = Standard seats
- 🟠 Orange = Premium seats
- 🟣 Pink = VIP seats
- ⚫ Gray = Blocked/Stage

---

## 🧪 How to Test

### 1. Start the dev server:
```bash
npm run dev
```

### 2. Navigate to an event detail page:
```
http://localhost:3000/events/test-event-123
```

### 3. Click "Book Tickets" button

### 4. You should see:
- ✅ URL changes to `/events/test-event-123/book`
- ✅ "Select Your Seats" heading
- ✅ Event ID displayed
- ✅ Seat map renders with colored sections
- ✅ Section labels visible
- ✅ Stage 1 info box at bottom

### 5. Test with different event IDs:
```
http://localhost:3000/events/concert-2026/book
http://localhost:3000/events/football-match/book
```

The seat map will be the same (mock data), but the event ID will change.

---

## 🔧 How It Works

### Component Reuse:

```
EventBookingPage (new)
    │
    └── SeatMapRenderer (existing)
            │
            ├── Renders SVG sections
            ├── Applies colors from config
            └── Shows section labels
```

### Props Passed to SeatMapRenderer:

```typescript
<SeatMapRenderer
  config={mockEventSeatMap}    // Mock data (hardcoded)
  width="100%"                  // Responsive width
  height="600px"                // Fixed height
  showLabels={true}             // Show section names
/>
```

### Data Flow (Stage 1):

```
1. User navigates to /events/[eventId]/book
2. Page component loads
3. Mock data (mockEventSeatMap) is used
4. SeatMapRenderer receives config
5. SVG seat map renders
```

**No API calls, no state management, no interactivity.**

---

## 📝 Customizing Mock Data

To change the seat map layout, edit the `mockEventSeatMap` object in `page.tsx`:

### Add a new section:
```typescript
{
  type: "rect",
  id: "balcony-section",
  label: "Balcony",
  x: 300,
  y: 100,
  width: 400,
  height: 80,
  colorKey: "premium",
}
```

### Change colors:
```typescript
colors: {
  standard: {
    name: "Standard",
    fill: "#10b981",  // Change to green
    stroke: "#047857",
    opacity: 0.85,
  },
}
```

### Change stadium name:
```typescript
name: "My Custom Arena",
```

---

## 🚀 Next Steps (Stage 2)

After Stage 1 is complete and tested, Stage 2 will add:

1. **Seat selection logic**:
   - Click section to select
   - Highlight selected sections
   - Track selected seats in state

2. **Selection panel**:
   - Show selected seats list
   - Display total price
   - "Remove" and "Clear All" buttons

3. **UI improvements**:
   - Hover effects
   - Color changes on selection
   - Empty state when no seats selected

**See**: `docs/SEAT_MAP_IMPLEMENTATION_CHECKLIST.md` for Stage 2 tasks

---

## 🐛 Troubleshooting

### Issue: Page not found (404)
**Solution**: Make sure you created the file at the correct path:
```
src/app/events/[eventId]/book/page.tsx
```

### Issue: Seat map not rendering
**Solution**: 
1. Check browser console for errors
2. Verify `SeatMapRenderer` import path
3. Ensure `mockEventSeatMap` is defined correctly

### Issue: TypeScript errors
**Solution**:
1. Make sure types are imported: `import type { SeatMapConfig } from "@/components/seat-map/types"`
2. Run `npm run type-check` to see all errors

### Issue: Styling looks broken
**Solution**:
1. Ensure Tailwind CSS is configured
2. Check that dark mode classes are working
3. Verify container classes are applied

---

## ✅ Stage 1 Checklist

- [x] Created `/events/[eventId]/book/page.tsx`
- [x] Created `/events/[eventId]/page.tsx` (example)
- [x] Reused `SeatMapRenderer` component
- [x] Added mock seat map data
- [x] Displayed "Select Your Seats" heading
- [x] Showed event ID from URL params
- [x] Tested navigation from event detail to booking page
- [x] Verified seat map renders correctly

---

## 📊 Stage 1 Summary

**What works**:
- ✅ Route `/events/[eventId]/book` exists
- ✅ Seat map displays with mock data
- ✅ Navigation from event detail works
- ✅ Responsive layout
- ✅ Dark mode support

**What doesn't work yet** (by design):
- ❌ Clicking sections does nothing
- ❌ No seat selection
- ❌ No API integration
- ❌ No booking logic
- ❌ No payment flow

**This is expected for Stage 1!**

---

## 🎯 Success Criteria

Stage 1 is complete when:

1. ✅ User can navigate to `/events/[eventId]/book`
2. ✅ Seat map renders with colored sections
3. ✅ Section labels are visible
4. ✅ Page is responsive (mobile, tablet, desktop)
5. ✅ No console errors
6. ✅ Dark mode works

**Time to complete**: 1-2 hours

**Next**: Move to Stage 2 (Seat Selection Logic)

---

**Stage 1 Version**: 1.0  
**Last Updated**: 2026-02-20  
**Status**: ✅ Complete
