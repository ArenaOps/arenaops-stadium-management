# Stage 1: UI-Driven Navigation Implementation Guide

## ✅ What Was Implemented

Added proper UI-driven navigation to the seat map booking page from the Event Discovery section on the home page.

---

## 📁 Files Modified

```
FRONTEND/arenaops-web/src/components/landing/
└── EventDiscovery.tsx                  ✨ UPDATED (Added navigation)
```

---

## 🎯 What Changed

### Before:
- "Book Tickets" button did nothing
- Could only access `/events/[eventId]/book` by typing URL manually

### After:
- "Book Tickets" button navigates to `/events/[eventId]/book`
- Uses Next.js App Router programmatic navigation
- Each event has a unique `eventId` for routing

---

## 🔧 Implementation Details

### 1. Added "use client" Directive

```typescript
"use client";
```

**Why**: `useRouter` hook requires client-side rendering

---

### 2. Imported useRouter Hook

```typescript
import { useRouter } from "next/navigation"
```

**Why**: Next.js App Router navigation hook (not `next/router`)

---

### 3. Added eventId to Mock Data

```typescript
const mockEvents = [
    {
        id: 1,
        eventId: "championship-final-2026", // NEW: For routing
        title: "Championship Final: Red vs Blue",
        // ... rest of event data
    },
    // ... more events
]
```

**Why**: Each event needs a unique identifier for the route

---

### 4. Created Navigation Handler

```typescript
export function EventDiscovery() {
    const router = useRouter();

    const handleBookTickets = (eventId: string) => {
        router.push(`/events/${eventId}/book`);
    };

    // ... rest of component
}
```

**What it does**:
- Gets router instance from Next.js
- Defines handler function that navigates to booking page
- Uses template literal to construct dynamic route

---

### 5. Connected Button to Handler

```typescript
<Button
    className={cn("w-full h-12 text-sm font-bold uppercase tracking-widest", styles.bookButton)}
    variant="outline"
    onClick={() => handleBookTickets(event.eventId)}
>
    Book Tickets
</Button>
```

**What changed**:
- Added `onClick` prop
- Calls `handleBookTickets` with event's `eventId`
- Arrow function ensures correct event ID is passed

---

## 🧪 How to Test

### Step 1: Start Dev Server

```bash
npm run dev
```

---

### Step 2: Navigate to Home Page

```
http://localhost:3000
```

---

### Step 3: Scroll to Event Discovery Section

You should see 3 event cards:
1. Championship Final: Red vs Blue
2. Global Music Festival 2026
3. National Basketball League

---

### Step 4: Click "Book Tickets" on Any Event

**For Championship Final**:
- Click "Book Tickets"
- URL should change to: `/events/championship-final-2026/book`
- Seat map page should load

**For Music Festival**:
- Click "Book Tickets"
- URL should change to: `/events/music-festival-2026/book`
- Seat map page should load

**For Basketball League**:
- Click "Book Tickets"
- URL should change to: `/events/basketball-league-2026/book`
- Seat map page should load

---

### Step 5: Verify Navigation Works

**✅ What should happen**:
- Smooth client-side navigation (no page reload)
- URL updates in browser address bar
- Seat map page displays with correct event ID
- Browser back button works

**❌ What should NOT happen**:
- Page refresh/reload
- Console errors
- 404 errors
- Broken navigation

---

## 📊 Event ID Mapping

| Event Name | Event ID | Route |
|------------|----------|-------|
| Championship Final | `championship-final-2026` | `/events/championship-final-2026/book` |
| Music Festival | `music-festival-2026` | `/events/music-festival-2026/book` |
| Basketball League | `basketball-league-2026` | `/events/basketball-league-2026/book` |

---

## 🎨 Navigation Flow

```
Home Page (/)
    │
    └── EventDiscovery Component
        │
        ├── Event Card 1
        │   └── [Book Tickets] → /events/championship-final-2026/book
        │
        ├── Event Card 2
        │   └── [Book Tickets] → /events/music-festival-2026/book
        │
        └── Event Card 3
            └── [Book Tickets] → /events/basketball-league-2026/book
```

---

