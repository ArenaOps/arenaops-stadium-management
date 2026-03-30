import { Event } from "@/services/coreService";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock } from "lucide-react";
import EventStatusBadge from "./EventStatusBadge";

interface Props {
  event: Event;
  onClick: () => void;
}

export default function EventCard({ event, onClick }: Props) {
  const formatCreatedDate = (created?: string) => {
    if (!created) return 'N/A';
    const date = new Date(created);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Card
      className="bg-[#111827] border-white/5 text-white overflow-hidden group hover:border-[#10b981]/30 transition-all duration-500 flex flex-col cursor-pointer"
      onClick={onClick}
    >
      <div className="relative h-32 overflow-hidden bg-black flex items-center justify-center">
        {/* Gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/20 to-purple-900/20 mix-blend-screen opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>

        <Clock className="w-12 h-12 text-white/10 group-hover:scale-110 transition-transform duration-500" />

        <div className="absolute top-3 right-3">
          <EventStatusBadge status={event.status} size="sm" />
        </div>
      </div>

      <CardHeader>
        <CardTitle className="text-lg font-bold tracking-tight text-white group-hover:text-[#10b981] transition-colors line-clamp-1">
          {event.name}
        </CardTitle>
        <CardDescription className="flex items-center gap-2 text-gray-500 text-xs mt-1">
          <MapPin className="w-3 h-3" />
          {event.stadiumName || 'Stadium TBD'}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          Created: {formatCreatedDate(event.createdAt)}
        </div>
        {event.description && (
          <div className="mt-2 text-xs text-gray-500 line-clamp-2">
            {event.description}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4 border-t border-white/5 mt-auto bg-black/20">
        <Button className="w-full bg-white text-black hover:bg-[#10b981] font-bold tracking-widest uppercase text-[10px] transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
