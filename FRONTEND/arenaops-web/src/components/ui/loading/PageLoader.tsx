// PageLoader.tsx
"use client";

import { Spinner } from "./Spinner";

type PageLoaderProps = {
    message?: string;
};

export function PageLoader({ message = "Loading…" }: PageLoaderProps) {
    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm"
        >
            <Spinner size="xl" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
                {message}
            </p>
        </div>
    );
}