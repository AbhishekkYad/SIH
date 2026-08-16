'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import {
  IconSearch,
  IconCopy,
  IconArrowUpRight,
} from '@/components/icons/Icons';

interface Incident {
  id: string;
  incidentCode: string;
  category: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  affectedBatch: string;
  product: string;
  reportedBy: string;
  status: 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED';
  ipfsHash: string;
  reportedAt: string;
  notes: string;
  containmentAction: string;
}

const INCIDENTS_DATA: Incident[] = [
  {
    id: '1',
    incidentCode: 'INC-2026-0881',
    category: 'Moisture Contamination (Aflatoxin)',
    severity: 'CRITICAL',
    affectedBatch: 'BATCH-CD-2025-004',
    product: 'Organic Chana Dal 1KG',
    reportedBy: 'Indore Quality Labs (Assay #992)',
    status: 'OPEN',
    ipfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    reportedAt: '16 Aug 2026 09:30',
    notes: 'Moisture content registered 18.4% exceeding 12% ceiling. High risk of aflatoxin fungal proliferation.',
    containmentAction: 'Immediate POS shelf lockout and forward DAG recall broadcast recommended.',
  },
  {
    id: '2',
    incidentCode: 'INC-2026-0879',
    category: 'Packaging Tamper Seal Defect',
    severity: 'MAJOR',
    affectedBatch: 'BATCH-WF-2025-042',
    product: 'Organic Sharbati Wheat Flour 5KG',
    reportedBy: 'Consumer Inquest #4029 (Bandra)',
    status: 'INVESTIGATING',
    ipfsHash: 'QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2hLDFms8Cwo7W3hB',
    reportedAt: '15 Aug 2026 14:15',
    notes: 'Consumer reported broken silver scratch strip upon retail purchase.',
    containmentAction: 'Serial UNIT-WF-1002-001 placed on single-item quarantine.',
  },
  {
    id: '3',
    incidentCode: 'INC-2026-0874',
    category: 'Cold-Chain Temperature Deviation',
    severity: 'MINOR',
    affectedBatch: 'BATCH-MO-2025-003',
    product: 'Cold-Pressed Mustard Oil 1L',
    reportedBy: 'AgriTransit Logistics IoT Sensor',
    status: 'CONTAINED',
    ipfsHash: 'QmPZ9qcZeohgQYHQ2f61Q1jY4g4gGpa3mC1WjLd482e18b',
    reportedAt: '12 Aug 2026 18:00',
    notes: 'Refrigerated container logged 8.4°C for 42 minutes during transit.',
    containmentAction: 'Secondary lab validation completed: peroxide value normal, cleared for distribution.',
  },
  {
    id: '4',
    incidentCode: 'INC-2026-0862',
    category: 'Adulteration Inquest (Sugar Syrup)',
    severity: 'MINOR',
    affectedBatch: 'BATCH-HH-2025-001',
    product: 'Wild Forest Raw Honey 500g',
    reportedBy: 'FSSAI Regional MH Auditor',
    status: 'RESOLVED',
    ipfsHash: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn',
    reportedAt: '05 Aug 2026 11:20',
    notes: 'Routine FSSAI surveillance sampling for synthetic inverted sugar.',
    containmentAction: 'NMR spectroscopy confirmed 100% pure wild honey. Case closed on-chain.',
  },
];

