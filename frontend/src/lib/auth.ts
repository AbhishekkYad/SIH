// ── User Registry ─────────────────────────────────────────────
// TODO: Replace with real JWT auth from backend when auth service is ready.
// For now this is a client-side registry used for demo / internal mock.

export interface RegisteredUser {
  username:    string;
  password:    string;
  role:        'FARMER' | 'PROCESSOR' | 'PACKAGER' | 'DISTRIBUTOR' | 'RETAILER' | 'REGULATOR' | 'ADMIN';
  org:         string;   // display name used as custodian label
  icon:        string;
  description: string;
}

export const USER_REGISTRY: RegisteredUser[] = [
  {
    username:    'ramesh',
    password:    'ramesh123',
    role:        'FARMER',
    org:         'Ramesh Patil Farm',
    icon:        '🌾',
    description: 'Origin farmer — registers harvest batches',
  },
  {
    username:    'sahyadri',
    password:    'sahyadri123',
    role:        'PROCESSOR',
    org:         'Sahyadri Milling Co.',
    icon:        '⚙️',
    description: 'Processor — mills and transforms raw produce',
  },
  {
    username:    'packager',
    password:    'pack123',
    role:        'PACKAGER',
    org:         'Central Packaging Hub',
    icon:        '📦',
    description: 'Packager — seals, labels, and prints QR units',
  },
  {
    username:    'satyam',
    password:    'satyam123',
    role:        'DISTRIBUTOR',
    org:         'AgriTransit Logistics',
    icon:        '🚚',
    description: 'Distributor — transports batch to retail',
  },
  {
    username:    'greenbasket',
    password:    'green123',
    role:        'RETAILER',
    org:         'GreenBasket Supermarket',
    icon:        '🏪',
    description: 'Retailer — final shelf holder (chain terminus)',
  },
  {
    username:    'fssai',
    password:    'fssai123',
    role:        'REGULATOR',
    org:         'FSSAI Regional Office',
    icon:        '🏛️',
    description: 'Regulator — read-only audit and compliance',
  },
  {
    username:    'admin',
    password:    'admin123',
    role:        'ADMIN',
    org:         'FoodTrace Platform',
    icon:        '🛡️',
    description: 'Platform admin — full system access',
  },
];

// ── Auth Helpers ──────────────────────────────────────────────
const TOKEN_KEY    = 'ft_token';
const ROLE_KEY     = 'ft_role';
const USERNAME_KEY = 'ft_username';
const ORG_KEY      = 'ft_org';

export function findUser(username: string, password: string): RegisteredUser | null {
  return USER_REGISTRY.find(
    u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  ) ?? null;
}

export function login(username: string, password: string, role: string): boolean {
  const user = findUser(username, password);
  if (!user) return false;
  const fakeToken = `ft-jwt-${user.username}-${user.role}-${Date.now()}`;
  localStorage.setItem(TOKEN_KEY,    fakeToken);
  localStorage.setItem(ROLE_KEY,     user.role);
  localStorage.setItem(USERNAME_KEY, user.username);
  localStorage.setItem(ORG_KEY,      user.org);
  return true;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function getUserRole(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(ROLE_KEY) || '';
}

export function getUserName(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(USERNAME_KEY) || '';
}

export function getUserOrg(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(ORG_KEY) || '';
}

export function getFullUser(): RegisteredUser | null {
  const username = getUserName();
  if (!username) return null;
  return USER_REGISTRY.find(u => u.username === username) ?? null;
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(ORG_KEY);
}
