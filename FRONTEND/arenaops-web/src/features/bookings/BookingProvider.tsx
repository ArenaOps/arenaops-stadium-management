"use client";

import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useMemo,
} from "react";

type BookingState = {
  selectedSectionId: string | null;
  selectedSeats: string[];
};

type BookingAction =
  | { type: "SELECT_SECTION"; payload: string }
  | { type: "TOGGLE_SEAT"; payload: string }
  | { type: "RESET_SECTION" }
  | { type: "CLEAR_ALL" };

const initialState: BookingState = {
  selectedSectionId: null,
  selectedSeats: [],
};

function reducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case "SELECT_SECTION":
      return {
        selectedSectionId: action.payload,
        selectedSeats: [],
      };

    case "TOGGLE_SEAT":
      return {
        ...state,
        selectedSeats: state.selectedSeats.includes(action.payload)
          ? state.selectedSeats.filter((id) => id !== action.payload)
          : [...state.selectedSeats, action.payload],
      };

    case "RESET_SECTION":
      return {
        ...state,
        selectedSectionId: null,
        selectedSeats: [],
      };

    case "CLEAR_ALL":
      return initialState;

    default:
      return state;
  }
}

type BookingContextType = {
  state: BookingState;
  selectSection: (id: string) => void;
  toggleSeat: (id: string) => void;
  resetSection: () => void;
  clearAll: () => void;
  totalSeats: number;
  canProceed: boolean;
};

const BookingContext = createContext<BookingContextType | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo(() => {
    const totalSeats = state.selectedSeats.length;

    return {
      state,
      selectSection: (id: string) =>
        dispatch({ type: "SELECT_SECTION", payload: id }),

      toggleSeat: (id: string) =>
        dispatch({ type: "TOGGLE_SEAT", payload: id }),

      resetSection: () => dispatch({ type: "RESET_SECTION" }),

      clearAll: () => dispatch({ type: "CLEAR_ALL" }),

      totalSeats,
      canProceed: totalSeats > 0,
    };
  }, [state]);

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error("useBooking must be used inside BookingProvider");
  }
  return ctx;
}