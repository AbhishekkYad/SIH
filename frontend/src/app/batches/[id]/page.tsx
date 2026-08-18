'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AuthGuard from '@/components/shared/AuthGuard';
import AppNav from '@/components/shared/AppNav';
import { fetchBatches, fetchLineage, fetchEvents, recordCustodyTransfer, generateQR } from '@/lib/api';
import '../../app.css';

interface Batch { id: string; productId: string; status: string; quantity: number; uom: string; custodian: string; date: string; }
interface LineageData { batch_id: string; parents: Array<{batch_id: string; state: string}>; children: Array<{batch_id: string; state: string}>; }
interface Event { id?: string; type?: string; actor_role?: string; entity_id?: string; batch_id?: string; actor_name?: string; from_actor?: string; to_actor?: string; location?: string; timestamp?: string; fabric_tx_id?: string; }

export default function BatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const batchId = decodeURIComponent(id);

  const [batch, setBatch] = useState<Batch | null>(null);
  const [lineage, setLineage] = useState<LineageData | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [custodyForm, setCustodyForm] = useState({ from_actor: '', to_actor: '', event_type: 'TRANSFER', location: '' });
  const [custodyMsg, setCustodyMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [submittingCustody, setSubmittingCustody] = useState(false);
  const [qrResult, setQrResult] = useState<string | null>(null);
  const [generatingQR, setGeneratingQR] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [allBatches, lin, evts] = await Promise.all([
        fetchBatches(),
        fetchLineage(batchId),
        fetchEvents(batchId),
      ]);
      const found = Array.isArray(allBatches) ? allBatches.find((b: Batch) => b.id === batchId) : null;
      setBatch(found || null);
      setLineage(lin);
      setEvents(Array.isArray(evts) ? evts : []);
      setLoading(false);
    }
    load();
  }, [batchId]);

  async function handleCustodySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!custodyForm.from_actor || !custodyForm.to_actor) {
      setCustodyMsg({ type: 'danger', text: 'From and To actor are required.' });
      return;
    }
    setSubmittingCustody(true);
    try {
      const res = await recordCustodyTransfer({ batch_id: batchId, ...custodyForm });
      if (res.status === 'success' || res.custody) {
        setCustodyMsg({ type: 'success', text: `Custody transfer recorded. TX: ${res.custody?.fabric_tx_id || '—'}` });
        const evts = await fetchEvents(batchId);
        setEvents(Array.isArray(evts) ? evts : []);
        setCustodyForm({ from_actor: '', to_actor: '', event_type: 'TRANSFER', location: '' });
      } else {
        setCustodyMsg({ type: 'danger', text: 'Transfer failed.' });
      }
    } catch {
      setCustodyMsg({ type: 'danger', text: 'An error occurred.' });
    }
    setSubmittingCustody(false);
  }

  async function handleGenerateQR() {
    setGeneratingQR(true);
    const res = await generateQR({ unit_id: batchId, public_reference: `QR-${batchId}` });
    if (res.qr?.qr_image_url) {
      setQrResult(res.qr.qr_image_url);
    }
    setGeneratingQR(false);
  }

  if (loading) return <AuthGuard><div className="app-page"><AppNav /><div className="loading">Loading batch…</div></div></AuthGuard>;

  return (
    <AuthGuard>
      <div className="app-page">
        <AppNav />
        <div className="app-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">📦 Batch Detail</h1>
              <p className="page-subtitle mono">{batchId}</p>
            </div>
            <a href="/batches" className="btn btn-ghost btn-sm">← All Batches</a>
          </div>

          {batch ? (
            <div className="card">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                {[
                  ['Batch ID', batch.id],
                  ['Product ID', batch.productId],
                  ['Status', batch.status],
                  ['Quantity', `${batch.quantity} ${batch.uom}`],
                  ['Custodian', batch.custodian],
                  ['Date', batch.date],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{k}</div>
                    <div style={{ fontSize: '13px', color: '#f1f5f9', fontFamily: 'monospace' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="alert alert-warning">Batch not found in current dataset. Showing lineage & events for: {batchId}</div>
          )}

          {/* Lineage */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div className="card">
              <h2 className="section-title">⬆️ Parent Batches</h2>
              {lineage?.parents?.length ? lineage.parents.map(p => (
                <div key={p.batch_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #334155' }}>
                  <a href={`/batches/${encodeURIComponent(p.batch_id)}`} className="mono" style={{ color: '#22d3ee', textDecoration: 'none' }}>{p.batch_id}</a>
                  <span className="badge badge-info">{p.state}</span>
                </div>
              )) : <div className="empty-state" style={{ padding: '16px', fontSize: '13px' }}>No parent batches</div>}
            </div>

            <div className="card">
              <h2 className="section-title">⬇️ Child Batches</h2>
              {lineage?.children?.length ? lineage.children.map(c => (
                <div key={c.batch_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #334155' }}>
                  <a href={`/batches/${encodeURIComponent(c.batch_id)}`} className="mono" style={{ color: '#22d3ee', textDecoration: 'none' }}>{c.batch_id}</a>
                  <span className="badge badge-warning">{c.state}</span>
                </div>
              )) : <div className="empty-state" style={{ padding: '16px', fontSize: '13px' }}>No child batches</div>}
            </div>
          </div>

          {/* Custody Transfer Form */}
          <div className="form-section">
            <h2 className="section-title">🔄 Record Custody Transfer</h2>
            {custodyMsg && <div className={`alert alert-${custodyMsg.type}`}>{custodyMsg.text}</div>}
            <form onSubmit={handleCustodySubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">From Actor *</label>
                  <input id="custody-from" className="form-input" value={custodyForm.from_actor} onChange={e => setCustodyForm(p => ({...p, from_actor: e.target.value}))} placeholder="Current custodian" />
                </div>
                <div className="form-group">
                  <label className="form-label">To Actor *</label>
                  <input id="custody-to" className="form-input" value={custodyForm.to_actor} onChange={e => setCustodyForm(p => ({...p, to_actor: e.target.value}))} placeholder="New custodian" />
                </div>
                <div className="form-group">
                  <label className="form-label">Event Type</label>
                  <select id="custody-type" className="form-select" value={custodyForm.event_type} onChange={e => setCustodyForm(p => ({...p, event_type: e.target.value}))}>
                    <option value="TRANSFER">TRANSFER</option>
                    <option value="HANDOVER">HANDOVER</option>
                    <option value="DELIVERY">DELIVERY</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input id="custody-location" className="form-input" value={custodyForm.location} onChange={e => setCustodyForm(p => ({...p, location: e.target.value}))} placeholder="e.g. Mumbai Warehouse" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button id="submit-custody" type="submit" className="btn btn-primary" disabled={submittingCustody}>
                  {submittingCustody ? 'Recording…' : '✓ Record Transfer'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={handleGenerateQR} disabled={generatingQR}>
                  {generatingQR ? 'Generating…' : '📱 Generate QR'}
                </button>
              </div>
            </form>
            {qrResult && (
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrResult} alt="Batch QR Code" style={{ border: '4px solid #1e293b', borderRadius: '8px' }} />
                <p style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>QR for batch {batchId}</p>
              </div>
            )}
          </div>

          {/* Events */}
          <h2 className="section-title">📋 Batch Events</h2>
          {events.length === 0 ? (
            <div className="empty-state">No events recorded for this batch.</div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Type</th><th>Actor</th><th>Location</th><th>Timestamp</th><th>Fabric TX</th></tr>
                </thead>
                <tbody>
                  {events.map((ev, i) => (
                    <tr key={i}>
                      <td><span className="badge badge-info">{ev.type || '—'}</span></td>
                      <td>{ev.actor_name || ev.from_actor || '—'}{ev.to_actor ? ` → ${ev.to_actor}` : ''}</td>
                      <td>{ev.location || '—'}</td>
                      <td className="mono">{ev.timestamp ? new Date(ev.timestamp).toLocaleString() : '—'}</td>
                      <td className="mono" style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.fabric_tx_id || '—'}</td>
                    </tr>
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
