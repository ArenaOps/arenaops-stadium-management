// Spinner.tsx
import { cn } from "@/lib/utils";

type SpinnerProps = {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
};

const sizeMap: Record<NonNullable<SpinnerProps["size"]>, string> = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-[3px]",
    xl: "w-16 h-16 border-4",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
    return (
        <div
            role="status"
            aria-label="Loading"
            className={cn(
                "animate-spin rounded-full border-border border-t-primary",
                sizeMap[size],
                className
            )}
        />
    );
}