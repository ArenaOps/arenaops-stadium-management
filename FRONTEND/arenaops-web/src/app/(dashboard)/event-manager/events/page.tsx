"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyEvents, selectEvents, selectEventsLoading, selectEventsError } from "@/store/eventsSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import EventCard from "@/components/event-manager/EventCard";
import { Search, Plus, Calendar } from "lucide-react";
import { Event } from "@/services/coreService";

export default function EventsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const events = useAppSelector(selectEvents);
  const loading = useAppSelector(selectEventsLoading);
  const error = useAppSelector(selectEventsError);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "name">("recent");

  useEffect(() => {
    dispatch(fetchMyEvents());
  }, [dispatch]);

  const filteredEvents = events.filter((event: Event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.stadiumName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "Draft", label: "Draft" },
    { value: "PendingApproval", label: "Pending Approval" },
    { value: "Approved", label: "Approved" },
    { value: "Live", label: "Live" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white mb-2">
            My <span className="text-[#10b981]">Events</span>.
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Manage and monitor your events
          </p>
        </div>
        <Button
          onClick={() => router.push("/event-manager/events/create")}
          className="px-6 py-3 bg-white text-black hover:bg-[#10b981] text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Event
        </Button>
      </div>

      <Card className="bg-[#111827] border-white/5 text-white">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-widest">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search by name or stadium..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-[#111827] border-white/10 text-white">
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: "recent" | "name") => setSortBy(value)}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-[#111827] border-white/10 text-white">
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full bg-white/5 rounded-lg" />
          ))}
        </div>
      ) : sortedEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedEvents.map((event: Event) => (
            <EventCard
              key={event.eventId}
              event={event}
              onClick={() => router.push(`/event-manager/events/${event.eventId}`)}
            />
          ))}
        </div>
      ) : (
        <Card className="bg-[#111827] border-white/5 text-white">
          <CardContent className="py-16 text-center">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-white mb-2">No Events Found</h3>
            <p className="text-sm text-gray-400 mb-6">
              {searchTerm || statusFilter !== "all"
                ? "No events match your filters."
                : "You haven't created any events yet."}
            </p>
            <Button
              onClick={() => router.push("/event-manager/events/create")}
              className="bg-[#10b981] text-black hover:bg-[#059669]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="p-6 rounded-lg bg-blue-500/10 border border-blue-500/30">
        <h3 className="text-sm font-bold uppercase tracking-widest text-blue-200 mb-3">
          Event Workflow
        </h3>
        <ul className="space-y-2 text-xs text-blue-200">
          <li><span className="font-bold">1.</span> Create event in Draft</li>
          <li><span className="font-bold">2.</span> Submit for stadium approval</li>
          <li><span className="font-bold">3.</span> Configure seating after approval</li>
          <li><span className="font-bold">4.</span> Publish as Live to sell tickets</li>
        </ul>
      </div>
    </div>
  );
}
