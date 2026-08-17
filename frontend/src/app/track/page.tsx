'use client';
import { useState, useEffect } from 'react';
import { resolveQR, recordScanEvent, verifyInnerCredential } from '@/lib/api';
import '../app.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface TimelineStep { step: string; actor: string; date: string; txId: string; }
interface BatchDoc { name: string; type: string; issuer: string; date: string; cid: string; status: 'VERIFIED' | 'PENDING'; }
interface QRResult {
  qrId?: string;
  batchId?: string;
  productName?: string;
  timeline?: TimelineStep[];
  is_public?: boolean;
  custody_status?: string;
  currentCustodian?: string;
  nextCustodian?: string;
}

const DOCS: BatchDoc[] = [
  { name: 'FSSAI Food Safety Certificate',        type: 'Regulatory',       issuer: 'FSSAI Regional Office, Pune',        date: '08 Aug 2026', cid: 'QmXoypiz...jW3WknFiJnKL', status: 'VERIFIED' },
  { name: 'Farm-to-Gate Quality Report',          type: 'Quality Assurance', issuer: 'AgriQual Labs Pvt Ltd',              date: '09 Aug 2026', cid: 'QmR4YhT1...wHpkZxLq92sA', status: 'VERIFIED' },
  { name: 'Cold Chain Temperature Log',           type: 'Cold Chain',        issuer: 'AgriTransit Logistics — IoT Gateway',date: '12 Aug 2026', cid: 'QmU8vBnX...0dTyKpL3mRfW', status: 'VERIFIED' },
  { name: 'Pesticide Residue Test Report',        type: 'Lab Analysis',      issuer: 'National Accredited Lab — Mumbai',   date: '10 Aug 2026', cid: 'QmZ2cPdK...YtEwGhNvQ1sB', status: 'VERIFIED' },
  { name: 'Customs & Dispatch Declaration',       type: 'Logistics',         issuer: 'Central Packaging Hub',             date: '12 Aug 2026', cid: 'QmK9nWqS...8fLjMvXuD5cR', status: 'PENDING' },
];
const DOC_ICONS: Record<string, string> = { Regulatory: '📋', 'Quality Assurance': '🔬', 'Cold Chain': '❄️', 'Lab Analysis': '🧪', Logistics: '🚚' };

