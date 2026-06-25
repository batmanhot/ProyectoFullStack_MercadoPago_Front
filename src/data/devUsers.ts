// Usuarios disponibles en modo desarrollo (coinciden con prisma/seed.ts)
// Este archivo SOLO se importa cuando import.meta.env.DEV === true
// Las passwords aquí son las del seed de desarrollo — nunca de producción.

export interface DevUser {
  tenant:   string;
  email:    string;
  password: string;
  role:     'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR';
  label:    string;
  color:    string;
}

// Leemos desde variables de entorno si están definidas (opcional),
// o usamos los valores del seed como fallback de desarrollo.
const DEV_PWD_ADMIN     = import.meta.env.VITE_DEV_PWD_ADMIN     ?? 'Admin123!';
const DEV_PWD_OPERATOR  = import.meta.env.VITE_DEV_PWD_OPERATOR  ?? 'Operator123!';
const DEV_PWD_SUPERADMIN = import.meta.env.VITE_DEV_PWD_SUPERADMIN ?? 'SuperAdmin123!';

export const DEV_USERS: DevUser[] = [
  {
    tenant:   'demo-store',
    email:    'admin@demo-store.pe',
    password: DEV_PWD_ADMIN,
    role:     'ADMIN',
    label:    'Admin · Demo Store',
    color:    'blue',
  },
  {
    tenant:   'demo-store',
    email:    'operador@demo-store.pe',
    password: DEV_PWD_OPERATOR,
    role:     'OPERATOR',
    label:    'Operador · Demo Store',
    color:    'green',
  },
  {
    tenant:   'tienda-ropa',
    email:    'admin@tienda-ropa.pe',
    password: DEV_PWD_ADMIN,
    role:     'ADMIN',
    label:    'Admin · Tienda Ropa',
    color:    'purple',
  },
  {
    tenant:   'demo-store',
    email:    'superadmin@system.pe',
    password: DEV_PWD_SUPERADMIN,
    role:     'SUPER_ADMIN',
    label:    'Super Admin · Sistema',
    color:    'red',
  },
];
