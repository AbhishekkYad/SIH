'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/shared/AuthGuard';
import AppNav from '@/components/shared/AppNav';
import { fetchBatches, createBatch, acceptCustody, assignNextCustodian, fetchUsers, fetchProducts } from '@/lib/api';
import { getUserName, getUserOrg, getUserRole } from '@/lib/auth';
import '../app.css';

interface Batch {
  id: string;
  productId: string;
  status: string;
  quantity: number;
  uom: string;
  custodian: string;
  next_custodian_username?: string;
  next_custodian_org?: string;
  custody_status?: string;
  is_public?: boolean;
  parent_batch_ids?: string[];
  date: string;
}
interface User { username: string; role: string; org: string; }

const UOMS = ['KG', 'LITERS', 'UNITS', 'TONS', 'GRAMS', 'ML'];

const STATUS_CLASS: Record<string, string> = {
  IN_TRANSIT:  'badge-warning',
  ON_SHELF:    'badge-success',
  VALIDATED:   'badge-success',
  RECALLED:    'badge-danger',
  BLOCKED:     'badge-danger',
  PROCESSING:  'badge-info',
};

function StatusBadge({ status }: { status: string }) {
  return <span className={`badge ${STATUS_CLASS[status] || 'badge-muted'}`}>{status}</span>;
}

function CustodyBadge({ status }: { status?: string }) {
  if (!status) return null;
  const map: Record<string, [string, string]> = {
    PENDING_TRANSFER: ['#fbbf24', '⏳ PENDING'],
    IN_CUSTODY:       ['#4ade80', '✅ IN CUSTODY'],
    DELIVERED:        ['#818cf8', '📦 DELIVERED'],
  };
  const [color, label] = map[status] || ['#64748b', status];
  return (
    <span style={{ fontSize: '10px', fontWeight: 700, color, background: `${color}22`, padding: '2px 7px', borderRadius: '4px', border: `1px solid ${color}44` }}>
      {label}
    </span>
  );
}

