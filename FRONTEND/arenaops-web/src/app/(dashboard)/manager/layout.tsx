"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/sideBar";
import { Loader2 } from "lucide-react";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check auth from localStorage
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      if (!userData.roles?.includes("StadiumOwner")) {
        router.push("/");
        return;
      }
    } catch {
      router.push("/login");
      return;
    }

    setIsChecking(false);
  }, [router]);

  // Show loading state while checking auth
  if (isChecking) {
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