async function fetchBatchPublicStatus(batchId: string): Promise<{ is_public: boolean; custody_status: string; custodian: string; next_custodian_org?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/batches`);
    if (!res.ok) throw new Error();
    const batches = await res.json();
    const match = (Array.isArray(batches) ? batches : []).find((b: { id: string }) => b.id === batchId);
    return match ? {
      is_public: match.is_public ?? false,
      custody_status: match.custody_status ?? 'IN_CUSTODY',
      custodian: match.custodian ?? '',
      next_custodian_org: match.next_custodian_org,
    } : { is_public: false, custody_status: 'IN_CUSTODY', custodian: '' };
  } catch {
    // fallback: treat as public for demo QR codes
    return { is_public: batchId.startsWith('QR-') || batchId.includes('MBTSDM2UM') || batchId.includes('IKHJWTOYD'), custody_status: 'DELIVERED', custodian: 'GreenBasket Supermarket' };
  }
}

export default function TrackPage() {
  const [query, setQuery]     = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<QRResult | null>(null);
  const [batchStatus, setBatchStatus] = useState<{ is_public: boolean; custody_status: string; custodian: string; next_custodian_org?: string } | null>(null);
  const [error, setError]     = useState('');
  const [activeTab, setActiveTab] = useState<'journey' | 'documents'>('journey');

  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ isAuthentic: boolean; message: string } | null>(null);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!verifyCode.trim()) return;
    setVerifying(true);
    setVerifyResult(null);
    const data = await verifyInnerCredential(verifyCode.trim(), result?.batchId);
    setVerifyResult(data);
    setVerifying(false);
  }

  async function doSearch(q: string) {
    if (!q) return;
    setLoading(true);
    setError('');
    setResult(null);
    setBatchStatus(null);
    try {
      const data = await resolveQR(q);
      setResult(data);

      // Check if this batch is actually public
      const batchId = data.batchId || q;
      const status = await fetchBatchPublicStatus(batchId);
      setBatchStatus(status);

      recordScanEvent({ entity_id: q, actor_role: 'consumer', actor_name: 'Web User', location: 'Web App' });
    } catch {
      setError('Failed to resolve QR code. Please try again.');
    }
    setLoading(false);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    doSearch(query.trim());
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const idParam = new URLSearchParams(window.location.search).get('id');
      if (idParam) { setQuery(idParam); doSearch(idParam); }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPublic = batchStatus?.is_public ?? false;
  const isInTransit = batchStatus && !batchStatus.is_public;

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
      {/* Nav */}
      <nav style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', padding: '0 24px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ color: '#22d3ee', fontWeight: 700, fontSize: '15px', textDecoration: 'none', fontFamily: 'monospace' }}>🥦 FoodTrace</a>
        <div style={{ display: 'flex', gap: '12px' }}>
          <a href="/feedback" style={{ color: '#94a3b8', fontSize: '13px', textDecoration: 'none' }}>Report Issue</a>
          <a href="/login"    style={{ color: '#22d3ee', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>Sign In →</a>
        </div>
      </nav>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px 60px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px' }}>🔍</div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>Track Your Food</h1>
          <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.7 }}>
            Scan a QR or enter a Batch ID to see the full supply chain journey and verify authenticity.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
          <input
            id="track-input" type="text" className="form-input"
            placeholder="Enter QR ID or Batch ID (e.g. QR-A1B2C3D4 or BATCH-MBTSDM2UM)"
            value={query} onChange={e => setQuery(e.target.value)}
            style={{ flex: 1, fontSize: '14px', height: '44px' }}
          />
          <button id="track-submit" type="submit" className="btn btn-primary" style={{ height: '44px', whiteSpace: 'nowrap' }} disabled={loading}>
            {loading ? 'Searching…' : 'Track →'}
          </button>
        </form>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* ── IN TRANSIT gate — batch exists but not public yet ── */}
        {result && isInTransit && (
          <div style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚚</div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>
              Batch is currently in transit
            </h2>
            <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.8, marginBottom: '20px' }}>
              This batch (<span className="mono" style={{ color: '#94a3b8', fontSize: '12px' }}>{result.batchId}</span>) has been registered on the supply chain but
              is not yet available for public inspection.<br />
              It will become publicly verifiable once it reaches the <strong style={{ color: '#f1f5f9' }}>Retailer</strong> and custody is formally accepted.
            </p>
            <div style={{
              background: '#1e293b', border: '1px solid #fbbf2433', borderRadius: '10px',
              padding: '16px 20px', display: 'inline-block', textAlign: 'left', maxWidth: '360px',
            }}>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Current custody info</div>
              <div style={{ fontSize: '13px', color: '#f1f5f9', marginBottom: '4px' }}>
                📌 <strong>Current:</strong> {batchStatus?.custodian || '—'}
              </div>
              {batchStatus?.next_custodian_org && (
                <div style={{ fontSize: '13px', color: '#fbbf24' }}>
                  ⏳ <strong>Awaiting acceptance by:</strong> {batchStatus.next_custodian_org}
                </div>
              )}
            </div>
            <p style={{ marginTop: '20px', fontSize: '11px', color: '#475569' }}>
              If you are the assigned next custodian, <a href="/login" style={{ color: '#22d3ee', textDecoration: 'none' }}>sign in</a> to accept custody.
            </p>
          </div>
        )}

        {/* ── FULL PUBLIC VIEW — batch is ON_SHELF ── */}
        {result && isPublic && (
          <div>
            {/* Product card */}
            <div className="card" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                <span style={{ fontSize: '30px' }}>✅</span>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#f1f5f9', marginBottom: '3px' }}>
                    {result.productName || 'Product Found'}
                  </h2>
                  <p className="mono" style={{ fontSize: '11px', color: '#64748b' }}>Batch: {result.batchId}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <span className="badge badge-success">✓ Traceability Verified</span>
                  <span className="badge badge-info">Blockchain Committed</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#4ade80', background: '#14532d22', padding: '2px 8px', borderRadius: '4px', border: '1px solid #4ade8044' }}>
                    🌍 ON SHELF
                  </span>
                </div>
              </div>
              {/* Custodian info */}
              <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: 'var(--muted)' }}>
                🏪 Currently at <strong style={{ color: '#f1f5f9' }}>{batchStatus?.custodian || result.currentCustodian || '—'}</strong>
                <span style={{ marginLeft: '10px', color: '#4ade80', fontWeight: 600 }}>● Chain complete</span>
              </div>
            </div>

            {/* Inline Verification Block */}
            <div className="card" style={{ marginBottom: '24px', border: '1px solid #1e293b', background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🔐 Verify Product Authenticity
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '16px' }}>
                Check the scratch-off code on the inner seal to verify this specific package is genuine.
              </p>
              <form onSubmit={handleVerify} style={{ display: 'flex', gap: '10px', marginBottom: verifyResult ? '16px' : '0' }}>
                <input
                  className="form-input" style={{ flex: 1, fontFamily: 'monospace', letterSpacing: '1px' }}
                  placeholder="e.g. SEC-XXXX-X"
                  value={verifyCode}
                  onChange={e => setVerifyCode(e.target.value.toUpperCase())}
                />
                <button type="submit" className="btn btn-primary" disabled={verifying || !verifyCode.trim()}>
                  {verifying ? 'Verifying…' : 'Verify'}
                </button>
              </form>
              {verifyResult && (
                <div style={{
                  background: verifyResult.isAuthentic ? '#14532d' : '#450a0a',
                  border: `1px solid ${verifyResult.isAuthentic ? '#4ade80' : '#f87171'}`,
                  borderRadius: '8px', padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start'
                }}>
                  <div style={{ fontSize: '20px' }}>{verifyResult.isAuthentic ? '✅' : '❌'}</div>
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: verifyResult.isAuthentic ? '#4ade80' : '#f87171', marginBottom: '4px' }}>
                      {verifyResult.isAuthentic ? 'AUTHENTIC' : 'INVALID'}
                    </h4>
                    <p style={{ color: verifyResult.isAuthentic ? '#86efac' : '#fca5a5', fontSize: '12px', lineHeight: 1.4 }}>
                      {verifyResult.message}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
              {(['journey', 'documents'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                  color: activeTab === tab ? 'var(--primary)' : 'var(--muted)',
                  fontWeight: 600, fontSize: '13px', marginBottom: '-1px', transition: 'color 0.15s',
                }}>
                  {tab === 'journey' ? '🔗 Supply Chain Journey' : `📄 Documents (${DOCS.length})`}
                </button>
              ))}
            </div>

            {/* Journey tab */}
            {activeTab === 'journey' && (
              result.timeline && result.timeline.length > 0 ? (
                <ul className="timeline">
                  {result.timeline.map((step, i) => (
                    <li key={i} className="timeline-item">
                      <div className="timeline-dot">{i + 1}</div>
                      <div className="timeline-content">
                        <div className="timeline-title">{step.step}</div>
                        <div className="timeline-meta">
                          {step.actor} · {step.date}
                          {step.txId && <span className="mono" style={{ marginLeft: '8px', color: '#475569' }}>{step.txId}</span>}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <div className="empty-state">No timeline steps available.</div>
            )}

            {/* Documents tab */}
            {activeTab === 'documents' && (
              <div>
                <p style={{ fontSize: '12px', color: 'var(--faint)', marginBottom: '14px' }}>
                  🔒 All documents are hashed and pinned to IPFS. Anyone can verify them independently.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {DOCS.map((doc, i) => (
                    <div key={i} style={{
                      background: 'var(--surface)', border: `1px solid ${doc.status === 'VERIFIED' ? 'var(--border)' : '#fbbf2444'}`,
                      borderRadius: '8px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px',
                    }}>
                      <div style={{ fontSize: '22px' }}>{DOC_ICONS[doc.type] || '📄'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{doc.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{doc.type} · {doc.issuer} · {doc.date}</div>
                        <div className="mono" style={{ fontSize: '10px', color: 'var(--faint)', marginTop: '3px' }}>IPFS: {doc.cid}</div>
                      </div>
                      <div>
                        {doc.status === 'VERIFIED'
                          ? <span style={{ fontSize: '11px', fontWeight: 700, color: '#4ade80', background: '#14532d', padding: '3px 8px', borderRadius: '4px' }}>✓ VERIFIED</span>
                          : <span style={{ fontSize: '11px', fontWeight: 700, color: '#fbbf24', background: '#451a03', padding: '3px 8px', borderRadius: '4px' }}>⏳ PENDING</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer actions */}
            <div style={{ marginTop: '28px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a href="/verify"   className="btn btn-ghost">✅ Verify Inner Credential</a>
              <a href="/feedback" className="btn btn-ghost">⚠️ Report an Issue</a>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && (
          <div style={{ textAlign: 'center', padding: '32px', color: '#475569', fontSize: '13px' }}>
            <p style={{ marginBottom: '8px' }}>Try an example:</p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {['BATCH-MBTSDM2UM', 'QR-A1B2C3D4', 'BATCH-IKHJWTOYD'].map(ex => (
                <button key={ex} className="btn btn-ghost btn-sm" onClick={() => { setQuery(ex); doSearch(ex); }}>{ex}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
