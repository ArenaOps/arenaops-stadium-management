/**
 * EXAMPLE ROOT LAYOUT WITH UX COMPONENTS
 * 
 * This file demonstrates how to set up the UX infrastructure components
 * (Loading, Error Boundaries, Toast) in your Next.js root layout.
 * 
 * Copy this pattern to your app/layout.tsx file.
 */

"use client";

import React from "react";
import { ErrorBoundary, ToastProvider, ToastContainer } from "@/components/ui";

type RootLayoutProps = {
    children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en">
            <body>
                {/* Wrap entire app with error boundary for top-level errors */}
                <ErrorBoundary
                    onError={(error, errorInfo) => {
                        // Log to monitoring service
                        console.error("Critical app error:", error, errorInfo);
                        // Example: Send to Sentry, LogRocket, etc.
                        // captureException(error);
                    }}
                    errorTitle="Application Error"
                >
                    {/* Wrap with Toast Provider for global notifications */}
                    <ToastProvider>
                        {/* Your app content */}
                        {children}

                        {/* Toast notifications container */}
                        {/* Position: fixed bottom-right, z-index 50 */}
                        <ToastContainer />
                    </ToastProvider>
                </ErrorBoundary>
            </body>
        </html>
    );
}
