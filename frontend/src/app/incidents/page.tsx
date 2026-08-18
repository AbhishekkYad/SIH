'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/shared/AuthGuard';
import AppNav from '@/components/shared/AppNav';
import { fetchIncidents } from '@/lib/api';
import '../app.css';

interface Incident { id: string; unitId: string; category: string; reporter: string; status: string; ipfsCid: string; date: string; }

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { NEW: 'badge-danger', OPEN: 'badge-warning', RESOLVED: 'badge-success', CLOSED: 'badge-muted' };
  return <span className={`badge ${map[status] || 'badge-muted'}`}>{status}</span>;
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents().then(data => {
      setIncidents(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  return (
    <AuthGuard allowedRoles={['ADMIN', 'REGULATOR', 'RETAILER']}>
      <div className="app-page">
        <AppNav />
        <div className="app-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">⚠️ Incidents</h1>
              <p className="page-subtitle">Consumer complaints & food safety incidents ({incidents.length} total)</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => {
              setLoading(true);
              fetchIncidents().then(d => { setIncidents(Array.isArray(d) ? d : []); setLoading(false); });
            }}>🔄 Refresh</button>
          </div>

          {loading ? (
            <div className="loading">Loading incidents…</div>
          ) : incidents.length === 0 ? (
            <div className="empty-state">No incidents found. 🎉</div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Incident ID</th>
                    <th>Unit ID</th>
                    <th>Category</th>
                    <th>Reporter</th>
                    <th>Status</th>
                    <th>IPFS CID</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map(inc => (
                    <tr key={inc.id}>
                      <td className="mono" style={{ color: '#f87171' }}>{inc.id}</td>
                      <td className="mono">{inc.unitId}</td>
                      <td><span className="badge badge-warning">{inc.category}</span></td>
                      <td>{inc.reporter}</td>
                      <td><StatusBadge status={inc.status} /></td>
                      <td>
                        <span className="mono" style={{ fontSize: '11px', wordBreak: 'break-all', maxWidth: '180px', display: 'inline-block' }}>
                          {inc.ipfsCid}
                        </span>
                      </td>
                      <td className="mono">{inc.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="alert alert-info" style={{ marginTop: '12px' }}>
            <strong>Note:</strong> All incidents are immutably stored with their IPFS content hash. The responsible organization has been notified via the incident escalation pipeline.
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
