"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/sideBar";
import { Loader2 } from "lucide-react";
import { useAppSelector } from "@/store/hooks";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, initialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!user || !isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      if (!user.roles?.includes("StadiumOwner")) {
        router.push("/");
        return;
      }
    } catch {
      router.push("/login");
      return;
    }
  }, [initialized, isAuthenticated, user, router]);

  // Show loading state while checking auth
  if (!initialized || !user || !isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black lg:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 bg-gray-100 lg:rounded-l-3xl overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
