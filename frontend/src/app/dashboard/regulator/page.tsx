'use client';

import { useState } from 'react';
import styles from './page.module.css';

const MOCK_INCIDENTS = [
  {
    id: 'INC-9942', unitId: 'UNIT-1002', batchId: 'BATCH-MBTSDM2UM',
    category: 'Spoilage', reporter: 'Consumer (App)', status: 'UNDER_INVESTIGATION',
    evidenceCid: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    description: 'Consumer reported foul odor and discoloration in wheat flour bag. Product was within shelf-life.',
    nearestOrg: 'Sahyadri Agro Processing', escalation: 'LEVEL_1_WARNING',
    date: '15 Aug 2026', resolvedDate: null,
    affectedScope: ['BATCH-FLOUR-881', 'BATCH-RTL-90A', 'BATCH-RTL-90B'],
  },
  {
    id: 'INC-9941', unitId: 'UNIT-1001', batchId: 'BATCH-MBTSDM2UM',
    category: 'Packaging Defect', reporter: 'Retailer', status: 'ESCALATED',
    evidenceCid: 'QmTp2hEo8eXRp6wg7jXv1qE9RzT3fV4dJkLKmNgG1BqCw',
    description: 'Retailer found compromised seal on 12 units. Inner credential exposed.',
    nearestOrg: 'Central Packaging Hub', escalation: 'ESCALATED_WARNING',
    date: '14 Aug 2026', resolvedDate: null,
    affectedScope: ['BATCH-MBTSDM2UM'],
  },
  {
    id: 'INC-9938', unitId: 'UNIT-0892', batchId: 'BATCH-IKHJWTOYD',
    category: 'Taste/Odor', reporter: 'Consumer (Web)', status: 'RESOLVED',
    evidenceCid: 'QmResolvedEvidence12345',
    description: 'Slight rancid taste detected. Lab confirmed oil batch within safety threshold.',
    nearestOrg: 'Sahyadri Agro Processing', escalation: 'LEVEL_1_WARNING',
    date: '12 Aug 2026', resolvedDate: '13 Aug 2026',
    affectedScope: [],
  },
];

const MOCK_RECALLS = [
  {
    id: 'RECALL-44102', batchId: 'BATCH-MBTSDM2UM', scope: 3,
    status: 'ACTIVE', issuedBy: 'RegulatorOrg', date: '15 Aug 2026',
    affectedRetailLocations: ['GreenBasket Bandra', 'GreenBasket Juhu'],
  },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  'UNDER_INVESTIGATION': { label: 'Under Investigation', color: 'var(--color-earth-400)' },
  'ESCALATED': { label: 'Escalated', color: 'var(--color-alert-red)' },
  'RESOLVED': { label: 'Resolved', color: 'var(--color-grass-400)' },
  'NEW': { label: 'New', color: 'var(--color-grass-300)' },
  'ACTIVE': { label: 'Active Recall', color: 'var(--color-alert-red)' },
  'CLOSED': { label: 'Closed', color: 'var(--text-muted)' },
};

