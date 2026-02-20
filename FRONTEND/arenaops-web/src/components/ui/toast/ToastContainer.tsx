"use client";

import { useToast } from "./useToast";
import { ToastItem } from "./ToastItem";

/**
 * Toast Container Component
 * Renders all active toasts. Should be placed in the root layout.
 * Must be inside a ToastProvider.
 */
export function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return (
        <div
            className="fixed bottom-4 right-4 z-50 pointer-events-auto"
            role="region"
            aria-label="Notifications"
            aria-live="polite"
        >
            <div className="flex flex-col gap-2 max-w-sm">
                {toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onClose={removeToast}
                    />
                ))}
            </div>
        </div>
    );
}
