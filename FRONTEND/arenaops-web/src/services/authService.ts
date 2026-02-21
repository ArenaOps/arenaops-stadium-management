import { api } from './axios';

// Types based on the API documentation
export interface UserData {
    accessToken: string;
    refreshToken: string;
    userId: string;
    roles: string[];
    isNewUser: boolean;
    fullName: string;
    email: string;
}

export interface AuthResponse {
    success: boolean;
    data: UserData;
    message: string | null;
    error: string | null;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    email: string;
    password: string;
    fullName: string;
}

export interface RefreshPayload {
    refreshToken: string;
}

export interface ResetPasswordPayload {
    email: string;
    otp: string;
    newPassword: string;
}

export const authService = {
    login: async (payload: LoginPayload): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/api/auth/login', payload);
        return response.data;
    },

    register: async (payload: RegisterPayload): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/api/auth/register', payload);
        return response.data;
    },

    refreshToken: async (payload: RefreshPayload): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/api/auth/refresh', payload);
        return response.data;
    },

    logout: async (refreshToken: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.post('/api/auth/logout', { refreshToken });
        return response.data;
    },

    googleLogin: async (code: string, redirectUri: string): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/api/auth/google', { code, redirectUri });
        return response.data;
    },

    forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.post('/api/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (payload: ResetPasswordPayload): Promise<{ success: boolean; message: string }> => {
        const response = await api.post('/api/auth/reset-password', payload);
        return response.data;
    }
};
