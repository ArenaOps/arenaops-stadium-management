# UX Infrastructure Components Guide

This document provides comprehensive usage examples for the core UX infrastructure components: **Loading States**, **Error Boundaries**, and **Toast Notifications**.

---

## 1. Loading State Templates

### Overview

Loading state components provide visual feedback during data fetching, transitions, and async operations. They range from full-page loaders to granular skeleton placeholders.

### Available Components

#### `Spinner`

A simple rotating spinner in various sizes.

```tsx
import { Spinner } from "@/components/ui";

export function MyComponent() {
    return (
        <div>
            <Spinner size="sm" />
            <Spinner size="md" /> {/* default */}
            <Spinner size="lg" />
            <Spinner size="xl" />
            
            {/* Custom styling */}
            <Spinner className="text-green-500" />
        </div>
    );
}
```

**Props:**
- `size?: "sm" | "md" | "lg" | "xl"` – Spinner dimensions (default: "md")
- `className?: string` – Additional Tailwind classes

---

#### `PageLoader`

Full-page overlay loader for initial page loads or critical operations.

```tsx
import { PageLoader } from "@/components/ui";

export function MyPage() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate data fetch
        setTimeout(() => setIsLoading(false), 2000);
    }, []);

    if (isLoading) {
        return <PageLoader message="Loading arena data…" />;
    }

    return <div>Your content here</div>;
}
```

**Props:**
- `message?: string` – Loading message (default: "Loading…")

**Accessibility:**
- Uses `role="status"` and `aria-live="polite"` for screen readers

---

#### `SectionLoader`

Inline loader for specific sections (cards, tables, etc.).

```tsx
import { SectionLoader } from "@/components/ui";

export function EventList() {
    const [isLoading, setIsLoading] = useState(true);

    if (isLoading) {
        return <SectionLoader message="Fetching events…" />;
    }

    return (
        <div>
            {/* Your list content */}
        </div>
    );
}
```

**Props:**
- `message?: string` – Loading message
- `className?: string` – Container classes

---

#### `Skeleton` Family

Pre-built skeleton placeholder components for different content types.

##### Base Skeleton Block

```tsx
import { Skeleton } from "@/components/ui";

export function CustomSkeleton() {
    return (
        <div>
            <Skeleton className="h-12 w-full rounded mb-3" />
            <Skeleton className="h-6 w-3/4" />
        </div>
    );
}
```

##### `SkeletonCard`

Card-shaped skeleton with header, body, and footer.

```tsx
import { SkeletonCard } from "@/components/ui";

export function EventCardSkeleton() {
    return <SkeletonCard />;
}
```

Expected output:
- Circular avatar placeholder
- Title and subtitle lines
- Large image area
- Footer buttons area

##### `SkeletonTable`

Table structure skeleton.

```tsx
import { SkeletonTable } from "@/components/ui";

export function TableSkeleton() {
    return (
        <div>
            <h2>Loading events…</h2>
            <SkeletonTable rows={5} columns={4} />
        </div>
    );
}
```

**Props:**
- `rows?: number` – Number of table rows (default: 5)
- `columns?: number` – Number of columns (default: 4)

##### `SkeletonStatCard`

Statistics card skeleton.

```tsx
import { SkeletonStatCard } from "@/components/ui";

export function StatsSkeleton() {
    return (
        <div className="grid grid-cols-3 gap-4">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
        </div>
    );
}
```

##### `SkeletonListItem`

Single list item skeleton.

```tsx
import { SkeletonListItem } from "@/components/ui";

export function ListSkeleton() {
    return (
        <div>
            {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonListItem key={i} />
            ))}
        </div>
    );
}
```

---

## 2. Error Boundary Components

### Overview

Error boundaries gracefully catch runtime errors and provide user-friendly fallback UI instead of breaking the entire component tree.

### `ErrorBoundary`

Wrap components that might throw errors.

```tsx
import { ErrorBoundary } from "@/components/ui";

export function App() {
    return (
        <ErrorBoundary
            onError={(error, info) => {
                console.error("Caught error:", error);
                console.error("Error info:", info);
                // Send to logging service (e.g., Sentry)
            }}
        >
            <YourComponent />
        </ErrorBoundary>
    );
}
```

