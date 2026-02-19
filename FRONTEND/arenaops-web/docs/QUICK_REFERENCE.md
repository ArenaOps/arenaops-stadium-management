# UX Components Quick Reference

## 🏃 5-Minute Setup

### Step 1: Wrap App
```tsx
import { ErrorBoundary, ToastProvider, ToastContainer } from "@/components/ui";

export default function RootLayout({ children }) {
    return (
        <ErrorBoundary>
            <ToastProvider>
                {children}
                <ToastContainer />
            </ToastProvider>
        </ErrorBoundary>
    );
}
```

### Step 2: Use in Component
```tsx
import { useToastActions } from "@/components/ui";

export function MyComponent() {
    const { success, error } = useToastActions();
    
    success("Done!");
    error("Failed");
}
```

---

## 📚 Component Cheat Sheet

### Loading States

| Component | Purpose | Use Case |
|-----------|---------|----------|
| `<Spinner />` | Simple spinner | Generic loading |
| `<PageLoader message="..." />` | Full page overlay | Initial load |
| `<SectionLoader message="..." />` | Inline loader | Section loading |
| `<SkeletonCard />` | Card template | Loading cards |
| `<SkeletonTable rows={5} columns={4} />` | Table template | Loading tables |

### Error Handling

| Component | Purpose |
|-----------|---------|
| `<ErrorBoundary>...</ErrorBoundary>` | Catch errors |
| `<ErrorFallback error={err} resetErrorBoundary={reset} />` | Error UI |
| `withErrorBoundary(Component)` | Wrap component |

### Toast Notifications

```tsx
const { success, error, info, warning } = useToastActions();

success("Booked!", "Success");        // Green
error("Failed", "Error");             // Red
info("Heads up!", "Info");            // Blue
warning("Caution!", "Warning", 0);    // Amber (no auto-dismiss)
```

---

## 🎨 Toast Types

```tsx
// Type defaults to "info"
addToast(message, type, options);

// Types: "success" | "error" | "info" | "warning"

// Options
{
    title?: string;           // Optional title
    duration?: number;        // ms (default 4000, 0 = no auto-dismiss)
}
```

---

## 📱 Import Everything

```tsx
import {
    // Loading
    Spinner, PageLoader, SectionLoader,
    Skeleton, SkeletonCard, SkeletonTable, SkeletonStatCard, SkeletonListItem,
    
    // Error
    ErrorBoundary, withErrorBoundary, ErrorFallback,
    
    // Toast
    ToastProvider, ToastContainer,
    useToast, useToastActions,
    
    // Types
    type Toast, type ToastType, type ToastContextValue,
} from "@/components/ui";
```

---

## 💡 Common Patterns

### Loading with Query
```tsx
const { data, isLoading } = useQuery(...);
if (isLoading) return <SkeletonCard />;
return <div>{data}</div>;
```

### Form with Toast
```tsx
const { success, error } = useToastActions();
try {
    await submit();
    success("Saved!");
} catch {
    error("Failed to save");
}
```

### Error Boundary
```tsx
<ErrorBoundary onError={console.error}>
    <MyComponent />
</ErrorBoundary>
```

### Full Page Load
```tsx
if (isLoading) return <PageLoader message="Loading..." />;
```

---

## 🔗 Links

- [Full Guide](./UX_COMPONENTS_GUIDE.md)
- [Usage Examples](./EXAMPLE_USAGE_PATTERNS.tsx)
- [Root Layout Example](./EXAMPLE_ROOT_LAYOUT.tsx)
- [Implementation Checklist](./ARENA-32_COMPLETION.md)

---

## ⚡ Pro Tips

1. **Toast duration:** Use `duration: 0` for important messages that shouldn't auto-dismiss
2. **Error logging:** Pass `onError` to ErrorBoundary to send to Sentry, LogRocket, etc.
3. **Skeleton loading:** Use specific skeleton templates matching your UI shapes
4. **Accessibility:** All components are WCAG compliant - no extra work needed
5. **Dark mode:** Automatic - toasts adapt colors via Tailwind dark mode

---

## ✨ Ready to Use

All components are:
- ✅ Production-ready
- ✅ Type-safe
- ✅ Accessible
- ✅ Documented
- ✅ Zero dependencies (besides React)

Start using now! 🚀
