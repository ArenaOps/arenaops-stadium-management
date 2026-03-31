import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const isServer = typeof window === 'undefined';
const isDev = process.env.NODE_ENV === 'development';

type RetryableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
    _skipAuthRefresh?: boolean;
};

type RefreshAwareAxiosError = AxiosError & {
    refreshFailed?: boolean;
    refreshStatus?: number;
};

const debugLog = (message: string, payload?: Record<string, unknown>) => {
    if (!isDev) return;
    console.info(`[Axios Auth] ${message}`, payload ?? {});
};

const clearClientSession = () => {
    if (typeof window === 'undefined') return;
    // Session state lives in HttpOnly cookies and Redux, so a hard redirect is enough.
};

const redirectToLogin = () => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
};

export const api = axios.create({
    baseURL: isServer
        ? process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        : '',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: () => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error?: unknown) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryableRequestConfig | undefined;
        const status = error.response?.status;
        const requestUrl = originalRequest?.url ?? '';

        if (!originalRequest || status !== 401) {
            return Promise.reject(error);
        }

        const isRefreshRequest =
            requestUrl.includes('/api/auth/refresh') || originalRequest._skipAuthRefresh === true;

        if (isRefreshRequest || originalRequest._retry) {
            debugLog('Skipping refresh flow for request', {
                requestUrl,
                status,
                isRefreshRequest,
                alreadyRetried: Boolean(originalRequest._retry),
            });
            return Promise.reject(error);
        }

        const errorCode = (error.response?.data as { error?: { code?: string } } | undefined)?.error?.code;
        if (errorCode === 'TOKEN_REVOKED') {
            clearClientSession();
            redirectToLogin();
            return Promise.reject(error);
        }

        if (isServer) {
            debugLog('Skipping refresh flow on server runtime', { requestUrl, status });
            return Promise.reject(error);
        }

        if (isRefreshing) {
            debugLog('Refresh in progress, queueing request', { requestUrl });
            return new Promise<void>((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(() => {
                    debugLog('Retrying queued request after refresh', { requestUrl });
                    return api(originalRequest);
                })
                .catch((queueError) => Promise.reject(queueError));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            debugLog('Attempting token refresh', { requestUrl });
            await api.post(
                '/api/auth/refresh',
                {},
                { withCredentials: true, _skipAuthRefresh: true } as RetryableRequestConfig
            );
            debugLog('Refresh succeeded, retrying original request', { requestUrl });
            processQueue();
            return api(originalRequest);
        } catch (refreshError) {
            const refreshStatus = axios.isAxiosError(refreshError)
                ? refreshError.response?.status
                : undefined;
            debugLog('Refresh failed', { requestUrl, refreshStatus });

            const finalError = error as RefreshAwareAxiosError;
            finalError.refreshFailed = true;
            finalError.refreshStatus = refreshStatus;

            processQueue(finalError);
            clearClientSession();
            redirectToLogin();
            return Promise.reject(finalError);
        } finally {
            isRefreshing = false;
        }
    }
);