## 🔄 Alternative Navigation Approaches

### Option 1: Using `<Link>` Component (Not Used)

```typescript
import Link from "next/link";

<Link href={`/events/${event.eventId}/book`}>
    <Button>Book Tickets</Button>
</Link>
```

**Pros**: Simpler, better for SEO  
**Cons**: Requires wrapping Button in Link

---

### Option 2: Using `useRouter` (IMPLEMENTED)

```typescript
const router = useRouter();
<Button onClick={() => router.push(`/events/${event.eventId}/book`)}>
    Book Tickets
</Button>
```

**Pros**: More control, can add logic before navigation  
**Cons**: Requires "use client" directive

---

### Option 3: Using `router.push` with Options

```typescript
router.push(`/events/${event.eventId}/book`, { scroll: true });
```

**Options**:
- `scroll`: Scroll to top after navigation
- Can add more options as needed

---

## 🐛 Troubleshooting

### Issue: "useRouter is not a function"
**Solution**: Make sure you're importing from `next/navigation`, not `next/router`

```typescript
// ✅ Correct (App Router)
import { useRouter } from "next/navigation"

// ❌ Wrong (Pages Router)
import { useRouter } from "next/router"
```

---

### Issue: "Cannot use useRouter in Server Component"
**Solution**: Add `"use client"` directive at the top of the file

```typescript
"use client";

import { useRouter } from "next/navigation"
```

---

### Issue: Navigation doesn't work
**Solution**: Check browser console for errors

Common causes:
- Missing `eventId` in mock data
- Typo in route path
- Button not connected to handler

---

### Issue: 404 error after navigation
**Solution**: Verify the booking page exists at:
```
src/app/events/[eventId]/book/page.tsx
```

---

## ✅ Testing Checklist

- [ ] Dev server runs without errors
- [ ] Home page loads correctly
- [ ] Event Discovery section displays 3 events
- [ ] "Book Tickets" buttons are visible
- [ ] Clicking button navigates to booking page
- [ ] URL updates correctly
- [ ] Event ID appears in booking page heading
- [ ] Seat map renders on booking page
- [ ] Browser back button works
- [ ] No console errors
- [ ] Navigation is smooth (no page reload)

---

## 🚀 Next Steps

### Stage 1 Complete When:
1. ✅ Navigation from home page works
2. ✅ Navigation from event detail page works (already implemented)
3. ✅ All event cards navigate correctly
4. ✅ No TypeScript errors
5. ✅ No console errors

### Stage 2 Will Add:
- Seat selection logic
- Selection panel component
- Total price calculation
- "Remove" and "Clear All" buttons

---

## 📝 Code Summary

### Key Changes:

1. **Added "use client"** - Required for useRouter
2. **Imported useRouter** - From next/navigation
3. **Added eventId** - To each mock event
4. **Created handler** - handleBookTickets function
5. **Connected button** - onClick calls handler

### Lines of Code Changed: ~10

### Files Modified: 1

### New Dependencies: 0

---

## 🎓 Learning Points

### Next.js App Router Navigation:

**Client-side navigation**:
```typescript
const router = useRouter();
router.push('/path');
```

**Link component**:
```typescript
<Link href="/path">Click me</Link>
```

**Dynamic routes**:
```typescript
router.push(`/events/${eventId}/book`);
```

**With options**:
```typescript
router.push('/path', { scroll: true });
```

---

## 📚 Related Documentation

- Next.js App Router: https://nextjs.org/docs/app/building-your-application/routing
- useRouter Hook: https://nextjs.org/docs/app/api-reference/functions/use-router
- Dynamic Routes: https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes

---

## ✅ Success Criteria

Stage 1 navigation is complete when:

1. ✅ User can click "Book Tickets" on home page
2. ✅ App navigates to `/events/[eventId]/book`
3. ✅ Event ID is dynamic (different for each event)
4. ✅ Navigation is smooth (client-side)
5. ✅ No console errors
6. ✅ Browser back button works
7. ✅ TypeScript compiles without errors

---

**Navigation Implementation Version**: 1.0  
**Last Updated**: 2026-02-20  
**Status**: ✅ Complete
