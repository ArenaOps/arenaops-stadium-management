"use client";

import { Provider } from "react-redux";
import { store } from "@/app/store/store";
import { useEffect } from "react";
import { initializeAuth } from "@/app/store/authSlice";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(initializeAuth());
  }, []);

  return <>{children}</>;
}

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
