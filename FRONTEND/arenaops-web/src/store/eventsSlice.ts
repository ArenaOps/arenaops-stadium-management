import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { coreService, Event } from "@/services/coreService";

interface EventsState {
  events: Event[];
  currentEvent: Event | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null; // timestamp for cache TTL
}

const CACHE_TTL = 2 * 60 * 1000; // 2 minutes cache for events (more dynamic data)

const initialState: EventsState = {
  events: [],
  currentEvent: null,
  loading: false,
  error: null,
  lastFetched: null,
};

// Helper to check if cache is valid
const isCacheValid = (lastFetched: number | null): boolean => {
  if (!lastFetched) return false;
  return Date.now() - lastFetched < CACHE_TTL;
};

// Fetch my events (for event manager)
export const fetchMyEvents = createAsyncThunk(
  "events/fetchMy",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { events: EventsState };

      // Return cached data if still valid
      if (isCacheValid(state.events.lastFetched) && state.events.events.length > 0) {
        return { events: state.events.events, fromCache: true };
      }

      const response = await coreService.getMyEvents();
      if (response.success && response.data) {
        return { events: response.data, fromCache: false };
      }
      return rejectWithValue(response.error?.message || "Failed to fetch events");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch events";
      return rejectWithValue(message);
    }
  },
  {
    // Prevent duplicate requests while one is in flight
    condition: (_, { getState }) => {
      const state = getState() as { events: EventsState };
      if (state.events.loading) {
        return false;
      }
      return true;
    },
  }
);

// Fetch single event
export const fetchEvent = createAsyncThunk(
  "events/fetchOne",
  async (eventId: string, { getState, rejectWithValue }) => {
    try {
      // Check if we already have it in state
      const state = getState() as { events: EventsState };
      const existing = state.events.events.find(e => e.eventId === eventId);
      if (existing) {
        return existing;
      }

      const response = await coreService.getEvent(eventId);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.error?.message || "Event not found");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch event";
      return rejectWithValue(message);
    }
  }
);

// Create event
export const createEvent = createAsyncThunk(
  "events/create",
  async (payload: {
    name: string;
    description?: string;
    stadiumId: string;
    imageUrl?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await coreService.createEvent(payload);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.error?.message || "Failed to create event");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create event";
      return rejectWithValue(message);
    }
  }
);

// Update event
export const updateEvent = createAsyncThunk(
  "events/update",
  async ({ eventId, payload }: {
    eventId: string;
    payload: {
      name?: string;
      description?: string;
      imageUrl?: string;
    };
  }, { rejectWithValue }) => {
    try {
      const response = await coreService.updateEvent(eventId, payload);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.error?.message || "Failed to update event");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update event";
      return rejectWithValue(message);
    }
  }
);

// Update event status
export const updateEventStatus = createAsyncThunk(
  "events/updateStatus",
  async ({ eventId, status }: { eventId: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await coreService.updateEventStatus(eventId, { status });
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.error?.message || "Failed to update status");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update status";
      return rejectWithValue(message);
    }
  }
);

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    clearEventsError: (state) => {
      state.error = null;
    },
    invalidateCache: (state) => {
      state.lastFetched = null;
    },
    setCurrentEvent: (state, action: PayloadAction<Event | null>) => {
      state.currentEvent = action.payload;
    },
    addEvent: (state, action: PayloadAction<Event>) => {
      state.events.push(action.payload);
      state.lastFetched = null; // Invalidate cache
    },
    updateEventInList: (state, action: PayloadAction<Event>) => {
      const index = state.events.findIndex(e => e.eventId === action.payload.eventId);
      if (index !== -1) {
        state.events[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch my events
    builder.addCase(fetchMyEvents.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMyEvents.fulfilled, (state, action) => {
      state.loading = false;
      if (!action.payload.fromCache) {
        state.events = action.payload.events;
        state.lastFetched = Date.now();
      }
      state.error = null;
    });
    builder.addCase(fetchMyEvents.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch single event
    builder.addCase(fetchEvent.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchEvent.fulfilled, (state, action) => {
      state.loading = false;
      state.currentEvent = action.payload;
      // Add to list if not already there
      const exists = state.events.some(e => e.eventId === action.payload.eventId);
      if (!exists) {
        state.events.push(action.payload);
      }
      state.error = null;
    });
    builder.addCase(fetchEvent.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create event
    builder.addCase(createEvent.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createEvent.fulfilled, (state, action) => {
      state.loading = false;
      state.events.push(action.payload);
      state.lastFetched = null; // Invalidate cache
      state.error = null;
    });
    builder.addCase(createEvent.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update event
    builder.addCase(updateEvent.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateEvent.fulfilled, (state, action) => {
      state.loading = false;
      // Update in list
      const index = state.events.findIndex(e => e.eventId === action.payload.eventId);
      if (index !== -1) {
        state.events[index] = action.payload;
      }
      // Update current event if it's the same one
      if (state.currentEvent?.eventId === action.payload.eventId) {
        state.currentEvent = action.payload;
      }
      state.error = null;
    });
    builder.addCase(updateEvent.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update event status
    builder.addCase(updateEventStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateEventStatus.fulfilled, (state, action) => {
      state.loading = false;
      // Update in list
      const index = state.events.findIndex(e => e.eventId === action.payload.eventId);
      if (index !== -1) {
        state.events[index] = action.payload;
      }
      // Update current event if it's the same one
      if (state.currentEvent?.eventId === action.payload.eventId) {
        state.currentEvent = action.payload;
      }
      state.error = null;
    });
    builder.addCase(updateEventStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearEventsError, invalidateCache, setCurrentEvent, addEvent, updateEventInList } = eventsSlice.actions;

// Selectors
export const selectEvents = (state: { events: EventsState }) => state.events.events;
export const selectEventsLoading = (state: { events: EventsState }) => state.events.loading;
export const selectEventsError = (state: { events: EventsState }) => state.events.error;
export const selectCurrentEvent = (state: { events: EventsState }) => state.events.currentEvent;
export const selectEventById = (state: { events: EventsState }, id: string) =>
  state.events.events.find(e => e.eventId === id);

export default eventsSlice.reducer;
