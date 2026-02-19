// ErrorFallback.tsx
"use client";

type ErrorFallbackProps = {
    error?: Error;
    resetErrorBoundary?: () => void;
    title?: string;
    description?: string;
};

export function ErrorFallback({
    error,
    resetErrorBoundary,
    title = "Something went wrong",
    description = "An unexpected error occurred. Please try again or refresh the page.",
}: ErrorFallbackProps) {
    return (
        <div
            role="alert"
            className="flex flex-col items-center justify-center gap-6 py-20 px-6 text-center"
        >
            {/* icon */}
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 text-destructive">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                </svg>
            </div>

            {/* text */}
            <div className="space-y-2 max-w-md">
                <h2 className="text-xl font-semibold text-foreground">{title}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>

                {/* dev-only error details */}
                {process.env.NODE_ENV === "development" && error?.message && (
                    <pre className="mt-3 text-left text-xs text-destructive bg-destructive/5 rounded-md p-3 overflow-auto max-h-28">
                        {error.message}
                    </pre>
                )}
            </div>

            {/* action buttons */}
            <div className="flex gap-3">
                {resetErrorBoundary && (
                    <button
                        onClick={resetErrorBoundary}
                        className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        Try again
                    </button>
                )}
                <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center h-9 px-4 text-sm font-medium rounded-md border border-border bg-background hover:bg-muted text-foreground transition-colors"
                >
                    Refresh page
                </button>
            </div>
        </div>
    );
}