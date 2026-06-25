// ============================================================
// TYPES — Auth frontend (Fase 4)
// ============================================================

export interface AuthUser {
  id:          string;
  email:       string;
  name:        string;
  role:        'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR';
  tenantId:    string;
  tenantName:  string;
  lastLoginAt: string | null;
  isActive:    boolean;
}

export interface LoginCredentials {
  tenantSlug: string;
  email:      string;
  password:   string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword:     string;
  confirmPassword: string;
}

export interface AuthState {
  user:         AuthUser | null;
  accessToken:  string | null;
  isAuth:       boolean;
  isLoading:    boolean;

  setAuth:    (user: AuthUser, token: string) => void;
  setToken:   (token: string) => void;
  clearAuth:  () => void;
  setLoading: (v: boolean) => void;
}
