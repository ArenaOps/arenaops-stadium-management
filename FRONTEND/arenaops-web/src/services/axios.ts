import axios from 'axios';

// Routes through the Next.js BFF proxy at /api/auth/[...slug] and /api/core/[...slug]
// The proxy forwards requests to the actual backend services (localhost:5001, etc.)
export const api = axios.create({
    baseURL: '',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);
