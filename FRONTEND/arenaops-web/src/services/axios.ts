import axios from 'axios';

export const api = axios.create({
    baseURL: '/api', // BFF Proxy
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle global errors (401, etc.)
        return Promise.reject(error);
    }
);
