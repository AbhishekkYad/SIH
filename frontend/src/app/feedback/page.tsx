'use client';
import { useState } from 'react';
import { submitConsumerFeedback } from '@/lib/api';
import '../app.css';

const CATEGORIES = ['Spoilage', 'Contamination', 'Mislabeling', 'Packaging Damage', 'Foreign Object', 'Other'];

interface FeedbackResult { status: string; incidentId: string; ipfsCid: string; message: string; }

export default function FeedbackPage() {
  const [form, setForm] = useState({ unitId: '', category: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<FeedbackResult | null>(null);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.category || !form.description.trim()) {
      setError('Category and description are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await submitConsumerFeedback({
        unitId: form.unitId.trim() || 'UNKNOWN',
        category: form.category,
        description: form.description,
      });
      setResult(res);
    } catch {
      setError('Failed to submit feedback. Please try again.');
    }
    setSubmitting(false);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
      <nav style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', padding: '0 24px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ color: '#22d3ee', fontWeight: 700, fontSize: '15px', textDecoration: 'none', fontFamily: 'monospace' }}>🥦 FoodTrace</a>
        <div style={{ display: 'flex', gap: '12px' }}>
          <a href="/track" style={{ color: '#94a3b8', fontSize: '13px', textDecoration: 'none' }}>Track QR</a>
          <a href="/verify" style={{ color: '#94a3b8', fontSize: '13px', textDecoration: 'none' }}>Verify</a>
          <a href="/login" style={{ color: '#22d3ee', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>Sign In →</a>
        </div>
      </nav>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '60px 24px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#f1f5f9', marginBottom: '10px' }}>
            Report a Food Safety Issue
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6 }}>
            Your complaint is immediately hashed to IPFS, stored immutably, and escalated to the responsible organization and food safety regulator.
          </p>
        </div>

        {result ? (
          <div>
            <div style={{ background: '#14532d', border: '2px solid #4ade80', borderRadius: '12px', padding: '28px', textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#4ade80', marginBottom: '8px' }}>Report Submitted</h2>
              <p style={{ color: '#86efac', fontSize: '13px', marginBottom: '16px' }}>{result.message}</p>
              <div style={{ background: '#0f172a', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '12px', textAlign: 'left' }}>
                <div style={{ color: '#64748b', marginBottom: '4px' }}>Incident ID</div>
                <div style={{ color: '#22d3ee', marginBottom: '10px' }}>{result.incidentId}</div>
                <div style={{ color: '#64748b', marginBottom: '4px' }}>IPFS CID</div>
                <div style={{ color: '#94a3b8', wordBreak: 'break-all' }}>{result.ipfsCid}</div>
              </div>
            </div>
            <div className="alert alert-info">
              🔍 Regulators have been notified. This report is permanently stored on the blockchain and cannot be deleted or modified.
            </div>
            <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => { setResult(null); setForm({ unitId: '', category: '', description: '' }); }}>
              Submit Another Report
            </button>
          </div>
        ) : (
          <div className="form-section">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Unit ID (optional)</label>
                <input id="feedback-unitId" name="unitId" className="form-input" value={form.unitId} onChange={handleChange} placeholder="e.g. UNIT-1002 (leave blank if unknown)" />
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Issue Category *</label>
                <select id="feedback-category" name="category" className="form-select" value={form.category} onChange={handleChange}>
                  <option value="">Select issue type…</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Description *</label>
                <textarea
                  id="feedback-description"
                  name="description"
                  className="form-textarea"
                  style={{ minHeight: '120px' }}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Please describe the issue in detail. Include batch/product info if visible on packaging."
                />
              </div>
              <button id="feedback-submit" type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? 'Submitting…' : '🚨 Submit Report'}
              </button>
            </form>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#475569' }}>
          <a href="/track" style={{ color: '#22d3ee', textDecoration: 'none' }}>← Track QR Code</a>
          {' · '}
          <a href="/verify" style={{ color: '#22d3ee', textDecoration: 'none' }}>Verify Authenticity</a>
        </p>
      </div>
    </div>
  );
}
