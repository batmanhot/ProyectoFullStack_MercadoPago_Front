import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, AuthUser } from '@/types';

// ============================================================
// ZUSTAND — Auth store con persistencia en sessionStorage
// sessionStorage: los tokens no sobreviven al cierre del tab
// ============================================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:        null,
      accessToken: null,
      isAuth:      false,
      isLoading:   true,

      setAuth: (user: AuthUser, token: string) =>
        set({ user, accessToken: token, isAuth: true, isLoading: false }),

      setToken: (token: string) =>
        set({ accessToken: token }),

      clearAuth: () =>
        set({ user: null, accessToken: null, isAuth: false, isLoading: false }),

      setLoading: (v: boolean) => set({ isLoading: v }),
    }),
    {
      name:    'mp_auth',
      storage: {
        getItem:    (k) => { const v = sessionStorage.getItem(k); return v ? JSON.parse(v) : null; },
        setItem:    (k, v) => sessionStorage.setItem(k, JSON.stringify(v)),
        removeItem: (k) => sessionStorage.removeItem(k),
      },
      // Solo user e isAuth — el accessToken NO se persiste (XSS risk).
      // useInitAuth llama /auth/refresh al arrancar y obtiene un token fresco.
      partialize: (state) => ({ user: state.user, isAuth: state.isAuth }),
    }
  )
);
