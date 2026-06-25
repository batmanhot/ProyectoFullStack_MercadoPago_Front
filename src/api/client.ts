import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

// ============================================================
// CLIENTE HTTP — Fase 4: interceptores JWT + refresh automático
// ============================================================

export const apiClient = axios.create({
  baseURL:         '/api/v1',
  timeout:         30_000,
  withCredentials: true,    // envía la cookie HttpOnly del refresh token
  headers: { 'Content-Type': 'application/json' },
});

// ── REQUEST: inyecta el access token ─────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE: refresca el token si recibe 401 TOKEN_EXPIRED ──
let isRefreshing   = false;
let refreshQueue: Array<(token: string) => void> = [];

const processQueue = (token: string) => {
  refreshQueue.forEach((resolve) => resolve(token));
  refreshQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const code = error.response?.data?.error?.code;

    // Solo intentamos refresh en TOKEN_EXPIRED y no en la ruta de refresh
    if (
      error.response?.status === 401 &&
      code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Encola la petición hasta que el refresh termine
        return new Promise((resolve) => {
          refreshQueue.push((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const { data } = await apiClient.post('/auth/refresh');
        const newToken = data.data.accessToken;

        useAuthStore.getState().setToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processQueue(newToken);
        return apiClient(originalRequest);

      } catch {
        // Refresh falló → logout forzado
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    // Normaliza el error (incluye cause para mostrar detalles de MP en el UI)
    return Promise.reject({
      code:    error.response?.data?.error?.code    ?? 'NETWORK_ERROR',
      message: error.response?.data?.error?.message ?? 'Error de conexión',
      cause:   error.response?.data?.error?.cause,
      status:  error.response?.status,
    });
  }
);
