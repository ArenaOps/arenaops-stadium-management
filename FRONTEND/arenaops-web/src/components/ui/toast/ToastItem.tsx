"use client";

import { Toast, ToastType } from "./types";
import { cn } from "@/lib/utils";

// ── Icon map for toast types ────────────────────────────────────────────────

const iconMap: Record<ToastType, React.ReactNode> = {
    success: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
            />
        </svg>
    ),
    error: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
            />
        </svg>
    ),
    info: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
    ),
    warning: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4v2m0-12a10 10 0 110 20 10 10 0 010-20z"
            />
        </svg>
    ),
};

// ── Color classes by type ───────────────────────────────────────────────────

const styleMap: Record<
    ToastType,
    {
        bg: string;
        border: string;
        icon: string;
        text: string;
        close: string;
    }
> = {
    success: {
        bg: "bg-green-50 dark:bg-green-950",
        border: "border-green-200 dark:border-green-800",
        icon: "text-green-600 dark:text-green-400",
        text: "text-green-900 dark:text-green-100",
        close: "hover:text-green-700 dark:hover:text-green-300",
    },
    error: {
        bg: "bg-red-50 dark:bg-red-950",
        border: "border-red-200 dark:border-red-800",
        icon: "text-red-600 dark:text-red-400",
        text: "text-red-900 dark:text-red-100",
        close: "hover:text-red-700 dark:hover:text-red-300",
    },
    info: {
        bg: "bg-blue-50 dark:bg-blue-950",
        border: "border-blue-200 dark:border-blue-800",
        icon: "text-blue-600 dark:text-blue-400",
        text: "text-blue-900 dark:text-blue-100",
        close: "hover:text-blue-700 dark:hover:text-blue-300",
    },
    warning: {
        bg: "bg-amber-50 dark:bg-amber-950",
        border: "border-amber-200 dark:border-amber-800",
        icon: "text-amber-600 dark:text-amber-400",
        text: "text-amber-900 dark:text-amber-100",
        close: "hover:text-amber-700 dark:hover:text-amber-300",
    },
};

// ── Toast Item Component ────────────────────────────────────────────────────

type ToastItemProps = {
    toast: Toast;
    onClose: (id: string) => void;
};

export function ToastItem({ toast, onClose }: ToastItemProps) {
    const styles = styleMap[toast.type];

    return (
        <div
            role="alert"
            aria-live="polite"
            aria-atomic="true"
            className={cn(
                "rounded-lg border px-4 py-3 shadow-lg",
                "flex gap-3 items-start",
                "animate-in fade-in slide-in-from-top-2 duration-200",
                "mb-3",
                styles.bg,
                styles.border
            )}
        >
            {/* icon */}
            <div className={cn("shrink-0 mt-0.5", styles.icon)}>
                {iconMap[toast.type]}
            </div>

            {/* content */}
            <div className={cn("flex-1", styles.text)}>
                {toast.title && (
                    <p className="font-semibold text-sm">{toast.title}</p>
                )}
                <p className={cn("text-sm", toast.title && "mt-1")}>
                    {toast.message}
                </p>
            </div>

            {/* close button */}
            <button
                onClick={() => onClose(toast.id)}
                aria-label="Close notification"
                className={cn(
                    "shrink-0 ml-2 text-muted-foreground transition-colors",
                    styles.close
                )}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
        </div>
    );
}
