// SkeletonLoader.tsx
"use client";

import { cn } from "@/lib/utils";

// ── Base skeleton block ──────────────────────────────────────────────────────

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-md bg-muted",
                "before:absolute before:inset-0",
                "before:animate-[shimmer_1.6s_infinite]",
                "before:bg-linear-to-r before:from-transparent before:via-white/10 before:to-transparent",
                className
            )}
            {...props}
        />
    );
}

// ── Card skeleton ────────────────────────────────────────────────────────────

export function SkeletonCard() {
    return (
        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
            {/* header row */}
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/5" />
                    <Skeleton className="h-3 w-2/5" />
                </div>
            </div>
            {/* body lines */}
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
            {/* image placeholder */}
            <Skeleton className="h-36 w-full rounded-md" />
            {/* footer row */}
            <div className="flex gap-2 pt-1">
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
            </div>
        </div>
    );
}

// ── Table row skeleton ───────────────────────────────────────────────────────

type SkeletonTableProps = {
    rows?: number;
    columns?: number;
};

export function SkeletonTable({ rows = 5, columns = 4 }: SkeletonTableProps) {
    return (
        <div className="w-full space-y-2">
            {/* header */}
            <div className="flex gap-4 pb-2 border-b border-border">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} className="h-4 flex-1 max-w-md" />
                ))}
            </div>
            {/* rows */}
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <div
                    key={rowIdx}
                    className="flex gap-4 items-center py-2 border-b border-border/50"
                >
                    {Array.from({ length: columns }).map((_, colIdx) => (
                        <Skeleton
                            key={colIdx}
                            className={cn(
                                "h-3 flex-1",
                                colIdx === 0 && "max-w-20",
                                colIdx === columns - 1 && "max-w-15"
                            )}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

// ── Stat card skeleton ───────────────────────────────────────────────────────

export function SkeletonStatCard() {
    return (
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-3 w-36" />
        </div>
    );
}

// ── List item skeleton ───────────────────────────────────────────────────────

export function SkeletonListItem() {
    return (
        <div className="flex items-center gap-3 py-3 border-b border-border/50">
            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-2/5" />
                <Skeleton className="h-3 w-3/5" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
        </div>
    );
}
