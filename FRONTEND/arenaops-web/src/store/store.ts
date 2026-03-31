import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import stadiumsReducer from "./stadiumsSlice";
import eventsReducer from "./eventsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    stadiums: stadiumsReducer,
    events: eventsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
