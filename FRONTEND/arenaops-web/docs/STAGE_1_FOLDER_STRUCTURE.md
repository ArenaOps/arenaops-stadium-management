# Stage 1: Folder Structure

## 📁 Complete Folder Structure

```
FRONTEND/arenaops-web/
├── src/
│   ├── app/
│   │   ├── events/
│   │   │   └── [eventId]/
│   │   │       ├── page.tsx                    ✨ NEW (Example event detail)
│   │   │       └── book/
│   │   │           └── page.tsx                ✨ NEW (Seat booking page)
│   │   │
│   │   ├── seatmap/
│   │   │   └── page.tsx                        ✅ EXISTING (Demo page)
│   │   │
│   │   └── ... (other routes)
│   │
│   └── components/
│       └── seat-map/
│           ├── SeatMapRenderer.tsx             ✅ EXISTING (Reused)
│           ├── SeatMapDemo.tsx                 ✅ EXISTING
│           ├── types.ts                        ✅ EXISTING
│           ├── seatMap.config.ts               ✅ EXISTING
│           └── index.ts                        ✅ EXISTING
│
└── docs/
    ├── STAGE_1_IMPLEMENTATION.md               ✨ NEW (This guide)
    ├── STAGE_1_FOLDER_STRUCTURE.md             ✨ NEW (Folder structure)
    ├── SEAT_MAP_BOOKING_FLOW_SPEC.md           ✅ EXISTING
    ├── SEAT_MAP_FLOW_DIAGRAM.md                ✅ EXISTING
    ├── SEAT_MAP_IMPLEMENTATION_CHECKLIST.md    ✅ EXISTING
    ├── SEAT_MAP_QUICK_START.md                 ✅ EXISTING
    └── README_SEAT_MAP_DOCS.md                 ✅ EXISTING
```

---

## 🆕 New Files Created (Stage 1)

### 1. `src/app/events/[eventId]/page.tsx`
**Type**: Example Event Detail Page  
**Purpose**: Demonstrates navigation to booking page  
**Status**: Replace with your actual event detail implementation

**Key Features**:
- Displays mock event information
- "Book Tickets" button → navigates to `/events/[eventId]/book`
- "Back to Home" button

---

### 2. `src/app/events/[eventId]/book/page.tsx`
**Type**: Seat Booking Page (Stage 1)  
**Purpose**: Displays static seat map for an event  
**Status**: Core implementation for Stage 1

**Key Features**:
- Extracts `eventId` from URL params
- Displays "Select Your Seats" heading
- Renders `SeatMapRenderer` with mock data
- Shows Stage 1 info box

**Mock Data Included**:
- 6 sections (North, South, East, West, VIP, Stage)
- 4 color schemes (Standard, Premium, VIP, Blocked)
- Responsive layout

---

### 3. `docs/STAGE_1_IMPLEMENTATION.md`
**Type**: Documentation  
**Purpose**: Complete guide for Stage 1 implementation  

**Contents**:
- What was implemented
- Files created
- Mock data structure
- Testing instructions
- Troubleshooting
- Next steps

---

### 4. `docs/STAGE_1_FOLDER_STRUCTURE.md`
**Type**: Documentation  
**Purpose**: Visual folder structure reference (this file)

---

## ✅ Existing Files (Reused)

### `src/components/seat-map/SeatMapRenderer.tsx`
**Status**: No changes needed  
**Usage**: Imported and used in booking page

**Props Used**:
```typescript
<SeatMapRenderer
  config={mockEventSeatMap}
  width="100%"
  height="600px"
  showLabels={true}
/>
```

---

### `src/components/seat-map/types.ts`
**Status**: No changes needed  
**Usage**: Type imports for `SeatMapConfig`

---

### `src/app/seatmap/page.tsx`
**Status**: No changes needed  
**Purpose**: Demo/testing page (keep for development)

---

## 🔄 Route Mapping

```
URL                                    File Path
─────────────────────────────────────────────────────────────────────
/seatmap                               src/app/seatmap/page.tsx
                                       (Demo page - EXISTING)

/events/[eventId]                      src/app/events/[eventId]/page.tsx
                                       (Event detail - NEW)

/events/[eventId]/book                 src/app/events/[eventId]/book/page.tsx
                                       (Seat booking - NEW)
```

### Example URLs:
```
http://localhost:3000/seatmap
http://localhost:3000/events/concert-2026
http://localhost:3000/events/concert-2026/book
http://localhost:3000/events/test-event-123/book
```

---

## 📦 Component Hierarchy

```
EventBookingPage
  └── SeatMapRenderer (reused from /components/seat-map)
      ├── SVG Canvas
      ├── Section Shapes (rect, polygon, circle)
      └── Section Labels
```

**No new components created** - Stage 1 reuses existing `SeatMapRenderer`

---

## 🎨 Data Flow (Stage 1)

```
1. User navigates to /events/[eventId]/book
   │
   ├── Next.js App Router matches route
   │
   └── Loads: src/app/events/[eventId]/book/page.tsx
       │
       ├── Extracts eventId from params
       │
       ├── Uses hardcoded mockEventSeatMap
       │
       └── Passes config to SeatMapRenderer
           │
           └── Renders SVG seat map
```

**No API calls, no state management, no external data sources.**

---

## 🔧 Configuration Files

No configuration changes needed for Stage 1.

**Existing configs used**:
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `next.config.ts` - Next.js configuration

---

## 📝 Code Organization

### Page Component Structure:
```typescript
// 1. Imports
import { useParams } from "next/navigation";
import { SeatMapRenderer } from "@/components/seat-map/SeatMapRenderer";
import type { SeatMapConfig } from "@/components/seat-map/types";

// 2. Mock Data (will be replaced in Stage 3)
const mockEventSeatMap: SeatMapConfig = { ... };

// 3. Page Component
export default function EventBookingPage() {
  // Extract params
  const params = useParams();
  const eventId = params.eventId as string;

  // Render UI
  return (
    <div>
      {/* Header */}
      {/* Seat Map */}
      {/* Info Box */}
    </div>
  );
}
```

**Clean, simple, minimal** - exactly what Stage 1 needs.

---

## 🚀 Next Stage Preview

**Stage 2 will add**:
- `src/components/booking/` directory (new)
- `EventSeatMap.tsx` component (smart component)
- `SeatSelectionPanel.tsx` component
- State management for seat selection
- Click handlers for sections

**Stage 2 will NOT modify**:
- Existing `SeatMapRenderer` component
- Demo page at `/seatmap`
- Route structure

---

## ✅ Verification Checklist

Before moving to Stage 2, verify:

- [ ] File exists: `src/app/events/[eventId]/book/page.tsx`
- [ ] File exists: `src/app/events/[eventId]/page.tsx`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] Dev server runs: `npm run dev`
- [ ] Can navigate to `/events/test-event-123`
- [ ] "Book Tickets" button works
- [ ] Seat map renders at `/events/test-event-123/book`
- [ ] Section labels are visible
- [ ] Dark mode works
- [ ] Responsive on mobile

---

**Folder Structure Version**: 1.0  
**Last Updated**: 2026-02-20  
**Status**: ✅ Complete