**Props:**
- `children: React.ReactNode` – Component tree to protect
- `fallback?: React.ReactNode` – Custom fallback UI (optional)
- `onError?: (error: Error, info: ErrorInfo) => void` – Error logging hook
- `errorTitle?: string` – Custom error heading

### Custom Fallback UI

```tsx
<ErrorBoundary
    fallback={
        <div className="text-center p-8">
            <h2 className="text-xl font-bold mb-2">Oops!</h2>
            <p>Something went wrong. Please refresh the page.</p>
        </div>
    }
>
    <YourComponent />
</ErrorBoundary>
```

### Error Boundary HOC

Wrap existing components without modifying their code.

```tsx
import { withErrorBoundary } from "@/components/ui";

function MyComponent() {
    return <div>Component content</div>;
}

// Wrap the component
export default withErrorBoundary(MyComponent, {
    onError: (error) => {
        console.error("MyComponent error:", error);
    },
    errorTitle: "Display Error",
});
```

### `ErrorFallback`

Standalone fallback UI component (used internally by ErrorBoundary).

```tsx
import { ErrorFallback } from "@/components/ui";

export function CustomErrorPage() {
    return (
        <ErrorFallback
            error={new Error("Data fetch failed")}
            resetErrorBoundary={() => window.location.reload()}
            title="Unable to Load Events"
            description="The events data could not be fetched. Try refreshing the page."
        />
    );
}
```

**Props:**
- `error?: Error` – Error object to display (dev-only)
- `resetErrorBoundary?: () => void` – Callback for "Try again" button
- `title?: string` – Error heading
- `description?: string` – Error description

---

## 3. Toast Notification System

### Overview

Global toast system for non-blocking notifications (success, error, info, warning). Toasts auto-dismiss and are fully accessible.

### Setup

1. **Wrap your app with ToastProvider** (in root layout):

```tsx
import { ToastProvider } from "@/components/ui";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <ToastProvider>
                    {children}
                </ToastProvider>
            </body>
        </html>
    );
}
```

2. **Add ToastContainer** (in root layout or page):

```tsx
import { ToastContainer } from "@/components/ui";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <ToastProvider>
                    {children}
                    <ToastContainer />
                </ToastProvider>
            </body>
        </html>
    );
}
```

### Using `useToast` Hook

```tsx
import { useToast } from "@/components/ui";

export function EventForm() {
    const { addToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/events", { method: "POST" });
            if (response.ok) {
                addToast(
                    "Event created successfully!",
                    "success",
                    { title: "Success" }
                );
            }
        } catch (error) {
            addToast(
                "Failed to create event. Try again.",
                "error",
                { title: "Error" }
            );
        }
    };

    return <form onSubmit={handleSubmit}>...</form>;
}
```

**`addToast` signature:**

```typescript
addToast(
    message: string,
    type?: "success" | "error" | "info" | "warning",
    options?: {
        title?: string;
        duration?: number; // ms (0 = no auto-dismiss, default 4000)
    }
): string // returns toast ID
```

### Using Convenience Hooks

`useToastActions` provides typed shortcuts:

```tsx
import { useToastActions } from "@/components/ui";

export function EventForm() {
    const { success, error, info, warning } = useToastActions();

    const handleClick = async () => {
        try {
            await fetchData();
            success("Data loaded!", "Success");
        } catch (err) {
            error("Failed to load data", "Error", 5000);
        }
    };

    return <button onClick={handleClick}>Load Data</button>;
}
```

### Toast Types

All toasts support color-coded themes:

- **Success** (green): Confirmation of successful actions
- **Error** (red): Error messages and failures
- **Info** (blue): Informational messages
- **Warning** (amber): Warnings and cautions

### Examples

#### Success Toast

```tsx
const { success } = useToastActions();
success("Ticket booked successfully!", "Booking Complete", 4000);
```

#### Error Toast

