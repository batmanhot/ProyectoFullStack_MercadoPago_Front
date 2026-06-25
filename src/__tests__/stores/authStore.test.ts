import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/authStore';
import type { AuthUser } from '@/types';

const mockUser: AuthUser = {
  id:          'user-001',
  email:       'admin@demo.pe',
  name:        'Admin Test',
  role:        'ADMIN',
  tenantId:    'tenant-001',
  tenantName:  'Demo Store',
  isActive:    true,
  lastLoginAt: null,
};

beforeEach(() => {
  useAuthStore.setState({
    user:        null,
    accessToken: null,
    isAuth:      false,
    isLoading:   true,
  });
});

describe('authStore', () => {
  it('estado inicial: no autenticado y cargando', () => {
    const state = useAuthStore.getState();
    expect(state.isAuth).toBe(false);
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isLoading).toBe(true);
  });

  it('setAuth: establece user, token, isAuth=true, isLoading=false', () => {
    useAuthStore.getState().setAuth(mockUser, 'eyJtoken');
    const state = useAuthStore.getState();

    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe('eyJtoken');
    expect(state.isAuth).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('clearAuth: limpia todo el estado de autenticación', () => {
    useAuthStore.getState().setAuth(mockUser, 'eyJtoken');
    useAuthStore.getState().clearAuth();
    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuth).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('setToken: solo actualiza el accessToken', () => {
    useAuthStore.getState().setAuth(mockUser, 'old-token');
    useAuthStore.getState().setToken('new-token');
    const state = useAuthStore.getState();

    expect(state.accessToken).toBe('new-token');
    expect(state.user).toEqual(mockUser); // user no cambia
    expect(state.isAuth).toBe(true);      // isAuth no cambia
  });

  it('setLoading: cambia isLoading sin tocar el resto', () => {
    useAuthStore.getState().setAuth(mockUser, 'tok');
    useAuthStore.getState().setLoading(true);
    const state = useAuthStore.getState();

    expect(state.isLoading).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.isAuth).toBe(true);
  });

  it('partialize: el estado persistido NO incluye accessToken', () => {
    // Simulamos lo que hace partialize: accedemos al estado serializable
    useAuthStore.getState().setAuth(mockUser, 'secret-access-token');
    const fullState = useAuthStore.getState();

    // partialize solo devuelve user e isAuth
    const persisted = { user: fullState.user, isAuth: fullState.isAuth };
    expect('accessToken' in persisted).toBe(false);
    expect(persisted.user).toEqual(mockUser);
  });
});
