import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  authService,
  LoginPayload,
  RegisterPayload,
  RegisterEventManagerPayload,
  UserData,
  ResetPasswordPayload,
  type UserProfile,
} from "@/services/authService";

type AuthUserLike = Partial<UserData> & Partial<UserProfile>;

interface AuthState {
  loading: boolean;
  error: string | null;
  user: UserData | null;
  isAuthenticated: boolean;
  initialized: boolean;
}

const normalizeUser = (user: AuthUserLike | null | undefined): UserData | null => {
  if (!user?.userId) return null;

  return {
    userId: user.userId,
    roles: Array.isArray(user.roles)
      ? user.roles.filter((role): role is string => typeof role === "string")
      : [],
    isNewUser: typeof user.isNewUser === "boolean" ? user.isNewUser : false,
    fullName: user.fullName ?? "",
    email: user.email ?? "",
    profilePictureUrl: user.profilePictureUrl,
  };
};

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err && typeof err === "object") {
    const maybeError = err as {
      message?: unknown;
      response?: { data?: { message?: unknown } };
    };
    if (typeof maybeError.response?.data?.message === "string") {
      return maybeError.response.data.message;
    }
    if (typeof maybeError.message === "string") {
      return maybeError.message;
    }
  }

  return fallback;
};

const initialState: AuthState = {
  loading: false,
  error: null,
  user: null,
  isAuthenticated: false,
  initialized: false,
};

export const initializeAuth = createAsyncThunk<UserData | null>(
  "auth/initialize",
  async () => {
    try {
      const response = await authService.getProfile();
      if (!response.success) {
        return null;
      }

      return normalizeUser(response.data);
    } catch {
      return null;
    }
  }
);

// Async Thunks
export const loginUser = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await authService.login(payload);
      if (response.success) {
        const user = normalizeUser(response.data);
        if (!user) {
          return rejectWithValue("Login succeeded, but user data was incomplete");
        }

        return user;
      }

      return rejectWithValue(response.message || "Login failed");
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Login failed"));
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const response = await authService.register(payload);
      if (response.success) {
        const user = normalizeUser(response.data);
        if (!user) {
          return rejectWithValue("Registration succeeded, but user data was incomplete");
        }

        return user;
      }

      return rejectWithValue(response.message || "Registration failed");
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Registration failed"));
    }
  }
);

export const registerEventManagerUser = createAsyncThunk(
  "auth/registerEventManager",
  async (payload: RegisterEventManagerPayload, { rejectWithValue }) => {
    try {
      const response = await authService.registerEventManager(payload);
      if (response.success) {
        const user = normalizeUser(response.data);
        if (!user) {
          return rejectWithValue(
            "Event Manager registration succeeded, but user data was incomplete"
          );
        }

        return user;
      }

      return rejectWithValue(response.message || "Event Manager Registration failed");
    } catch (err: unknown) {
      return rejectWithValue(
        getErrorMessage(err, "Event Manager Registration failed")
      );
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    // Cookies are cleared by the backend; we only need to complete the request.
    await authService.logout();
  } catch {
    // Always clear the client session state even if logout returns an error.
  }
});

export const googleLoginUser = createAsyncThunk(
  "auth/googleLogin",
  async ({ code, redirectUri }: { code: string; redirectUri: string }, { rejectWithValue }) => {
    try {
      const response = await authService.googleLogin(code, redirectUri);
      if (response.success) {
        const user = normalizeUser(response.data);
        if (!user) {
          return rejectWithValue("Google login succeeded, but user data was incomplete");
        }

        return user;
      }

      return rejectWithValue(response.message || "Google login failed");
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Google login failed"));
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email);
      return response;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to send reset email"));
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (payload: ResetPasswordPayload, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(payload);
      return response;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Password reset failed"));
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthUser: (state, action: PayloadAction<AuthUserLike | null>) => {
      const user = normalizeUser(action.payload);
      state.user = user;
      state.isAuthenticated = Boolean(user);
      state.initialized = true;
      state.loading = false;
      state.error = null;
    },
    clearAuthState: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.initialized = true;
      state.loading = false;
      state.error = null;
    },
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<UserData>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.initialized = true;
      state.user = action.payload;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.initialized = true;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Bootstrap session from cookies
    builder.addCase(initializeAuth.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(initializeAuth.fulfilled, (state, action) => {
      if (state.initialized) {
        state.loading = false;
        return;
      }

      state.loading = false;
      state.initialized = true;
      state.user = action.payload;
      state.isAuthenticated = Boolean(action.payload);
      state.error = null;
    });
    builder.addCase(initializeAuth.rejected, (state, action) => {
      if (state.initialized) {
        state.loading = false;
        return;
      }

      state.loading = false;
      state.initialized = true;
      state.user = null;
      state.isAuthenticated = false;
      state.error = action.payload as string | null;
    });

    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      state.initialized = true;
      state.error = null;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.initialized = true;
      state.error = action.payload as string;
    });

    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      state.initialized = true;
      state.error = null;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.initialized = true;
      state.error = action.payload as string;
    });

    // Register Event Manager
    builder.addCase(registerEventManagerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerEventManagerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      state.initialized = true;
      state.error = null;
    });
    builder.addCase(registerEventManagerUser.rejected, (state, action) => {
      state.loading = false;
      state.initialized = true;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.initialized = true;
      state.error = null;
    });

    // Google Login
    builder.addCase(googleLoginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(googleLoginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      state.initialized = true;
      state.error = null;
    });
    builder.addCase(googleLoginUser.rejected, (state, action) => {
      state.loading = false;
      state.initialized = true;
      state.error = action.payload as string;
    });

    // Forgot Password
    builder.addCase(forgotPassword.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(forgotPassword.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
    });
    builder.addCase(forgotPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Reset Password
    builder.addCase(resetPassword.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(resetPassword.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
    });
    builder.addCase(resetPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  setAuthUser,
  clearAuthState,
  loginStart,
  loginSuccess,
  loginFailure,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