```tsx
const { error } = useToastActions();
error(
    "Unable to process payment. Check your card details.",
    "Payment Failed",
    5000
);
```

#### Info Toast

```tsx
const { info } = useToastActions();
info("New events are available near you", "Heads Up");
```

#### Warning Toast

```tsx
const { warning } = useToastActions();
warning("Your session will expire in 5 minutes", "Session Warning", 0); // No auto-dismiss
```

#### Persistent Toast (No Auto-Dismiss)

```tsx
const { addToast } = useToast();

addToast(
    "Click to dismiss",
    "info",
    { duration: 0 } // No auto-dismiss
);
```

---

## 4. Integration Best Practices

### Loading + Skeleton Pattern

```tsx
import { useQuery } from "@tanstack/react-query";
import { SkeletonCard, SectionLoader } from "@/components/ui";

export function EventsList() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["events"],
        queryFn: fetchEvents,
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        );
    }

    if (error) return <SectionLoader message="Failed to load events" />;

    return <div>{/* Render events */}</div>;
}
```

### Error Boundary + Form

```tsx
import { ErrorBoundary, useToastActions } from "@/components/ui";

function EventFormInner() {
    const { error } = useToastActions();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Submit form
        } catch (err) {
            error("Form submission failed");
            throw err; // Re-throw for boundary
        }
    };

    return <form onSubmit={handleSubmit}>...</form>;
}

export function EventForm() {
    return (
        <ErrorBoundary errorTitle="Form Error">
            <EventFormInner />
        </ErrorBoundary>
    );
}
```

### Combined Example

```tsx
"use client";

import {
    ErrorBoundary,
    PageLoader,
    SkeletonTable,
    useToastActions,
} from "@/components/ui";
import { useQuery } from "@tanstack/react-query";

function EventsTableInner() {
    const { data: events, isLoading } = useQuery({
        queryKey: ["events"],
        queryFn: async () => {
            const res = await fetch("/api/events");
            if (!res.ok) throw new Error("Failed to fetch");
            return res.json();
        },
    });

    const { success } = useToastActions();

    if (isLoading) {
        return <SkeletonTable rows={10} columns={5} />;
    }

    return (
        <table>
            <tbody>
                {events.map((event) => (
                    <tr key={event.id}>
                        <td>{event.name}</td>
                        <td>{event.date}</td>
                        {/* ... */}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export function EventsPage() {
    return (
        <ErrorBoundary>
            <div className="space-y-4">
                <h1>Events</h1>
                <EventsTableInner />
            </div>
        </ErrorBoundary>
    );
}
```

---

## 5. Accessibility

All components follow WCAG guidelines:

- **Spinners**: `role="status"`, `aria-label="Loading"`
- **Error Boundaries**: `role="alert"`, error details in dev mode
- **Toasts**: `role="alert"`, `aria-live="polite"`, `aria-atomic="true"`
- **Skeletons**: Announce as placeholders via semantic HTML

---

## 6. Styling & Customization

All components use Tailwind CSS and support custom classes:

```tsx
<Spinner className="text-blue-500" />
<SectionLoader className="bg-gray-100" />
<Skeleton className="rounded-full" />
```

Dark mode is supported via Tailwind's `dark:` prefix:

```tsx
{/* Toast colors adapt to dark mode automatically */}
<ToastContainer />
```

---

## 7. Exports

Import all components from `@/components/ui`:

```tsx
// Components
import {
    Spinner,
    PageLoader,
    SectionLoader,
    Skeleton,
    SkeletonCard,
    SkeletonTable,
    SkeletonStatCard,
    SkeletonListItem,
    ErrorBoundary,
    withErrorBoundary,
    ErrorFallback,
    ToastProvider,
    ToastContainer,
} from "@/components/ui";

// Hooks
import { useToast, useToastActions } from "@/components/ui";

// Types
import type { Toast, ToastType, ToastContextValue } from "@/components/ui";
```

---

## Next Steps

- Integrate with API error handling
- Add Sentry or similar for error logging
- Extend toast system with custom toast components
- Add loading state management (Redux/Zustand)
