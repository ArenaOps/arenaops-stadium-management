'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createEvent, updateEvent, selectEventsLoading, selectEventsError } from '@/store/eventsSlice';
import { fetchStadiums, selectStadiums } from '@/store/stadiumsSlice';
import { Event } from '@/services/coreService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { eventFormSchema, EventFormValues, DEFAULT_EVENT_FORM_VALUES } from '@/hooks/useEventForm';

interface EventCreateEditFormProps {
    event?: Event;
    isEditing?: boolean;
}

export default function EventCreateEditForm({ event, isEditing = false }: EventCreateEditFormProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const stadiums = useAppSelector(selectStadiums);
    const loading = useAppSelector(selectEventsLoading);
    const error = useAppSelector(selectEventsError);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        watch,
    } = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: event
            ? {
                name: event.name,
                description: event.description,
                stadiumId: event.stadiumId,
                imageUrl: event.imageUrl,
            }
            : DEFAULT_EVENT_FORM_VALUES,
    });

    const selectedStadiumId = watch('stadiumId');

    // Load stadiums on mount
    useEffect(() => {
        dispatch(fetchStadiums());
    }, [dispatch]);

    const onSubmit = async (data: EventFormValues) => {
        try {
            if (isEditing && event) {
                await dispatch(
                    updateEvent({
                        eventId: event.eventId,
                        payload: {
                            name: data.name,
                            description: data.description || undefined,
                            imageUrl: data.imageUrl || undefined,
                        },
                    })
                ).unwrap();
                router.push(`/event-manager/events/${event.eventId}`);
            } else {
                const result = await dispatch(
                    createEvent({
                        name: data.name,
                        description: data.description || undefined,
                        stadiumId: data.stadiumId,
                        imageUrl: data.imageUrl || undefined,
                    })
                ).unwrap();
                router.push(`/event-manager/events/${result.eventId}`);
            }
        } catch (err) {
            console.error('Form submission error:', err);
        }
    };

    return (
        <Card className="bg-[#111827] border-white/5 text-white">
            <CardHeader>
                <CardTitle className="text-2xl font-black uppercase">
                    {isEditing ? 'Edit Event' : 'Create New Event'}
                </CardTitle>
                <CardDescription className="text-gray-400">
                    {isEditing
                        ? 'Update your event details. This event is not yet approved.'
                        : 'Create a new event and submit it for stadium approval.'}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Error Alert */}
                    {error && (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <span className="text-sm text-red-200">{error}</span>
                        </div>
                    )}

                    {/* Event Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-[#10b981]">
                            Event Name *
                        </label>
                        <Input
                            {...register('name')}
                            placeholder="Enter event name (e.g., Live Concert 2024)"
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#10b981]"
                            disabled={isSubmitting}
                        />
                        {errors.name && (
                            <span className="text-xs text-red-400">{errors.name.message}</span>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-[#10b981]">
                            Description
                        </label>
                        <Textarea
                            {...register('description')}
                            placeholder="Enter event description (optional)"
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#10b981] min-h-[120px]"
                            disabled={isSubmitting}
                        />
                        {errors.description && (
                            <span className="text-xs text-red-400">{errors.description.message}</span>
                        )}
                    </div>

                    {/* Stadium Selector (disabled for edit) */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-[#10b981]">
                            Stadium {isEditing ? '(Cannot be changed)' : '*'}
                        </label>
                        <Select
                            value={selectedStadiumId}
                            onValueChange={(value) => setValue('stadiumId', value)}
                            disabled={isEditing || stadiums.length === 0}
                        >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-[#10b981]">
                                <SelectValue placeholder="Select a stadium" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#111827] border-white/10 text-white">
                                {stadiums.map((stadium) => (
                                    <SelectItem
                                        key={stadium.stadiumId}
                                        value={stadium.stadiumId}
                                    >
                                        {stadium.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.stadiumId && (
                            <span className="text-xs text-red-400">{errors.stadiumId.message}</span>
                        )}
                        {stadiums.length === 0 && !isEditing && (
                            <span className="text-xs text-yellow-400">
                                No approved stadiums available. Please ensure a stadium is approved.
                            </span>
                        )}
                    </div>

                    {/* Image URL */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-[#10b981]">
                            Image URL
                        </label>
                        <Input
                            {...register('imageUrl')}
                            placeholder="https://example.com/event-banner.jpg"
                            type="url"
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#10b981]"
                            disabled={isSubmitting}
                        />
                        {errors.imageUrl && (
                            <span className="text-xs text-red-400">{errors.imageUrl.message}</span>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Provide a valid image URL for the event banner
                        </p>
                    </div>

                    {/* Status Info (for edit) */}
                    {isEditing && event && (
                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                            <p className="text-sm text-blue-200">
                                <span className="font-bold">Current Status:</span> {event.status}
                            </p>
                            <p className="text-xs text-blue-300 mt-1">
                                Once approved by the stadium owner, you can manage seating and publish the event.
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6 border-t border-white/5">
                        <Button
                            type="button"
                            onClick={() => {
                                if (isEditing) {
                                    router.push(`/event-manager/events/${event?.eventId}`);
                                } else {
                                    router.push('/event-manager/events');
                                }
                            }}
                            className="px-6 py-2 bg-white/10 text-white hover:bg-white/20 border border-white/20 rounded-lg font-bold uppercase tracking-widest text-[10px] transition-all"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={isSubmitting || loading}
                            className="flex-1 px-6 py-2 bg-[#10b981] text-black hover:bg-[#059669] rounded-lg font-bold uppercase tracking-widest text-[10px] transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting || loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {isEditing ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>{isEditing ? 'Update Event' : 'Create Event'}</>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
