'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn, getUserRole } from '@/lib/auth';

export default function AuthGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [authorized, setAuthorized] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/login');
    } else {
      const role = getUserRole() || '';
      if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        setAuthorized(false);
      }
      setChecked(true);
    }
  }, [router, allowedRoles]);

  if (!checked) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0f172a', color: '#64748b', fontSize: '14px',
      }}>
        Checking authentication…
      </div>
    );
  }

  if (!authorized) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#f1f5f9' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⛔</div>
        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>Access Denied</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Your current role does not have permission to view this page.</p>
        <button className="btn btn-primary" onClick={() => router.push('/dashboard')}>Return to Dashboard</button>
      </div>
    );
  }

  return <>{children}</>;
}
