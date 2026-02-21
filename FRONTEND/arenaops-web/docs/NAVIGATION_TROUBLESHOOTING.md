# Navigation Troubleshooting Guide

## Issue: "Book Tickets" Button Not Working

If the "Book Tickets" button doesn't trigger navigation, follow these debugging steps:

---

## Step 1: Check Browser Console

1. Open browser DevTools (F12 or Right-click → Inspect)
2. Go to Console tab
3. Click "Book Tickets" button
4. Look for console logs

### ✅ Expected Output:
```
🎫 Book Tickets clicked!
Event ID: championship-final-2026
Navigating to: /events/championship-final-2026/book
```

### ❌ If you see nothing:
- The onClick handler is not being called
- Proceed to Step 2

### ❌ If you see errors:
- Read the error message
- Common errors and solutions below

---

## Step 2: Verify File Was Updated

Check that `EventDiscovery.tsx` has these changes:

### 1. "use client" directive at the top:
```typescript
"use client";
```

### 2. useRouter import:
```typescript
import { useRouter } from "next/navigation"
```

### 3. eventId in mock data:
```typescript
const mockEvents = [
    {
        id: 1,
        eventId: "championship-final-2026", // ← This should exist
        title: "Championship Final: Red vs Blue",
        // ...
    }
]
```

### 4. Router and handler in component:
```typescript
export function EventDiscovery() {
    const router = useRouter();

    const handleBookTickets = (eventId: string) => {
        console.log('🎫 Book Tickets clicked!');
        router.push(`/events/${eventId}/book`);
    };
    // ...
}
```

### 5. Button onClick:
```typescript
<Button
    type="button"
    onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleBookTickets(event.eventId);
    }}
>
    Book Tickets
</Button>
```

---

## Step 3: Restart Dev Server

Sometimes Next.js needs a restart to pick up changes:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

Wait for "✓ Ready" message, then test again.

---

## Step 4: Clear Browser Cache

1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or use Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

---

## Step 5: Check for CSS Issues

The button might be covered by another element.

### Test with inline style:
Temporarily add to the Button:
```typescript
<Button
    style={{ position: 'relative', zIndex: 9999 }}
    onClick={...}
>
```

If this works, there's a CSS z-index issue.

---

## Step 6: Test with Simple Alert

Replace the handler temporarily:

```typescript
const handleBookTickets = (eventId: string) => {
    alert(`Clicked: ${eventId}`);
};
```

### If alert shows:
- Router is the problem
- Check Next.js version
- Check if router is properly imported

### If alert doesn't show:
- onClick is not being called
- Check for event.stopPropagation() elsewhere
- Check for CSS pointer-events

---

## Step 7: Check Next.js Version

```bash
npm list next
```

Should be version 13+ for App Router.

If using Pages Router (version 12 or older):
```typescript
// Wrong for App Router
import { useRouter } from "next/router"

// Correct for App Router
import { useRouter } from "next/navigation"
```

---

## Common Errors & Solutions

### Error: "useRouter is not a function"

**Cause**: Wrong import

**Solution**:
```typescript
// ✅ Correct (App Router)
import { useRouter } from "next/navigation"

// ❌ Wrong (Pages Router)
import { useRouter } from "next/router"
```

---

### Error: "Cannot use useRouter in Server Component"

**Cause**: Missing "use client" directive

**Solution**: Add at the top of the file:
```typescript
"use client";
```

---

### Error: "event.eventId is undefined"

**Cause**: Mock data doesn't have eventId field

**Solution**: Add eventId to each event:
```typescript
{
    id: 1,
    eventId: "championship-final-2026", // Add this
    title: "...",
}
```

---

### Button clicks but nothing happens

**Possible causes**:

1. **Router not initialized**
   ```typescript
   // Check this line exists:
   const router = useRouter();
   ```

2. **Handler not called**
   ```typescript
   // Check onClick is connected:
   onClick={() => handleBookTickets(event.eventId)}
   ```

3. **Route doesn't exist**
   - Verify `/events/[eventId]/book/page.tsx` exists
   - Check file path is correct

---

## Step 8: Alternative Approach - Use Link

If useRouter still doesn't work, try using Link component:

```typescript
import Link from "next/link";

// In the component:
<Link href={`/events/${event.eventId}/book`}>
    <Button
        type="button"
        className={cn("w-full h-12 text-sm font-bold uppercase tracking-widest", styles.bookButton)}
        variant="outline"
    >
        Book Tickets
    </Button>
</Link>
```

---

## Step 9: Check for Form Wrapper

If the Button is inside a `<form>`, it might be submitting:

**Solution**: Add `type="button"` to prevent form submission:
```typescript
<Button type="button" onClick={...}>
```

---

## Step 10: Inspect Element

1. Right-click the "Book Tickets" button
2. Select "Inspect"
3. Check the HTML:

### ✅ Should see:
```html
<button type="button" class="..." onclick="...">
    Book Tickets
</button>
```

### ❌ If onclick is missing:
- The onClick prop is not being passed
- Check Button component implementation

---

## Step 11: Test with Direct Navigation

Add a test button outside the Card:

```typescript
<Button onClick={() => router.push('/events/test-event/book')}>
    Test Navigation
</Button>
```

### If this works:
- Router is fine
- Problem is with the event card button

### If this doesn't work:
- Router itself is broken
- Check Next.js installation

---

## Step 12: Check Network Tab

1. Open DevTools → Network tab
2. Click "Book Tickets"
3. Look for navigation request

### ✅ Should see:
- Request to `/events/[eventId]/book`
- Status 200 or 304

### ❌ If no request:
- Navigation is not being triggered
- onClick is not working

---

## Step 13: Verify Page Exists

Manually navigate to:
```
http://localhost:3000/events/championship-final-2026/book
```

### ✅ If page loads:
- Route exists
- Problem is with navigation trigger

### ❌ If 404 error:
- Page doesn't exist
- Check file path: `src/app/events/[eventId]/book/page.tsx`

---

## Step 14: Check for JavaScript Errors

Look for errors in Console that might be breaking JavaScript:

Common issues:
- Syntax errors
- Import errors
- Missing dependencies

---

## Step 15: Minimal Test Component

Create a minimal test to isolate the issue:

```typescript
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function TestNavigation() {
    const router = useRouter();
    
    return (
        <Button onClick={() => {
            console.log('Test button clicked');
            router.push('/events/test-event/book');
        }}>
            Test Navigation
        </Button>
    );
}
```

Add this to your page and test.

---

## Still Not Working?

### Provide these details:

1. **Console output** when clicking button
2. **Next.js version**: `npm list next`
3. **Node version**: `node --version`
4. **Browser**: Chrome, Firefox, Safari, etc.
5. **Any error messages**
6. **Does the test button work?** (Step 15)

---

## Quick Fixes Checklist

- [ ] Added "use client" directive
- [ ] Imported from "next/navigation" (not "next/router")
- [ ] Added eventId to mock data
- [ ] Created router instance: `const router = useRouter()`
- [ ] Created handler function
- [ ] Connected onClick to button
- [ ] Restarted dev server
- [ ] Cleared browser cache
- [ ] Checked console for errors
- [ ] Verified page exists at target route

---

**Troubleshooting Version**: 1.0  
**Last Updated**: 2026-02-20