export default function IncidentsPage() {
  const [incidents] = useState<Incident[]>(INCIDENTS_DATA);
  const [search, setSearch] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(INCIDENTS_DATA[0]);

  const filtered = incidents.filter((i) =>
    i.incidentCode.toLowerCase().includes(search.toLowerCase()) ||
    i.affectedBatch.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className={styles.topBar}>
        <div className={styles.titleBlock}>
          <h1 className={styles.pageTitle}>Quality Control & Incident Command Center</h1>
          <p className={styles.pageSubtitle}>
            Contamination inquests, laboratory test deviations, tamper seal alerts, and immutable IPFS evidence files.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn--primary"
            onClick={() => alert('Filing new Quality Incident on Hyperledger Fabric...')}
          >
            + File Quality Incident
          </button>
        </div>
      </div>

      {/* ── Status Metrics Strip ──────────────────────────────── */}
      <div className={styles.metricsStrip}>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Open Critical Inquests</span>
          <span className={styles.metricVal} style={{ color: 'var(--color-danger)' }}>1</span>
          <span style={{ fontSize: '11px', color: 'var(--color-danger)' }}>Active quarantine broadcast</span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Major Inquests</span>
          <span className={styles.metricVal} style={{ color: 'var(--color-warning)' }}>1</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Under lab investigation</span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Mean Time to Contain</span>
          <span className={styles.metricVal}>2.4 hrs</span>
          <span style={{ fontSize: '11px', color: 'var(--color-success)' }}>↓ 45% faster than benchmark</span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>IPFS Evidence Vault</span>
          <span className={styles.metricVal}>14 Files</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SHA-256 hashed on Fabric</span>
        </div>
      </div>

      {/* ── Split-Screen Triage Layout ────────────────────────── */}
      <div className={styles.splitLayout}>
        {/* Left: Dense Incident Table */}
        <div className={styles.tableContainer}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-subtle)' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
              <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}>
                <IconSearch size={13} />
              </span>
              <input
                type="text"
                style={{
                  width: '100%',
                  height: '28px',
                  padding: '0 8px 0 26px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  fontSize: '11.5px',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                }}
                placeholder="Search incident code, batch..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Showing <strong>{filtered.length}</strong> inquests
            </span>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Incident Code</th>
                  <th>Root Cause Category</th>
                  <th>Target Batch</th>
                  <th>Status</th>
                  <th>Reported</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={selectedIncident?.id === inc.id ? styles.rowSelected : ''}
                  >
                    <td>
                      {inc.severity === 'CRITICAL' ? (
                        <span className="badge badge--danger">CRITICAL</span>
                      ) : inc.severity === 'MAJOR' ? (
                        <span className="badge badge--warning">MAJOR</span>
                      ) : (
                        <span className="badge badge--info">MINOR</span>
                      )}
                    </td>
                    <td>
                      <span className="mono-num" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {inc.incidentCode}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{inc.category}</td>
                    <td>
                      <Link href={`/track/batch/${inc.affectedBatch}`} style={{ color: 'var(--color-info)', textDecoration: 'underline' }}>
                        {inc.affectedBatch}
                      </Link>
                    </td>
                    <td>
                      <span className="badge badge--neutral">● {inc.status}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{inc.reportedAt.split(' ')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Live Investigation Dossier */}
        {selectedIncident && (
          <div className={styles.dossierPanel}>
            <div className={styles.dossierHeader}>
              <div>
                <span className={`badge badge--${selectedIncident.severity === 'CRITICAL' ? 'danger' : selectedIncident.severity === 'MAJOR' ? 'warning' : 'info'}`}>
                  {selectedIncident.severity} SEVERITY
                </span>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {selectedIncident.incidentCode}: {selectedIncident.category}
                </h3>
              </div>
              <span className="mono-num" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {selectedIncident.reportedAt}
              </span>
            </div>

            {/* Affected Inventory Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Affected Inventory & Provenance
              </span>
              <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Target Batch</div>
                  <div className="mono-num" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedIncident.affectedBatch}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Commodity SKU</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedIncident.product}</div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Reporting Authority</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{selectedIncident.reportedBy}</div>
                </div>
              </div>
            </div>

            {/* Assay Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Laboratory Observation Notes
              </span>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '10px', lineHeight: 1.4 }}>
                {selectedIncident.notes}
              </p>
            </div>

            {/* Containment Protocol */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Containment Protocol
              </span>
              <div style={{ fontSize: '12px', color: 'var(--color-danger)', background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', borderRadius: 'var(--radius-sm)', padding: '10px', fontWeight: 500 }}>
                {selectedIncident.containmentAction}
              </div>
            </div>

            {/* IPFS Proof Hash */}
            <div style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>IPFS Laboratory Evidence CID</span>
                <div className="mono-num" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{selectedIncident.ipfsHash.substring(0, 24)}...</div>
              </div>
              <button
                onClick={() => alert(`Copied IPFS CID:\n${selectedIncident.ipfsHash}`)}
                style={{ fontSize: '11px', color: 'var(--color-info)', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                <IconCopy size={11} /> Copy CID
              </button>
            </div>

            {/* Actions */}
            <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
              <Link
                href="/dashboard/recall"
                className="btn btn--danger"
                style={{ flex: 1 }}
              >
                Launch Targeted Recall <IconArrowUpRight size={12} />
              </Link>
              <button
                className="btn btn--secondary"
                style={{ flex: 1 }}
                onClick={() => alert(`Assay report for ${selectedIncident.incidentCode} dispatched to FSSAI auditor.`)}
              >
                Dispatch to Auditor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
