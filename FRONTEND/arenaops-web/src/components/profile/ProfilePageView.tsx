"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loading";
import { useToastActions } from "@/components/ui/toast";
import { logoutUser } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useProfileQuery } from "@/features/public/hooks";
import { ProfileCard } from "./ProfileCard";

function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-[420px] w-full rounded-xl" />
    </div>
  );
}

export function ProfilePageView() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { success } = useToastActions();
  const { isAuthenticated, loading: authLoading } = useAppSelector((state) => state.auth);
  const profileQuery = useProfileQuery(!!isAuthenticated);

  console.log("[ProfilePageView] status", {
    authLoading,
    isAuthenticated,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    data: profileQuery.data,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || authLoading || profileQuery.isLoading) {
    return (
      <section className="container mx-auto px-4 py-10">
        <ProfileSkeleton />
      </section>
    );
  }

  const handleLogout = async () => {
    await dispatch(logoutUser());
    success("You are now logged out.");
    router.replace("/");
  };

  if (profileQuery.isError) {
    return (
      <section className="container mx-auto px-4 py-10">
        <div className="max-w-xl mx-auto rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-center">
          <h1 className="text-xl font-semibold text-red-100 mb-2">Profile failed to load</h1>
          <p className="text-sm text-red-200 mb-4">Try again to fetch your profile data.</p>
          <Button type="button" onClick={() => void profileQuery.refetch()}>
            Retry
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-sm text-muted-foreground">Manage your identity and account info.</p>
          </div>
          <Button type="button" variant="outline" onClick={() => void handleLogout()}>
            Logout
          </Button>
        </header>

        <ProfileCard user={profileQuery.data!} eventManagerDetails={profileQuery.data?.eventManagerDetails} />
      </div>
    </section>
  );
}
