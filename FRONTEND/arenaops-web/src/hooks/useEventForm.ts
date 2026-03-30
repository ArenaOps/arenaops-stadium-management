import { z } from 'zod';

export const eventFormSchema = z.object({
    name: z
        .string()
        .min(1, 'Event name is required')
        .min(3, 'Event name must be at least 3 characters')
        .max(100, 'Event name must be less than 100 characters'),
    description: z
        .string()
        .max(500, 'Description must be less than 500 characters')
        .optional()
        .nullable(),
    stadiumId: z
        .string()
        .uuid('Please select a valid stadium')
        .min(1, 'Stadium is required'),
    imageUrl: z
        .string()
        .url('Please enter a valid image URL')
        .optional()
        .nullable(),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

export const DEFAULT_EVENT_FORM_VALUES: Partial<EventFormValues> = {
    name: '',
    description: '',
    stadiumId: '',
    imageUrl: '',
};
