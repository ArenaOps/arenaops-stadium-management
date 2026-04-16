"use client";

import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Event } from "@/services/coreService";
import EventStatusBadge from "./EventStatusBadge";

interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

export default function EventCard({ event, onClick }: EventCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card 
      className="bg-[#111827] border-white/5 text-white overflow-hidden group hover:border-[#10b981]/30 transition-all duration-500 flex flex-col h-full cursor-pointer"
      onClick={onClick}
    >
      {/* Event Header / Image Area */}
      <div className="relative h-48 overflow-hidden bg-black flex items-center justify-center">
        {event.imageUrl ? (
          <>
            <img
              src={event.imageUrl}
              alt={event.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/20 to-blue-900/20 mix-blend-screen opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Calendar className="w-16 h-16 text-white/10 group-hover:scale-110 transition-transform duration-500" />
          </>
        )}

        <div className="absolute top-4 left-4">
          <EventStatusBadge status={event.status} size="sm" />
        </div>
      </div>

      <CardHeader className="pb-2">
        <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-[#10b981] transition-colors line-clamp-1">
          {event.name}
        </h3>
        <div className="flex items-center gap-4 mt-1">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <MapPin className="w-3 h-3 text-[#10b981]" />
            <span className="line-clamp-1">{event.stadiumName || "Venue TBD"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <Calendar className="w-3 h-3 text-[#10b981]" />
            <span>{formatDate(event.createdAt)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-xs text-gray-400 leading-relaxed font-light line-clamp-2">
          {event.description || "No description provided for this event."}
        </p>
      </CardContent>

      <CardFooter className="pt-4 border-t border-white/5 mt-auto bg-black/20">
        <Button 
          variant="ghost" 
          className="w-full text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-[#10b981] group-hover:bg-[#10b981]/5 p-0 flex items-center justify-center gap-2"
        >
          View Details
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
}
