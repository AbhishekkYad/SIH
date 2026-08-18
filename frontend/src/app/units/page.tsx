'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/shared/AuthGuard';
import AppNav from '@/components/shared/AppNav';
import { fetchUnits, generateUnits, generateQR } from '@/lib/api';
import '../app.css';

interface Unit { id: string; batchId: string; status: string; outerQR: string; innerCredential: string; date: string; }

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ batchId: '', count: '1' });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const data = await fetchUnits();
    setUnits(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.batchId || !form.count) { setMsg({ type: 'danger', text: 'All fields required.' }); return; }
    const count = Math.min(Math.max(1, Number(form.count)), 100);
    setSubmitting(true);
    try {
      const res = await generateUnits({ batchId: form.batchId, count });
      const newUnits = res.units || (res.unit ? [res.unit] : []);
      if (newUnits.length > 0) {
        setUnits(prev => [...newUnits, ...prev]);
        setMsg({ type: 'success', text: `${newUnits.length} unit(s) generated successfully.` });
        setForm({ batchId: '', count: '1' });
        setShowForm(false);
      } else {
        setMsg({ type: 'danger', text: 'No units returned.' });
      }
    } catch {
      setMsg({ type: 'danger', text: 'An error occurred.' });
    }
    setSubmitting(false);
  }

  async function showQR(unit: Unit) {
    if (qrImages[unit.id]) { setQrImages(prev => { const n = {...prev}; delete n[unit.id]; return n; }); return; }
    const res = await generateQR({ unit_id: unit.id, public_reference: unit.outerQR });
    if (res.qr?.qr_image_url) setQrImages(prev => ({ ...prev, [unit.id]: res.qr.qr_image_url }));
  }

  function copyToClipboard(text: string, unitId: string) {
    navigator.clipboard.writeText(text);
    setCopied(unitId);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <AuthGuard allowedRoles={['ADMIN', 'PACKAGER']}>
      <div className="app-page">
        <AppNav />
        <div className="app-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">🔖 Units</h1>
              <p className="page-subtitle">Serialized unit registry ({units.length} total)</p>
            </div>
            <button id="toggle-generate-units" className="btn btn-primary" onClick={() => { setShowForm(v => !v); setMsg(null); }}>
              {showForm ? '✕ Cancel' : '+ Generate Units'}
            </button>
          </div>

          {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

          {showForm && (
            <div className="form-section">
              <h2 className="section-title">Generate New Units</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Batch ID *</label>
                    <input id="unit-batchId" className="form-input" value={form.batchId} onChange={e => setForm(p => ({...p, batchId: e.target.value}))} placeholder="e.g. BATCH-MBTSDM2UM" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Count (1–100) *</label>
                    <input id="unit-count" type="number" min="1" max="100" className="form-input" value={form.count} onChange={e => setForm(p => ({...p, count: e.target.value}))} />
                  </div>
                </div>
                <button id="submit-generate-units" type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Generating…' : '⚡ Generate'}
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <div className="loading">Loading units…</div>
          ) : units.length === 0 ? (
            <div className="empty-state">No units found. Generate some above.</div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Unit ID</th>
                    <th>Batch ID</th>
                    <th>Status</th>
                    <th>Outer QR</th>
                    <th>Inner Credential</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map(u => (
                    <>
                      <tr key={u.id}>
                        <td className="mono">{u.id}</td>
                        <td className="mono">{u.batchId}</td>
                        <td><span className="badge badge-success">{u.status}</span></td>
                        <td className="mono">{u.outerQR}</td>
                        <td>
                          <span className="mono">{u.innerCredential}</span>{' '}
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '2px 6px', fontSize: '11px' }}
                            onClick={() => copyToClipboard(u.innerCredential, u.id)}
                          >
                            {copied === u.id ? '✓' : '📋'}
                          </button>
                        </td>
                        <td className="mono">{u.date}</td>
                        <td>
                          <button className="btn btn-ghost btn-sm" onClick={() => showQR(u)}>
                            {qrImages[u.id] ? '❌ QR' : '📱 QR'}
                          </button>
                        </td>
                      </tr>
                      {qrImages[u.id] && (
                        <tr key={`${u.id}-qr`}>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '16px', background: '#263346' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={qrImages[u.id]} alt={`QR for ${u.id}`} style={{ borderRadius: '8px', border: '4px solid #1e293b' }} />
                            <p style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>Scan: {u.outerQR}</p>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
