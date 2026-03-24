"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button, Skeleton } from "@/components/ui";
import { useOwnerStadiums } from "@/features/dashboard/hooks/useOwnerStadiums";
import { StadiumCard } from "@/components/stadium/StadiumCard";
import { Building2, Plus } from "lucide-react";

function getUserIdFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      return userData.userId;
    }
  } catch {
    // Invalid JSON
  }
  return null;
}

export default function ManagerDashboard() {
  const userId = getUserIdFromStorage();

  const stadiumsQuery = useOwnerStadiums(userId);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Manager Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Manage your stadium properties
        </p>
      </div>

      {/* My Stadiums Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">My Stadiums</h2>
          </div>
          <Link href="/manager/stadiums/create">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              <Plus size={16} className="mr-1" />
              Add Stadium
            </Button>
          </Link>
        </div>

        {stadiumsQuery.isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-32 mb-4" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </Card>
            ))}
          </div>
        ) : stadiumsQuery.isError ? (
          <Card className="border-destructive/40">
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Failed to load stadiums
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => stadiumsQuery.refetch()}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : stadiumsQuery.data?.data?.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Building2 size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No stadiums yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first stadium to get started
              </p>
              <Link href="/manager/stadiums/create">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus size={16} className="mr-1" />
                  Create Stadium
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stadiumsQuery.data?.data?.map((stadium) => (
              <StadiumCard key={stadium.stadiumId} stadium={stadium} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
