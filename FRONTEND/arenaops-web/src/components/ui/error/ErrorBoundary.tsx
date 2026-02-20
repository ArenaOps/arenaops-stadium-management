// ErrorBoundary.tsx
import React from "react";
import { ErrorFallback } from "./ErrorFallback";

// ── Types ──────────────────────────────────────────────────────────────────

type ErrorBoundaryProps = {
    children: React.ReactNode;
    /** Custom fallback UI. If omitted, renders <ErrorFallback /> */
    fallback?: React.ReactNode;
    /** Called when boundary catches an error – use for monitoring/logging */
    onError?: (error: Error, info: React.ErrorInfo) => void;
    /** Label shown as the error heading */
    errorTitle?: string;
};

type ErrorBoundaryState = {
    hasError: boolean;
    error: Error | null;
};

// ── Class component ────────────────────────────────────────────────────────

export class ErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    state: ErrorBoundaryState = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("[ErrorBoundary] Caught error:", error, info);
        this.props.onError?.(error, info);
    }

    resetErrorBoundary = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <ErrorFallback
                    error={this.state.error ?? undefined}
                    resetErrorBoundary={this.resetErrorBoundary}
                    title={this.props.errorTitle}
                />
            );
        }

        return this.props.children;
    }
}

// ── withErrorBoundary HOC ─────────────────────────────────────────────────

export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    boundaryProps?: Omit<ErrorBoundaryProps, "children">
) {
    const DisplayName =
        WrappedComponent.displayName ?? WrappedComponent.name ?? "Component";

    function WithErrorBoundary(props: P) {
        return (
            <ErrorBoundary {...boundaryProps}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        );
    }

    WithErrorBoundary.displayName = `withErrorBoundary(${DisplayName})`;
    return WithErrorBoundary;
}