'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/shared/AuthGuard';
import AppNav from '@/components/shared/AppNav';
import { fetchEvents } from '@/lib/api';
import '../app.css';

interface AppEvent {
  id?: string;
  type?: string;
  entity_id?: string;
  batch_id?: string;
  actor_role?: string;
  actor_name?: string;
  from_actor?: string;
  to_actor?: string;
  location?: string;
  timestamp?: string;
  fabric_tx_id?: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [appliedFilter, setAppliedFilter] = useState('');

  useEffect(() => { load(''); }, []);

  async function load(targetId: string) {
    setLoading(true);
    const data = await fetchEvents(targetId || undefined);
    setEvents(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  function handleFilter(e: React.FormEvent) {
    e.preventDefault();
    setAppliedFilter(filter.trim());
    load(filter.trim());
  }

  return (
    <AuthGuard allowedRoles={['ADMIN', 'REGULATOR']}>
      <div className="app-page">
        <AppNav />
        <div className="app-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">📋 Audit Trail & Events</h1>
              <p className="page-subtitle">Immutable record of all supply chain interactions ({events.length} events)</p>
            </div>
          </div>

          <form onSubmit={handleFilter} style={{ display: 'flex', gap: '10px', marginBottom: '24px', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Filter by Batch/Unit ID (optional)</label>
              <input
                id="events-filter"
                className="form-input"
                placeholder="e.g. BATCH-MBTSDM2UM"
                value={filter}
                onChange={e => setFilter(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">Filter</button>
            {appliedFilter && (
              <button type="button" className="btn btn-ghost" onClick={() => { setFilter(''); setAppliedFilter(''); load(''); }}>
                Clear
              </button>
            )}
          </form>

          {appliedFilter && (
            <div className="alert alert-info">Showing events for: <span className="mono">{appliedFilter}</span></div>
          )}

          {loading ? (
            <div className="loading">Loading events…</div>
          ) : events.length === 0 ? (
            <div className="empty-state">No events found{appliedFilter ? ` for ${appliedFilter}` : ''}.</div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Entity ID</th>
                    <th>Actor</th>
                    <th>Location</th>
                    <th>Timestamp</th>
                    <th>Fabric TX</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev, i) => (
                    <tr key={ev.id || i}>
                      <td>
                        <span className={`badge ${ev.type === 'SCAN' ? 'badge-info' : 'badge-warning'}`}>
                          {ev.type || '—'}
                        </span>
                      </td>
                      <td className="mono">{ev.entity_id || ev.batch_id || '—'}</td>
                      <td>{ev.actor_name || ev.from_actor || ev.actor_role || '—'}{ev.to_actor ? ` → ${ev.to_actor}` : ''}</td>
                      <td>{ev.location || '—'}</td>
                      <td className="mono">{ev.timestamp ? new Date(ev.timestamp).toLocaleString() : '—'}</td>
                      <td className="mono" style={{ maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ev.fabric_tx_id || '—'}
                      </td>
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
