import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { authApi } from '@/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import type { LoginCredentials, RegisterCredentials } from '@/types';

// ============================================================
// HOOK — useAuth: mutaciones de login/logout + query de perfil
// ============================================================

// Inicializa la sesión al arrancar la app (intenta refresh)
export const useInitAuth = () => {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  return useQuery({
    queryKey: ['auth', 'init'],
    queryFn:  async () => {
      try {
        const res = await authApi.refresh();
        setAuth(res.user, res.accessToken);
        return res.user;
      } catch {
        clearAuth();
        return null;
      } finally {
        setLoading(false);
      }
    },
    staleTime:  Infinity,
    retry:      false,
    refetchOnWindowFocus: false,
  });
};

export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const navigate    = useNavigate();

  return useMutation({
    mutationFn: (creds: LoginCredentials) => authApi.login(creds),
    onSuccess:  (data) => {
      setAuth(data.user, data.accessToken);
      toast.success(`Bienvenido, ${data.user.name}`);
      navigate(data.user.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard');
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? 'Credenciales inválidas');
    },
  });
};

export const useRegister = () => {
  const { setAuth } = useAuthStore();
  const navigate    = useNavigate();

  return useMutation({
    mutationFn: (creds: RegisterCredentials) => authApi.register(creds),
    onSuccess:  (data) => {
      setAuth(data.user, data.accessToken);
      toast.success('Cuenta creada correctamente');
      navigate('/dashboard');
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? 'Error al registrar usuario');
    },
  });
};

export const useLogout = () => {
  const { clearAuth }  = useAuthStore();
  const navigate       = useNavigate();
  const queryClient    = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled:  () => {
      clearAuth();
      queryClient.clear();
      navigate('/login');
      toast.success('Sesión cerrada');
    },
  });
};

export const useChangePassword = () => {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: ({ current, next }: { current: string; next: string }) =>
      authApi.changePassword(current, next),
    onSuccess: () => {
      toast.success('Contraseña actualizada. Inicia sesión nuevamente.');
      clearAuth();
      navigate('/login');
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? 'Error al cambiar contraseña');
    },
  });
};
