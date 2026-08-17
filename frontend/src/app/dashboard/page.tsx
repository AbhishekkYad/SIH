'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/shared/AuthGuard';
import AppNav from '@/components/shared/AppNav';
import { fetchDashboardMetrics } from '@/lib/api';
import '../app.css';

interface Metrics {
  total_products: number;
  total_batches: number;
  total_units: number;
  in_transit: number;
  quarantined: number;
  open_incidents: number;
  total_scans: number;
  total_custody_transfers: number;
  traceability_coverage: string;
  compliance_rate: string;
  recent_events: Array<Record<string, unknown>>;
}

const QUICK_LINKS = [
  { href: '/products', icon: '🌾', label: 'Products' },
  { href: '/batches', icon: '📦', label: 'Batches' },
  { href: '/units', icon: '🔖', label: 'Units' },
  { href: '/incidents', icon: '⚠️', label: 'Incidents' },
  { href: '/events', icon: '📋', label: 'Events' },
  { href: '/track', icon: '🔍', label: 'Track QR' },
  { href: '/verify', icon: '✅', label: 'Verify Credential' },
  { href: '/feedback', icon: '💬', label: 'Feedback' },
  { href: '/admin/risk', icon: '🚨', label: 'Risk Propagator' },
  { href: '/admin/recalls', icon: '🔴', label: 'Issue Recall' },
];

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardMetrics().then(data => {
      setMetrics(data);
      setLoading(false);
    });
  }, []);

  const stats = metrics ? [
    { label: 'Total Products', value: metrics.total_products, color: '#22d3ee' },
    { label: 'Total Batches', value: metrics.total_batches, color: '#22d3ee' },
    { label: 'Total Units', value: metrics.total_units, color: '#22d3ee' },
    { label: 'In Transit', value: metrics.in_transit, color: '#fbbf24' },
    { label: 'Open Incidents', value: metrics.open_incidents, color: '#f87171' },
    { label: 'Quarantined', value: metrics.quarantined, color: '#f87171' },
    { label: 'Traceability', value: metrics.traceability_coverage, color: '#4ade80' },
    { label: 'Compliance Rate', value: metrics.compliance_rate, color: '#4ade80' },
  ] : [];

  return (
    <AuthGuard>
      <div className="app-page">
        <AppNav />
        <div className="app-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">Dashboard</h1>
              <p className="page-subtitle">Supply chain operational overview</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => {
              setLoading(true);
              fetchDashboardMetrics().then(d => { setMetrics(d); setLoading(false); });
            }}>
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading metrics…</div>
          ) : (
            <>
              <div className="stat-grid">
                {stats.map(s => (
                  <div key={s.label} className="stat-card">
                    <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              <h2 className="section-title">Quick Navigation</h2>
              <div className="quick-nav">
                {QUICK_LINKS.map(l => (
                  <a key={l.href} href={l.href} className="quick-nav-card">
                    <span className="nav-icon">{l.icon}</span>
                    {l.label}
                  </a>
                ))}
              </div>

              {metrics && metrics.recent_events.length > 0 && (
                <>
                  <h2 className="section-title">Recent Events</h2>
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Entity</th>
                          <th>Actor</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metrics.recent_events.map((ev, i) => (
                          <tr key={i}>
                            <td><span className="badge badge-info">{String(ev.type || ev.actor_role || '—')}</span></td>
                            <td className="mono">{String(ev.entity_id || ev.batch_id || '—')}</td>
                            <td>{String(ev.actor_name || ev.from_actor || '—')}</td>
                            <td className="mono">{String(ev.timestamp ? new Date(ev.timestamp as string).toLocaleString() : '—')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
