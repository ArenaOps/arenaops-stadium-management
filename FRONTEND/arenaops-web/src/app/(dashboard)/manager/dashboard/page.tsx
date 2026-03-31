"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, Skeleton } from "@/components/ui";
import { useManagerDashboard } from "@/features/dashboard/hooks/useManagerDashboard";
import { useRecentBookings } from "@/features/dashboard/hooks/useRecentBookings";
import { useOwnerStadiums } from "@/features/dashboard/hooks/useOwnerStadiums";
import { RecentBookingsTable } from "@/features/dashboard/components/RecentBookingsTable";
import { StadiumCard } from "@/components/stadium/StadiumCard";
import { Building2, CalendarDays, Ticket, Users, Plus } from "lucide-react";
import { useAppSelector } from "@/store/hooks";

export default function ManagerDashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.userId ?? null;

  const { data, isLoading, isFetching, isError, error, refetch } =
    useManagerDashboard();
  const recentBookingsQuery = useRecentBookings(5);
  const stadiumsQuery = useOwnerStadiums(userId);

  const loading = isLoading && !data;
  const updating = isFetching && !!data;

  const stats = [
    {
      key: "totalStadiums",
      label: "Total Stadiums",
      icon: <Building2 size={18} />,
      value: data?.totalStadiums,
    },
    {
      key: "todaysBookings",
      label: "Today's Bookings",
      icon: <CalendarDays size={18} />,
      value: data?.todaysBookings,
    },
    {
      key: "totalUsers",
      label: "Total Users",
      icon: <Users size={18} />,
      value: data?.totalUsers,
    },
    {
      key: "ticketsSold",
      label: "Tickets Sold",
      icon: <Ticket size={18} />,
      value: data?.ticketsSold,
    },
  ] as const;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Manager Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of stadium activity
        </p>
      </div>

      {isError && (
        <Card className="border-destructive/40">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-destructive">
              Failed to load dashboard metrics
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats Section */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.key}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              {stat.icon}
            </CardHeader>

            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {(stat.value ?? 0).toLocaleString()}
                </div>
              )}
              {updating && (
                <p className="mt-2 text-xs text-muted-foreground">Updating…</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* My Stadiums Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">My Stadiums</h2>
            <p className="text-sm text-muted-foreground">
              Manage your stadium properties
            </p>
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

      {/* Optional placeholders */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 rounded-md border border-dashed flex items-center justify-center text-sm text-muted-foreground">
              Chart placeholder
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent bookings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <RecentBookingsTable
              data={recentBookingsQuery.data}
              isLoading={recentBookingsQuery.isLoading}
              isError={recentBookingsQuery.isError}
              errorMessage={
                recentBookingsQuery.error instanceof Error
                  ? recentBookingsQuery.error.message
                  : undefined
              }
              onRetry={() => recentBookingsQuery.refetch()}
              rows={5}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
