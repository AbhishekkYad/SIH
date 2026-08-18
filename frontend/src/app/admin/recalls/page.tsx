'use client';
import { useState } from 'react';
import AuthGuard from '@/components/shared/AuthGuard';
import AppNav from '@/components/shared/AppNav';
import { issueRecall } from '@/lib/api';
import '../../app.css';

interface RecallResult { status: string; recall_id: string; scope?: unknown; batches_blocked?: number; message?: string; }

export default function RecallsPage() {
  const [form, setForm] = useState({ batch_id: '', reason: '' });
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<RecallResult | null>(null);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!form.batch_id.trim()) { setError('Batch ID is required.'); return; }
    setError('');
    setConfirming(true);
  }

  async function handleIssue() {
    setSubmitting(true);
    setError('');
    try {
      const res = await issueRecall({ scope: { batch_id: form.batch_id.trim() }, reason: form.reason });
      setResult(res);
      setConfirming(false);
    } catch {
      setError('Recall issuance failed.');
    }
    setSubmitting(false);
  }

  return (
    <AuthGuard allowedRoles={['ADMIN', 'REGULATOR']}>
      <div className="app-page">
        <AppNav />
        <div className="app-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">🔴 Issue Recall</h1>
              <p className="page-subtitle">Issue an official batch block or targeted product recall order</p>
            </div>
          </div>

          <div className="alert alert-danger">
            <strong>⚠️ CRITICAL ACTION:</strong> Issuing a recall will block the specified batch and all downstream batches on the Hyperledger Fabric blockchain. This action is irreversible and will trigger immediate notifications to all affected stakeholders.
          </div>

          {result ? (
            <div>
              <div style={{ background: '#14532d', border: '2px solid #4ade80', borderRadius: '12px', padding: '28px', textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#4ade80', marginBottom: '8px' }}>Recall Issued</h2>
                <div style={{ background: '#0f172a', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '12px', textAlign: 'left', marginTop: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div><div style={{ color: '#64748b', marginBottom: '4px' }}>Recall ID</div><div style={{ color: '#4ade80' }}>{result.recall_id}</div></div>
                    <div><div style={{ color: '#64748b', marginBottom: '4px' }}>Batches Blocked</div><div style={{ color: '#f87171' }}>{result.batches_blocked ?? 0}</div></div>
                  </div>
                  {result.message && <div style={{ marginTop: '12px', color: '#94a3b8', borderTop: '1px solid #1e293b', paddingTop: '12px' }}>{result.message}</div>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-ghost" onClick={() => { setResult(null); setForm({ batch_id: '', reason: '' }); }}>
                  Issue Another Recall
                </button>
                <a href="/incidents" className="btn btn-ghost">View Incidents</a>
              </div>
            </div>
          ) : confirming ? (
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f87171', marginBottom: '16px' }}>⚠️ Confirm Recall Issuance</h2>
              <div style={{ background: '#0f172a', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '13px', marginBottom: '20px' }}>
                <div style={{ marginBottom: '8px' }}><span style={{ color: '#64748b' }}>Batch ID:</span> <span style={{ color: '#f1f5f9' }}>{form.batch_id}</span></div>
                <div><span style={{ color: '#64748b' }}>Reason:</span> <span style={{ color: '#f1f5f9' }}>{form.reason || '(none provided)'}</span></div>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>
                Are you absolutely sure you want to issue this recall? This will commit a transaction to the Hyperledger Fabric blockchain and block all downstream batches.
              </p>
              {error && <div className="alert alert-danger">{error}</div>}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button id="confirm-recall" className="btn btn-danger" onClick={handleIssue} disabled={submitting}>
                  {submitting ? 'Issuing…' : '🔴 Confirm & Issue Recall'}
                </button>
                <button className="btn btn-ghost" onClick={() => setConfirming(false)} disabled={submitting}>
                  ← Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="form-section">
              <h2 className="section-title">Recall Parameters</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleConfirm}>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Target Batch ID *</label>
                  <input id="recall-batch-id" name="batch_id" className="form-input" value={form.batch_id} onChange={handleChange} placeholder="e.g. BATCH-MBTSDM2UM" />
                </div>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Official Reason</label>
                  <textarea id="recall-reason" name="reason" className="form-textarea" value={form.reason} onChange={handleChange} placeholder="e.g. Lab analysis confirmed pesticide contamination exceeding safe limits." />
                </div>
                <button id="recall-proceed" type="submit" className="btn btn-danger">
                  🔴 Proceed to Confirm
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