export default function RegulatorPage() {
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'incidents' | 'recalls' | 'evidence'>('incidents');

  const detail = MOCK_INCIDENTS.find((i) => i.id === selectedIncident);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.headerTop}>
          <div>
            <div className={styles.eyebrow}>🛡️ REGULATORY OVERSIGHT CONSOLE</div>
            <div className={styles.title}>Regulator Dashboard</div>
            <div className={styles.subtitle}>
              Review incidents, inspect evidence, assess recall scope, and issue corrective actions with full chain-of-custody visibility.
            </div>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.statBox}>
              <span className={styles.statValue} style={{ color: 'var(--color-alert-red)' }}>2</span>
              <span className={styles.statLabel}>Open Incidents</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statValue} style={{ color: 'var(--color-earth-400)' }}>1</span>
              <span className={styles.statLabel}>Active Recalls</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statValue} style={{ color: 'var(--color-grass-400)' }}>1</span>
              <span className={styles.statLabel}>Resolved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabBar}>
        {(['incidents', 'recalls', 'evidence'] as const).map((tab) => (
          <button
            key={tab}
            className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'incidents' ? '📋 Incident Review' : tab === 'recalls' ? '🚨 Recall Registry' : '📎 Evidence Vault'}
          </button>
        ))}
      </div>

      <div className={styles.mainGrid}>
        {/* ── Left Panel: Table ──────────────────────────────── */}
        <div className={styles.listPanel}>
          {activeTab === 'incidents' && (
            <>
              <div className={styles.panelHead}>
                <h3 className={styles.panelTitle}>All Incidents</h3>
                <input type="text" placeholder="Search by ID, batch, or category..." className={styles.searchInput} />
              </div>
              <div className={styles.incidentList}>
                {MOCK_INCIDENTS.map((inc) => {
                  const st = STATUS_MAP[inc.status] || { label: inc.status, color: 'var(--text-muted)' };
                  return (
                    <div
                      key={inc.id}
                      className={`${styles.incidentRow} ${selectedIncident === inc.id ? styles.incidentRowActive : ''}`}
                      onClick={() => setSelectedIncident(inc.id)}
                    >
                      <div className={styles.incidentMeta}>
                        <span className={styles.incidentId}>{inc.id}</span>
                        <span className={styles.incidentDate}>{inc.date}</span>
                      </div>
                      <div className={styles.incidentTitle}>{inc.category} — {inc.batchId}</div>
                      <div className={styles.incidentFooter}>
                        <span className={styles.incidentReporter}>by {inc.reporter}</span>
                        <span className={styles.statusBadge} style={{ color: st.color, borderColor: st.color }}>{st.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === 'recalls' && (
            <>
              <div className={styles.panelHead}>
                <h3 className={styles.panelTitle}>Recall Actions</h3>
              </div>
              <div className={styles.incidentList}>
                {MOCK_RECALLS.map((r) => {
                  const st = STATUS_MAP[r.status] || { label: r.status, color: 'var(--text-muted)' };
                  return (
                    <div key={r.id} className={styles.incidentRow}>
                      <div className={styles.incidentMeta}>
                        <span className={styles.incidentId}>{r.id}</span>
                        <span className={styles.incidentDate}>{r.date}</span>
                      </div>
                      <div className={styles.incidentTitle}>Batch {r.batchId} — {r.scope} downstream nodes blocked</div>
                      <div className={styles.incidentFooter}>
                        <span className={styles.incidentReporter}>Issued by {r.issuedBy}</span>
                        <span className={styles.statusBadge} style={{ color: st.color, borderColor: st.color }}>{st.label}</span>
                      </div>
                      <div className={styles.recallLocations}>
                        {r.affectedRetailLocations.map((loc) => (
                          <span key={loc} className={styles.locationChip}>📍 {loc}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === 'evidence' && (
            <>
              <div className={styles.panelHead}>
                <h3 className={styles.panelTitle}>Evidence Vault (IPFS)</h3>
              </div>
              <div className={styles.incidentList}>
                {MOCK_INCIDENTS.filter((i) => i.evidenceCid.length > 10).map((inc) => (
                  <div key={inc.id} className={styles.incidentRow}>
                    <div className={styles.incidentMeta}>
                      <span className={styles.incidentId}>{inc.id}</span>
                      <span className={styles.incidentDate}>Evidence uploaded {inc.date}</span>
                    </div>
                    <div className={styles.incidentTitle}>{inc.category} — {inc.description.substring(0, 60)}...</div>
                    <div className={styles.evidenceCidRow}>
                      <code className={styles.cidCode}>{inc.evidenceCid}</code>
                      <a
                        href={`https://ipfs.io/ipfs/${inc.evidenceCid}`}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.cidLink}
                      >
                        View on IPFS →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Right Panel: Detail ────────────────────────────── */}
        <div className={styles.detailPanel}>
          {detail ? (
            <>
              <div className={styles.detailHeader}>
                <div>
                  <span className={styles.detailEyebrow}>INCIDENT DETAIL</span>
                  <h2 className={styles.detailId}>{detail.id}</h2>
                </div>
                <span
                  className={styles.detailStatus}
                  style={{ color: STATUS_MAP[detail.status]?.color, borderColor: STATUS_MAP[detail.status]?.color }}
                >
                  {STATUS_MAP[detail.status]?.label}
                </span>
              </div>

              <div className={styles.detailSection}>
                <h4 className={styles.sectionLabel}>Description</h4>
                <p className={styles.sectionText}>{detail.description}</p>
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailKey}>Category</span>
                  <span className={styles.detailVal}>{detail.category}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailKey}>Reporter</span>
                  <span className={styles.detailVal}>{detail.reporter}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailKey}>Batch ID</span>
                  <span className={styles.detailVal}>{detail.batchId}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailKey}>Unit ID</span>
                  <span className={styles.detailVal}>{detail.unitId}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailKey}>Nearest Accountable Org</span>
                  <span className={styles.detailVal}>{detail.nearestOrg}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailKey}>Escalation Level</span>
                  <span className={styles.detailVal} style={{ color: detail.escalation === 'ESCALATED_WARNING' ? 'var(--color-alert-red)' : 'var(--color-earth-400)' }}>
                    {detail.escalation}
                  </span>
                </div>
              </div>

              {detail.affectedScope.length > 0 && (
                <div className={styles.detailSection}>
                  <h4 className={styles.sectionLabel}>Affected Downstream Scope ({detail.affectedScope.length} batches)</h4>
                  <div className={styles.scopeChips}>
                    {detail.affectedScope.map((b) => (
                      <span key={b} className={styles.scopeChip}>{b}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.detailSection}>
                <h4 className={styles.sectionLabel}>Evidence (IPFS)</h4>
                <a href={`https://ipfs.io/ipfs/${detail.evidenceCid}`} target="_blank" rel="noreferrer" className={styles.evidenceLink}>
                  <code>{detail.evidenceCid}</code>
                  <span>Open in IPFS Gateway →</span>
                </a>
              </div>

              <div className={styles.actionBar}>
                {detail.status !== 'RESOLVED' && (
                  <>
                    <button className={styles.btnAction} style={{ backgroundColor: 'var(--color-grass-400)', color: '#fff' }}>
                      ✓ Resolve & Close
                    </button>
                    <button className={styles.btnAction} style={{ backgroundColor: 'var(--color-alert-red)', color: '#fff' }}>
                      🚨 Issue Recall
                    </button>
                    <button className={styles.btnAction} style={{ backgroundColor: 'var(--color-earth-400)', color: '#fff' }}>
                      ⬆ Escalate
                    </button>
                  </>
                )}
                {detail.status === 'RESOLVED' && (
                  <div className={styles.resolvedBanner}>
                    ✓ Incident resolved on {detail.resolvedDate}. No further action required.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className={styles.emptyDetail}>
              <div className={styles.emptyIcon}>🔍</div>
              <h3 className={styles.emptyTitle}>Select an incident to review</h3>
              <p className={styles.emptyText}>
                Click any incident from the left panel to inspect its full details, evidence chain, affected scope, and available regulatory actions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
