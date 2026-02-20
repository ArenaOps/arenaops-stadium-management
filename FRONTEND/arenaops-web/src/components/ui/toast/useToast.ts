"use client";

import { useContext } from "react";
import { ToastContext } from "./ToastProvider";
import { ToastContextValue } from "./types";

/**
 * Hook to access the toast context.
 * Must be used within a ToastProvider.
 */
export function useToast(): ToastContextValue {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }

    return context;
}

/**
 * Convenience hook to add toasts with specific types
 */
export function useToastActions() {
    const { addToast } = useToast();

    return {
        success: (message: string, title?: string, duration?: number) =>
            addToast(message, "success", { title, duration }),
        error: (message: string, title?: string, duration?: number) =>
            addToast(message, "error", { title, duration }),
        info: (message: string, title?: string, duration?: number) =>
            addToast(message, "info", { title, duration }),
        warning: (message: string, title?: string, duration?: number) =>
            addToast(message, "warning", { title, duration }),
    };
}
