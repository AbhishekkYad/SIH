'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, USER_REGISTRY, type RegisteredUser } from '@/lib/auth';
import '../app.css';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm]     = useState({ username: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      setError('Please fill in both fields.');
      return;
    }
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 300));
    const ok = login(form.username.trim(), form.password, '');
    if (!ok) {
      setError('Invalid username or password. Use a quick-login card below.');
      setLoading(false);
      return;
    }
    router.push('/dashboard');
  }

  function quickLogin(user: RegisteredUser) {
    login(user.username, user.password, user.role);
    router.push('/dashboard');
  }

  const roleColor: Record<string, string> = {
    FARMER:      '#4ade80',
    PROCESSOR:   '#818cf8',
    PACKAGER:    '#fbbf24',
    DISTRIBUTOR: '#22d3ee',
    RETAILER:    '#f472b6',
    REGULATOR:   '#fb923c',
    ADMIN:       '#f87171',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0f172a', fontFamily: 'Inter, sans-serif' }}>

      {/* Left — Login form */}
      <div style={{ flex: '0 0 420px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', borderRight: '1px solid #1e293b' }}>
        <div style={{ width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🥦</div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' }}>FoodTrace</h1>
            <p style={{ color: '#64748b', fontSize: '12px' }}>Food Supply Chain Intelligence Platform</p>
          </div>

          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '28px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#f1f5f9', marginBottom: '20px' }}>Sign In</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Username</label>
                <input
                  id="login-username" name="username" type="text"
                  className="form-input" placeholder="e.g. satyam"
                  value={form.username} onChange={handleChange} autoComplete="username"
                />
              </div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Password</label>
                <input
                  id="login-password" name="password" type="password"
                  className="form-input" placeholder="Enter password"
                  value={form.password} onChange={handleChange} autoComplete="current-password"
                />
              </div>
              <button id="login-submit" type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '12px', color: '#475569' }}>
            <a href="/" style={{ color: '#22d3ee', textDecoration: 'none' }}>← Landing Page</a>
            {' · '}
            <a href="/track" style={{ color: '#22d3ee', textDecoration: 'none' }}>Track QR (Public)</a>
          </p>
        </div>
      </div>

      {/* Right — Quick Login (DEMO — remove before production) */}
      <div style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9' }}>⚡ Quick Login</h2>
            <span style={{
              fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
              background: '#451a03', color: '#fbbf24', border: '1px solid #fbbf2444',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>Demo Only — Remove Before Production</span>
          </div>
          <p style={{ color: '#475569', fontSize: '12px', marginBottom: '24px' }}>
            Click any card to instantly log in as that stakeholder. Each user has a fixed role that determines
            what batches they can create, accept, and view.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '12px' }}>
            {USER_REGISTRY.map(u => (
              <button
                key={u.username}
                id={`quick-login-${u.username}`}
                onClick={() => quickLogin(u)}
                style={{
                  background: '#1e293b',
                  border: `1px solid ${roleColor[u.role] ?? '#334155'}33`,
                  borderRadius: '10px',
                  padding: '16px 18px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.15s, background 0.15s',
                  width: '100%',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#263346')}
                onMouseLeave={e => (e.currentTarget.style.background = '#1e293b')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>{u.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '14px' }}>{u.org}</div>
                    <div style={{
                      fontSize: '10px', fontWeight: 700,
                      color: roleColor[u.role] ?? '#94a3b8',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>
                      {u.role}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px', lineHeight: 1.5 }}>
                  {u.description}
                </p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <code style={{ fontSize: '11px', color: '#22d3ee', background: '#0f172a', padding: '2px 8px', borderRadius: '4px' }}>
                    {u.username}
                  </code>
                  <code style={{ fontSize: '11px', color: '#475569', background: '#0f172a', padding: '2px 8px', borderRadius: '4px' }}>
                    {u.password}
                  </code>
                </div>
              </button>
            ))}
          </div>

          {/* Chain flow diagram */}
          <div style={{ marginTop: '32px', background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '18px 20px' }}>
            <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
              Supply Chain Order
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {['🌾 Farmer', '⚙️ Processor', '📦 Packager', '🚚 Distributor', '🏪 Retailer', '→', '🌍 Public (QR Scan)'].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    fontSize: '11px',
                    color: step === '→' ? '#475569' : step.includes('Public') ? '#4ade80' : '#94a3b8',
                    background: step === '→' || step.includes('Public') ? 'transparent' : '#263346',
                    padding: step === '→' ? '0' : '3px 10px',
                    borderRadius: '12px',
                    fontWeight: 600,
                  }}>
                    {step}
                  </span>
                  {i < 5 && i !== 4 && <span style={{ color: '#334155', fontSize: '14px' }}>→</span>}
                  {i === 4 && <span style={{ color: '#334155', fontSize: '14px' }}>→</span>}
                </div>
              ))}
            </div>
            <p style={{ fontSize: '11px', color: '#475569', marginTop: '10px' }}>
              Retailer is the <strong style={{ color: '#f1f5f9' }}>chain terminus</strong> — once they accept custody the batch is marked
              <strong style={{ color: '#4ade80' }}> ON_SHELF</strong> and the QR becomes publicly scannable by consumers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
