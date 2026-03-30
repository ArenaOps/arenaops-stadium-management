'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchEvent, selectCurrentEvent } from '@/store/eventsSlice';
import { Skeleton } from '@/components/ui/skeleton';
import EventCreateEditForm from '@/components/event-manager/EventCreateEditForm';

export default function EventEditPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const eventId = params.id as string;

    const currentEvent = useAppSelector(selectCurrentEvent);
    const loading = useAppSelector((state) => state.events.loading);

    useEffect(() => {
        if (eventId) {
            dispatch(fetchEvent(eventId));
        }
    }, [eventId, dispatch]);

    // Check if event can be edited
    useEffect(() => {
        if (currentEvent && currentEvent.status !== 'Draft' && currentEvent.status !== 'PendingApproval') {
            router.push(`/event-manager/events/${eventId}`);
        }
    }, [currentEvent, eventId, router]);

    if (loading) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="pb-6 border-b border-white/5">
                    <Skeleton className="h-12 w-64 bg-white/5 rounded-lg mb-2" />
                    <Skeleton className="h-4 w-96 bg-white/5 rounded-lg" />
                </div>
                <Skeleton className="h-96 w-full bg-white/5 rounded-lg" />
            </div>
        );
    }

    if (!currentEvent) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Event Not Found</h2>
                    <p className="text-gray-400">The event you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="pb-6 border-b border-white/5">
                <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white mb-2">
                    Edit <span className="text-[#10b981]">{currentEvent.name}</span>.
                </h1>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Modify event details before final approval
                </p>
            </div>

            {/* Form */}
            <EventCreateEditForm event={currentEvent} isEditing={true} />
        </div>
    );
}
