import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/client', () => ({
  apiClient: {
    get:  vi.fn(),
    post: vi.fn(),
    put:  vi.fn(),
  },
}));

import { apiClient } from '@/api/client';
import { authApi }   from '@/api/auth.api';

const mockGet  = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPut  = vi.mocked(apiClient.put);

const userStub = { id: 'u1', email: 'a@t.pe', name: 'User', role: 'ADMIN', tenantId: 't1' };
const authResp = { user: userStub, accessToken: 'acc.tok', expiresIn: 900 };

beforeEach(() => vi.clearAllMocks());

describe('authApi.login', () => {
  it('llama POST /auth/login y retorna data.data', async () => {
    mockPost.mockResolvedValue({ data: { data: authResp } });
    const result = await authApi.login({ tenantSlug: 'demo', email: 'a@t.pe', password: 'Pass1!' });
    expect(mockPost).toHaveBeenCalledWith('/auth/login', expect.objectContaining({ email: 'a@t.pe' }));
    expect(result.accessToken).toBe('acc.tok');
  });
});

describe('authApi.register', () => {
  it('llama POST /auth/register y retorna data.data', async () => {
    mockPost.mockResolvedValue({ data: { data: authResp } });
    const creds = { tenantSlug: 'demo', email: 'a@t.pe', password: 'Pass1!', name: 'A', role: 'ADMIN' as const };
    const result = await authApi.register(creds);
    expect(mockPost).toHaveBeenCalledWith('/auth/register', creds);
    expect(result.user.id).toBe('u1');
  });
});

describe('authApi.refresh', () => {
  it('llama POST /auth/refresh y retorna data.data', async () => {
    mockPost.mockResolvedValue({ data: { data: authResp } });
    const result = await authApi.refresh();
    expect(mockPost).toHaveBeenCalledWith('/auth/refresh');
    expect(result.expiresIn).toBe(900);
  });
});

describe('authApi.logout', () => {
  it('llama POST /auth/logout', async () => {
    mockPost.mockResolvedValue({ data: {} });
    await authApi.logout();
    expect(mockPost).toHaveBeenCalledWith('/auth/logout');
  });
});

describe('authApi.me', () => {
  it('llama GET /auth/me y retorna data.data', async () => {
    mockGet.mockResolvedValue({ data: { data: userStub } });
    const result = await authApi.me();
    expect(mockGet).toHaveBeenCalledWith('/auth/me');
    expect(result.id).toBe('u1');
  });
});

describe('authApi.changePassword', () => {
  it('llama PUT /auth/change-password con las contraseñas', async () => {
    mockPut.mockResolvedValue({ data: {} });
    await authApi.changePassword('oldPass', 'newPass1!');
    expect(mockPut).toHaveBeenCalledWith('/auth/change-password', {
      currentPassword: 'oldPass',
      newPassword:     'newPass1!',
    });
  });
});

describe('authApi.listUsers', () => {
  it('llama GET /auth/users y retorna data.data.users', async () => {
    mockGet.mockResolvedValue({ data: { data: { users: [userStub] } } });
    const result = await authApi.listUsers();
    expect(mockGet).toHaveBeenCalledWith('/auth/users');
    expect(result).toHaveLength(1);
  });
});
