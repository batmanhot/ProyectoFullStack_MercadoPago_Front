import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock de apiClient ANTES de importar el módulo ────────────
vi.mock('@/api/client', () => ({
  apiClient: {
    get:   vi.fn(),
    post:  vi.fn(),
    patch: vi.fn(),
  },
}));

import { apiClient }  from '@/api/client';
import { adminApi }   from '@/api/admin.api';

const mockGet   = vi.mocked(apiClient.get);
const mockPost  = vi.mocked(apiClient.post);
const mockPatch = vi.mocked(apiClient.patch);

// ── Helper: envuelve la respuesta en el formato Axios ─────────
const axiosOk = <T>(data: T) => Promise.resolve({ data: { success: true, data } });
const axiosErr = (message: string) =>
  Promise.resolve({ data: { success: false, error: { message } } });

beforeEach(() => vi.clearAllMocks());

// ─────────────────────────────────────────────────────────────
// unwrap — testado indirectamente a través de los métodos
// ─────────────────────────────────────────────────────────────

describe('unwrap (via adminApi.getTenants)', () => {
  it('success:true → retorna data directamente', async () => {
    const tenants = [{ id: 't1', name: 'Demo' }];
    mockGet.mockReturnValue(axiosOk(tenants));

    const result = await adminApi.getTenants();
    expect(result).toEqual(tenants);
  });

  it('success:false → lanza error con el mensaje del backend', async () => {
    mockGet.mockReturnValue(axiosErr('Acceso denegado'));

    await expect(adminApi.getTenants()).rejects.toThrow('Acceso denegado');
  });

  it('success:true pero data:undefined → lanza error genérico', async () => {
    mockGet.mockReturnValue(Promise.resolve({ data: { success: true, data: undefined } }));

    await expect(adminApi.getTenants()).rejects.toThrow();
  });

  it('error sin message → usa mensaje de fallback', async () => {
    mockGet.mockReturnValue(Promise.resolve({ data: { success: false } }));

    await expect(adminApi.getTenants()).rejects.toThrow('Error en respuesta de admin');
  });
});

// ─────────────────────────────────────────────────────────────
// getStats
// ─────────────────────────────────────────────────────────────

describe('getStats', () => {
  it('llama GET /admin/stats y retorna los stats', async () => {
    const stats = { tenants: { total: 3, active: 2 }, revenue: 5000 };
    mockGet.mockReturnValue(axiosOk(stats));

    const result = await adminApi.getStats();
    expect(mockGet).toHaveBeenCalledWith('/admin/stats');
    expect(result).toEqual(stats);
  });
});

// ─────────────────────────────────────────────────────────────
// getTenants
// ─────────────────────────────────────────────────────────────

describe('getTenants', () => {
  it('llama GET /admin/tenants', async () => {
    mockGet.mockReturnValue(axiosOk([]));
    await adminApi.getTenants();
    expect(mockGet).toHaveBeenCalledWith('/admin/tenants');
  });
});

// ─────────────────────────────────────────────────────────────
// getTenantById
// ─────────────────────────────────────────────────────────────

describe('getTenantById', () => {
  it('llama GET /admin/tenants/:id con el ID correcto', async () => {
    mockGet.mockReturnValue(axiosOk({ id: 'tenant-001' }));
    await adminApi.getTenantById('tenant-001');
    expect(mockGet).toHaveBeenCalledWith('/admin/tenants/tenant-001');
  });
});

// ─────────────────────────────────────────────────────────────
// createTenant
// ─────────────────────────────────────────────────────────────

describe('createTenant', () => {
  it('llama POST /admin/tenants con el body correcto', async () => {
    const body = { name: 'New', slug: 'new', mpMode: 'sandbox' };
    mockPost.mockReturnValue(axiosOk({ id: 't2', ...body }));

    await adminApi.createTenant(body);
    expect(mockPost).toHaveBeenCalledWith('/admin/tenants', body);
  });
});

// ─────────────────────────────────────────────────────────────
// updateTenant
// ─────────────────────────────────────────────────────────────

describe('updateTenant', () => {
  it('llama PATCH /admin/tenants/:id con los datos', async () => {
    const updates = { name: 'Updated', mpMode: 'production' };
    mockPatch.mockReturnValue(axiosOk({ id: 'tenant-001', ...updates }));

    await adminApi.updateTenant('tenant-001', updates);
    expect(mockPatch).toHaveBeenCalledWith('/admin/tenants/tenant-001', updates);
  });
});

// ─────────────────────────────────────────────────────────────
// regenerateKey
// ─────────────────────────────────────────────────────────────

describe('regenerateKey', () => {
  it('llama POST /admin/tenants/:id/regenerate-key', async () => {
    mockPost.mockReturnValue(axiosOk({ apiKey: 'sk_new_abc123' }));

    const result = await adminApi.regenerateKey('tenant-001');
    expect(mockPost).toHaveBeenCalledWith('/admin/tenants/tenant-001/regenerate-key');
    expect(result.apiKey).toBe('sk_new_abc123');
  });
});

// ─────────────────────────────────────────────────────────────
// getUsers
// ─────────────────────────────────────────────────────────────

describe('getUsers', () => {
  it('llama GET /admin/users sin params', async () => {
    mockGet.mockReturnValue(axiosOk({ users: [], total: 0, page: 1, limit: 50, pages: 0 }));

    await adminApi.getUsers();
    expect(mockGet).toHaveBeenCalledWith('/admin/users', { params: undefined });
  });

  it('llama GET /admin/users con params de paginación', async () => {
    mockGet.mockReturnValue(axiosOk({ users: [], total: 0, page: 2, limit: 10, pages: 0 }));

    await adminApi.getUsers({ page: 2, limit: 10 });
    expect(mockGet).toHaveBeenCalledWith('/admin/users', { params: { page: 2, limit: 10 } });
  });
});

// ─────────────────────────────────────────────────────────────
// createUser
// ─────────────────────────────────────────────────────────────

describe('createUser', () => {
  it('llama POST /admin/users con el body', async () => {
    const body = { tenantId: 't1', email: 'u@t.pe', name: 'User', password: 'Pass1!' };
    mockPost.mockReturnValue(axiosOk({ id: 'u1', ...body }));

    await adminApi.createUser(body);
    expect(mockPost).toHaveBeenCalledWith('/admin/users', body);
  });
});

// ─────────────────────────────────────────────────────────────
// toggleUser
// ─────────────────────────────────────────────────────────────

describe('toggleUser', () => {
  it('llama PATCH /admin/users/:id/toggle', async () => {
    mockPatch.mockReturnValue(axiosOk({ isActive: false }));

    const result = await adminApi.toggleUser('user-001');
    expect(mockPatch).toHaveBeenCalledWith('/admin/users/user-001/toggle');
    expect(result.isActive).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// getPayments
// ─────────────────────────────────────────────────────────────

describe('getPayments', () => {
  it('llama GET /admin/payments sin filtros', async () => {
    mockGet.mockReturnValue(
      axiosOk({ payments: [], total: 0, page: 1, limit: 20, pages: 0 })
    );

    await adminApi.getPayments();
    expect(mockGet).toHaveBeenCalledWith('/admin/payments', { params: undefined });
  });

  it('llama GET /admin/payments con filtros de tenantId y status', async () => {
    mockGet.mockReturnValue(
      axiosOk({ payments: [], total: 0, page: 1, limit: 20, pages: 0 })
    );

    const params = { tenantId: 'tenant-001', status: 'APPROVED', page: 1, limit: 10 };
    await adminApi.getPayments(params);
    expect(mockGet).toHaveBeenCalledWith('/admin/payments', { params });
  });
});
