import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { coreService, Stadium } from "@/services/coreService";

interface StadiumsState {
  stadiums: Stadium[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null; // timestamp for cache TTL
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

const initialState: StadiumsState = {
  stadiums: [],
  loading: false,
  error: null,
  lastFetched: null,
};

// Helper to check if cache is valid
const isCacheValid = (lastFetched: number | null): boolean => {
  if (!lastFetched) return false;
  return Date.now() - lastFetched < CACHE_TTL;
};

// Async Thunk with cache check
export const fetchStadiums = createAsyncThunk(
  "stadiums/fetchAll",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { stadiums: StadiumsState };

      // Return cached data if still valid
      if (isCacheValid(state.stadiums.lastFetched) && state.stadiums.stadiums.length > 0) {
        return { stadiums: state.stadiums.stadiums, fromCache: true };
      }

      const response = await coreService.getStadiums();
      if (response.success && response.data) {
        return { stadiums: response.data, fromCache: false };
      }
      return rejectWithValue(response.error?.message || "Failed to fetch stadiums");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch stadiums";
      return rejectWithValue(message);
    }
  },
  {
    // Prevent duplicate requests while one is in flight
    condition: (_, { getState }) => {
      const state = getState() as { stadiums: StadiumsState };
      // Don't fetch if already loading
      if (state.stadiums.loading) {
        return false;
      }
      return true;
    },
  }
);

// Fetch single stadium
export const fetchStadium = createAsyncThunk(
  "stadiums/fetchOne",
  async (stadiumId: string, { getState, rejectWithValue }) => {
    try {
      // Check if we already have it in state
      const state = getState() as { stadiums: StadiumsState };
      const existing = state.stadiums.stadiums.find(s => s.stadiumId === stadiumId);
      if (existing) {
        return existing;
      }

      const response = await coreService.getStadium(stadiumId);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.error?.message || "Stadium not found");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch stadium";
      return rejectWithValue(message);
    }
  }
);

const stadiumsSlice = createSlice({
  name: "stadiums",
  initialState,
  reducers: {
    clearStadiumsError: (state) => {
      state.error = null;
    },
    invalidateCache: (state) => {
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all stadiums
    builder.addCase(fetchStadiums.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchStadiums.fulfilled, (state, action) => {
      state.loading = false;
      if (!action.payload.fromCache) {
        state.stadiums = action.payload.stadiums;
        state.lastFetched = Date.now();
      }
      state.error = null;
    });
    builder.addCase(fetchStadiums.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch single stadium
    builder.addCase(fetchStadium.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchStadium.fulfilled, (state, action) => {
      state.loading = false;
      // Add to list if not already there
      const exists = state.stadiums.some(s => s.stadiumId === action.payload.stadiumId);
      if (!exists) {
        state.stadiums.push(action.payload);
      }
      state.error = null;
    });
    builder.addCase(fetchStadium.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearStadiumsError, invalidateCache } = stadiumsSlice.actions;

// Selectors
export const selectStadiums = (state: { stadiums: StadiumsState }) => state.stadiums.stadiums;
export const selectStadiumsLoading = (state: { stadiums: StadiumsState }) => state.stadiums.loading;
export const selectStadiumsError = (state: { stadiums: StadiumsState }) => state.stadiums.error;
export const selectStadiumById = (state: { stadiums: StadiumsState }, id: string) =>
  state.stadiums.stadiums.find(s => s.stadiumId === id);

export default stadiumsSlice.reducer;
