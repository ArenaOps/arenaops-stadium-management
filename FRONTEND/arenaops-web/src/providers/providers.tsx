//src/providers/providers.tsx

"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import { useEffect, useState } from "react";
import { initializeAuth } from "@/store/authSlice";
import { ToastProvider, ToastContainer, ErrorBoundary } from "@/components/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    store.dispatch(initializeAuth());
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Restoring session…
      </div>
    );
  }

  return <>{children}</>;
}

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ErrorBoundary errorTitle="Application Error">
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <ToastProvider>
            <AuthInitializer>{children}</AuthInitializer>
            <ToastContainer />
          </ToastProvider>
        </Provider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
