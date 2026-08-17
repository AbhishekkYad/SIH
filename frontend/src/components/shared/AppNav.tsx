'use client';
import { useRouter, usePathname } from 'next/navigation';
import { getUserName, getUserRole, clearToken } from '@/lib/auth';

const NAV_LINKS = [
  { href: '/dashboard', label: '📊 Dashboard', roles: ['ALL'] },
  { href: '/products', label: '🌾 Products', roles: ['ADMIN', 'FARMER', 'PROCESSOR'] },
  { href: '/batches', label: '📦 Batches', roles: ['ALL'] },
  { href: '/units', label: '🔖 Units', roles: ['ADMIN', 'PACKAGER'] },
  { href: '/incidents', label: '⚠️ Incidents', roles: ['ADMIN', 'REGULATOR', 'RETAILER'] },
  { href: '/events', label: '📋 Events', roles: ['ADMIN', 'REGULATOR'] },
  { href: '/track', label: '🔍 Track QR', roles: ['ALL'] },
  { href: '/feedback', label: '💬 Feedback', roles: ['ALL'] },
  { href: '/admin/risk', label: '🚨 Risk', roles: ['ADMIN', 'REGULATOR'] },
  { href: '/admin/recalls', label: '🔴 Recalls', roles: ['ADMIN', 'REGULATOR'] },
];

export default function AppNav() {
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    clearToken();
    router.push('/');
  }

  const username = getUserName();
  const role = getUserRole();

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', height: '56px', background: '#0f172a',
      borderBottom: '1px solid #1e293b', position: 'sticky', top: 0, zIndex: 100,
      flexWrap: 'wrap', gap: '8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <span style={{ fontSize: '20px' }}>🥦</span>
        <span style={{ color: '#22d3ee', fontWeight: 700, fontSize: '15px', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
          FoodTrace
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap' }}>
        {NAV_LINKS.filter(link => link.roles.includes('ALL') || link.roles.includes(role || '')).map(link => (
          <a
            key={link.href}
            href={link.href}
            style={{
              padding: '4px 10px', borderRadius: '6px', fontSize: '12px',
              color: pathname.startsWith(link.href) ? '#22d3ee' : '#94a3b8',
              background: pathname.startsWith(link.href) ? '#1e3a5f' : 'transparent',
              textDecoration: 'none', fontWeight: pathname.startsWith(link.href) ? 600 : 400,
              transition: 'all 0.15s',
            }}
          >
            {link.label}
          </a>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#f1f5f9', fontSize: '12px', fontWeight: 600 }}>{username}</div>
          <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{role}</div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: '#1e293b', color: '#94a3b8', border: '1px solid #334155',
            borderRadius: '6px', padding: '4px 12px', fontSize: '12px', cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
