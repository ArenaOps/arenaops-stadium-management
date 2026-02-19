// SectionLoader.tsx
"use client";

import { Spinner } from "./Spinner";

type SectionLoaderProps = {
    message?: string;
    className?: string;
};

export function SectionLoader({
    message,
    className = "",
}: SectionLoaderProps) {
    return (
        <div
            role="status"
            aria-live="polite"
            className={`flex flex-col items-center justify-center gap-3 py-16 ${className}`}
        >
            <Spinner size="lg" />
            {message && (
                <p className="text-sm text-muted-foreground">{message}</p>
            )}
        </div>
    );
}
