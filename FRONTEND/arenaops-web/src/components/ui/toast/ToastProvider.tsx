"use client";

import React, { createContext, useState, useCallback } from "react";
import { Toast, ToastContextValue, ToastType } from "./types";

// ── Create Toast Context ────────────────────────────────────────────────────

export const ToastContext = createContext<ToastContextValue | undefined>(
    undefined
);

// ── Toast Provider Component ────────────────────────────────────────────────

type ToastProviderProps = {
    children: React.ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    // Remove a toast by id
    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    // Add a new toast
    const addToast = useCallback(
        (
            message: string,
            type: ToastType = "info",
            options?: Partial<Pick<Toast, "title" | "duration">>
        ) => {
            const id = `toast-${Date.now()}-${Math.random()}`;
            const duration = options?.duration ?? 4000;

            const newToast: Toast = {
                id,
                message,
                type,
                title: options?.title,
                duration,
            };

            setToasts((prev) => [...prev, newToast]);

            // Auto-dismiss if duration is set > 0
            if (duration > 0) {
                setTimeout(() => {
                    removeToast(id);
                }, duration);
            }

            return id;
        },
        [removeToast]
    );

    const value: ToastContextValue = {
        toasts,
        addToast,
        removeToast,
    };

    return (
        <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
    );
}