export default function BatchesPage() {
  const [batches, setBatches]   = useState<Batch[]>([]);
  const [users, setUsers]       = useState<User[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg]           = useState<{ type: 'success' | 'danger' | 'info' | 'warning'; text: string } | null>(null);

  // Form state
  const [form, setForm] = useState({
    productId: '', quantity: '', uom: 'KG',
    isRootBatch: true,
    parentBatchIds: [] as string[],
    parentInput: '',
    nextCustodianUsername: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Per-row actions
  const [acceptLoading, setAcceptLoading]   = useState<string | null>(null);
  const [assignState, setAssignState]       = useState<Record<string, string>>({});  // batchId → username input
  const [assignLoading, setAssignLoading]   = useState<string | null>(null);
  const [expandedBatch, setExpandedBatch]   = useState<string | null>(null);

  const myUsername = getUserName();
  const myOrg      = getUserOrg();
  const myRole     = getUserRole();

  useEffect(() => {
    load();
    fetchUsers().then(setUsers);
    fetchProducts().then(data => setProducts(Array.isArray(data) ? data : []));
  }, []);

  async function load() {
    setLoading(true);
    const data = await fetchBatches();
    setBatches(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  // ── Form helpers ──────────────────────────────────────────────
  function addParent() {
    const id = form.parentInput.trim().toUpperCase();
    if (!id || form.parentBatchIds.includes(id)) return;
    setForm(p => ({ ...p, parentBatchIds: [...p.parentBatchIds, id], parentInput: '' }));
  }
  function removeParent(id: string) {
    setForm(p => ({ ...p, parentBatchIds: p.parentBatchIds.filter(x => x !== id) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.productId || !form.quantity) {
      setMsg({ type: 'danger', text: 'Product ID and Quantity are required.' });
      return;
    }
    if (!form.isRootBatch && form.parentBatchIds.length === 0) {
      setMsg({ type: 'danger', text: 'Please add at least one parent batch ID.' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await createBatch({
        productId: form.productId,
        quantity: Number(form.quantity),
        uom: form.uom,
        custodian: myOrg || myUsername,
        next_custodian_username: form.nextCustodianUsername || undefined,
        parent_batch_ids: form.isRootBatch ? [] : form.parentBatchIds,
      });
      const newBatch = res.batch || res;
      if (newBatch?.id) {
        setBatches(prev => [newBatch, ...prev]);
        setMsg({ type: 'success', text: `✅ Batch ${newBatch.id} created.${form.nextCustodianUsername ? ` Awaiting acceptance by ${form.nextCustodianUsername}.` : ''}` });
        setForm({ productId: '', quantity: '', uom: 'KG', isRootBatch: true, parentBatchIds: [], parentInput: '', nextCustodianUsername: '' });
        setShowForm(false);
      } else {
        setMsg({ type: 'danger', text: 'Failed to create batch.' });
      }
    } catch {
      setMsg({ type: 'danger', text: 'An error occurred creating the batch.' });
    }
    setSubmitting(false);
  }

  // ── Accept custody ────────────────────────────────────────────
  async function handleAccept(batch: Batch) {
    if (!myUsername) return;
    setAcceptLoading(batch.id);
    setMsg(null);
    try {
      const res = await acceptCustody(batch.id, myUsername);
      setMsg({ type: 'success', text: `✅ ${res.message}` });
      // Update local state
      setBatches(prev => prev.map(b =>
        b.id === batch.id
          ? { ...b, custodian: res.new_custodian, status: res.new_status, custody_status: res.is_public ? 'DELIVERED' : 'IN_CUSTODY', is_public: res.is_public, next_custodian_username: undefined, next_custodian_org: undefined }
          : b
      ));
    } catch (err: unknown) {
      setMsg({ type: 'danger', text: `❌ ${err instanceof Error ? err.message : 'Accept failed.'}` });
    }
    setAcceptLoading(null);
  }

  // ── Assign next custodian ─────────────────────────────────────
  async function handleAssign(batchId: string) {
    const nextUser = assignState[batchId]?.trim();
    if (!nextUser) return;
    setAssignLoading(batchId);
    setMsg(null);
    try {
      const res = await assignNextCustodian(batchId, nextUser, myUsername);
      setMsg({ type: 'info', text: `📬 ${res.message}` });
      setBatches(prev => prev.map(b =>
        b.id === batchId
          ? { ...b, next_custodian_username: res.next_custodian_username, next_custodian_org: res.next_custodian_org, custody_status: 'PENDING_TRANSFER' }
          : b
      ));
      setAssignState(s => ({ ...s, [batchId]: '' }));
    } catch (err: unknown) {
      setMsg({ type: 'danger', text: `❌ ${err instanceof Error ? err.message : 'Assign failed.'}` });
    }
    setAssignLoading(null);
  }

  const myPendingBatches = batches.filter(b =>
    (b.next_custodian_username || '').toLowerCase() === myUsername.toLowerCase() &&
    b.custody_status === 'PENDING_TRANSFER'
  );

  return (
    <AuthGuard>
      <div className="app-page">
        <AppNav />
        <div className="app-container">

          {/* Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">📦 Batches</h1>
              <p className="page-subtitle">
                Food batch registry ({batches.length} total) — logged in as{' '}
                <strong style={{ color: 'var(--primary)' }}>{myUsername}</strong>{' '}
                <span style={{ color: 'var(--faint)', fontSize: '11px' }}>({myRole})</span>
              </p>
            </div>
            <button id="toggle-add-batch" className="btn btn-primary" onClick={() => { setShowForm(v => !v); setMsg(null); }}>
              {showForm ? '✕ Cancel' : '+ Create Batch'}
            </button>
          </div>

          {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

          {/* Pending acceptance alert */}
          {myPendingBatches.length > 0 && (
            <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span>📲 <strong>{myPendingBatches.length} batch(es)</strong> are awaiting your custody acceptance.</span>
              <span style={{ fontSize: '12px', color: 'var(--warning)' }}>Scroll down to find batches with the Accept button →</span>
            </div>
          )}

          {/* ── Create Batch Form ───────────────────────────────── */}
          {showForm && (
            <div className="form-section">
              <h2 className="section-title">🆕 Create New Batch</h2>
              <form onSubmit={handleSubmit}>

                {/* Basic fields */}
                <div className="form-grid" style={{ marginBottom: '18px' }}>
                  <div className="form-group">
                    <label className="form-label">Product *</label>
                    <select id="batch-productId" className="form-select" value={form.productId} onChange={e => setForm(p => ({ ...p, productId: e.target.value }))} required>
                      <option value="" disabled>Select a product...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quantity *</label>
                    <input id="batch-quantity" type="number" min="1" className="form-input" value={form.quantity}
                      onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} placeholder="e.g. 5000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit of Measure</label>
                    <select id="batch-uom" className="form-select" value={form.uom}
                      onChange={e => setForm(p => ({ ...p, uom: e.target.value }))}>
                      {UOMS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>

                {/* Lineage — root or child */}
                <div style={{ marginBottom: '18px' }}>
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>📌 Batch Lineage</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    {[true, false].map(isRoot => (
                      <button
                        key={String(isRoot)}
                        type="button"
                        onClick={() => setForm(p => ({ ...p, isRootBatch: isRoot, parentBatchIds: [] }))}
                        style={{
                          flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                          border: `2px solid ${form.isRootBatch === isRoot ? 'var(--primary)' : 'var(--border)'}`,
                          background: form.isRootBatch === isRoot ? 'var(--primary-dim)' : 'var(--surface2)',
                          color: form.isRootBatch === isRoot ? 'var(--primary)' : 'var(--muted)',
                        }}
                      >
                        {isRoot ? '🌱 Root / Origin batch — no parents' : '🔗 Derived batch — has parent batch(es)'}
                      </button>
                    ))}
                  </div>

                  {!form.isRootBatch && (
                    <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '12px 14px' }}>
                      <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>Parent Batch IDs</label>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input className="form-input" style={{ flex: 1 }}
                          value={form.parentInput}
                          onChange={e => setForm(p => ({ ...p, parentInput: e.target.value.toUpperCase() }))}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addParent(); } }}
                          placeholder="e.g. BATCH-MBTSDM2UM" />
                        <button type="button" className="btn btn-ghost btn-sm" onClick={addParent}>+ Add</button>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {form.parentBatchIds.map(id => (
                          <span key={id} style={{ background: 'var(--primary-dim)', color: 'var(--primary)', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {id}
                            <button type="button" onClick={() => removeParent(id)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '12px', padding: 0 }}>×</button>
                          </span>
                        ))}
                        {form.parentBatchIds.length === 0 && <span style={{ color: 'var(--faint)', fontSize: '11px' }}>No parents added yet</span>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Next custodian */}
                <div style={{ marginBottom: '18px' }}>
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                    📬 Assign Next Custodian (optional — can be done later)
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <select
                      className="form-select"
                      style={{ flex: 1 }}
                      value={form.nextCustodianUsername}
                      onChange={e => setForm(p => ({ ...p, nextCustodianUsername: e.target.value }))}
                    >
                      <option value="">— Skip for now —</option>
                      {users.filter(u => u.username !== myUsername).map(u => (
                        <option key={u.username} value={u.username}>
                          {u.username} · {u.org} [{u.role}]
                        </option>
                      ))}
                    </select>
                  </div>
                  {form.nextCustodianUsername && (
                    <p style={{ fontSize: '11px', color: 'var(--warning)', marginTop: '6px' }}>
                      ⚡ Only <strong>{form.nextCustodianUsername}</strong> will be able to accept this batch.
                      {users.find(u => u.username === form.nextCustodianUsername)?.role === 'RETAILER' &&
                        ' As a Retailer, they are the chain terminus — QR will go public upon acceptance.'}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button id="submit-batch" type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Creating…' : '✓ Create Batch'}
                  </button>
                  <span style={{ fontSize: '11px', color: 'var(--faint)' }}>
                    Creating as <strong style={{ color: 'var(--text)' }}>{myOrg || myUsername}</strong> ({myRole})
                  </span>
                </div>
              </form>
            </div>
          )}

          {/* ── Batch Table ───────────────────────────────────── */}
          {loading ? (
            <div className="loading">Loading batches…</div>
          ) : batches.length === 0 ? (
            <div className="empty-state">No batches found. Create one above.</div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Batch ID</th>
                    <th>Product ID</th>
                    <th>Status</th>
                    <th>Custody</th>
                    <th>Qty</th>
                    <th>Custodian</th>
                    <th>Next Custodian</th>
                    <th>Public</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map(b => {
                    const isMyAcceptable = (b.next_custodian_username || '').toLowerCase() === myUsername.toLowerCase() && b.custody_status === 'PENDING_TRANSFER';
                    const amCurrentCustodian = b.custodian === (myOrg || myUsername);
                    const isExpanded = expandedBatch === b.id;

                    return (
                      <>
                        <tr key={b.id} style={isMyAcceptable ? { background: 'rgba(251,191,36,0.04)' } : undefined}>
                          <td className="mono" style={{ fontSize: '11px' }}>{b.id}</td>
                          <td className="mono" style={{ fontSize: '11px' }}>{b.productId}</td>
                          <td><StatusBadge status={b.status} /></td>
                          <td><CustodyBadge status={b.custody_status} /></td>
                          <td style={{ fontSize: '12px' }}>{b.quantity} {b.uom}</td>
                          <td style={{ fontSize: '12px' }}>{b.custodian}</td>
                          <td style={{ fontSize: '11px' }}>
                            {b.next_custodian_org
                              ? <span style={{ color: isMyAcceptable ? '#fbbf24' : 'var(--muted)' }}>⏳ {b.next_custodian_org}</span>
                              : <span style={{ color: 'var(--faint)' }}>—</span>}
                          </td>
                          <td>
                            {b.is_public
                              ? <span style={{ color: '#4ade80', fontSize: '11px', fontWeight: 700 }}>🌍 Yes</span>
                              : <span style={{ color: 'var(--faint)', fontSize: '11px' }}>🔒 No</span>}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                              <a href={`/batches/${encodeURIComponent(b.id)}`} className="btn btn-ghost btn-sm">View</a>

                              {/* Accept custody — only for assigned user */}
                              {isMyAcceptable && (
                                <button
                                  className="btn btn-sm"
                                  style={{ background: '#fbbf24', color: '#0f172a', fontWeight: 700 }}
                                  disabled={acceptLoading === b.id}
                                  onClick={() => handleAccept(b)}
                                  title="You are the assigned next custodian — click to accept"
                                >
                                  {acceptLoading === b.id ? '⏳' : '📲 Accept'}
                                </button>
                              )}

                              {/* Assign next custodian — only for current custodian with no next assigned */}
                              {amCurrentCustodian && !b.next_custodian_username && b.status !== 'ON_SHELF' && (
                                <button
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => setExpandedBatch(isExpanded ? null : b.id)}
                                  title="Assign next custodian for this batch"
                                >
                                  📬 {isExpanded ? 'Cancel' : 'Assign'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Inline assign next custodian panel */}
                        {isExpanded && amCurrentCustodian && (
                          <tr key={`${b.id}-assign`}>
                            <td colSpan={9} style={{ background: 'var(--surface2)', padding: '12px 16px' }}>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                                  📬 Assign next custodian for <strong style={{ color: 'var(--text)' }}>{b.id}</strong>:
                                </span>
                                <select
                                  className="form-select"
                                  style={{ fontSize: '12px', height: '32px', width: 'auto', minWidth: '220px' }}
                                  value={assignState[b.id] || ''}
                                  onChange={e => setAssignState(s => ({ ...s, [b.id]: e.target.value }))}
                                >
                                  <option value="">— Select user —</option>
                                  {users.filter(u => u.username !== myUsername).map(u => (
                                    <option key={u.username} value={u.username}>
                                      {u.username} · {u.org} [{u.role}]
                                    </option>
                                  ))}
                                </select>
                                <button
                                  className="btn btn-sm"
                                  style={{ background: 'var(--primary)', color: '#0f172a' }}
                                  disabled={!assignState[b.id] || assignLoading === b.id}
                                  onClick={() => handleAssign(b.id)}
                                >
                                  {assignLoading === b.id ? 'Assigning…' : '✓ Assign'}
                                </button>
                                {assignState[b.id] && users.find(u => u.username === assignState[b.id])?.role === 'RETAILER' && (
                                  <span style={{ fontSize: '11px', color: '#f472b6' }}>🏪 Retailer = chain terminus</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
              <p style={{ padding: '10px 14px', fontSize: '11px', color: 'var(--faint)', borderTop: '1px solid var(--border)' }}>
                💡 <strong style={{ color: 'var(--muted)' }}>📲 Accept</strong> is shown only to the assigned next custodian.{' '}
                <strong style={{ color: 'var(--muted)' }}>📬 Assign</strong> is shown only to the current custodian.{' '}
                🌍 Public = QR is scannable by consumers.
              </p>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
