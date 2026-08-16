'use client';

import Link from 'next/link';
import styles from './page.module.css';
import {
  IconActivity,
  IconArrowUpRight,
} from '@/components/icons/Icons';

export default function DashboardOverviewPage() {
  const statusMetrics = [
    { label: 'Active Batches', value: '128', sub: '100% Cryptographic Consensus', tag: 'NOMINAL', tagType: 'success' },
    { label: 'Units in Transit', value: '28,500', sub: 'GPS & Cold-Chain IoT Active', tag: '22% Total', tagType: 'info' },
    { label: 'Traceability Coverage', value: '98.4%', sub: '↑ 1.2% verified this week', tag: 'OPTIMAL', tagType: 'success' },
    { label: 'Compliance Rate', value: '99.1%', sub: '156 Valid FSSAI Certificates', tag: 'PASSED', tagType: 'success' },
    { label: 'Open Incidents', value: '2', sub: '1 Critical Quarantined', tag: 'ATTENTION', tagType: 'danger' },
    { label: 'Recall Exposure', value: '$0', sub: 'Targeted Blast Radius Contained', tag: '0.00%', tagType: 'success' },
  ];

  const pipelineStages = [
    { name: '1. Origin Farms', batches: 18, units: '14,200 KG', status: 'VERIFIED', time: 'Avg 24h', exception: false },
    { name: '2. Processing', batches: 32, units: '26,800 KG', status: 'VERIFIED', time: 'Avg 48h', exception: false },
    { name: '3. Packaging', batches: 45, units: '45,200 Units', status: 'DUAL-QR ACTIVE', time: 'Avg 12h', exception: false },
    { name: '4. Cold Storage', batches: 12, units: '9,800 Units', status: 'TEMP NOMINAL', time: 'Avg 72h', exception: false },
    { name: '5. Distribution', batches: 16, units: '18,700 Units', status: 'IN TRANSIT', time: 'GPS Live', exception: false },
    { name: '6. Retail POS', batches: 5, units: '4,200 Units', status: '1 LOCKED (RECALL)', time: 'POS Sync', exception: true },
  ];

  const attentionItems = [
    {
      id: 'att-1',
      severity: 'CRITICAL',
      title: 'Aflatoxin Moisture Contamination Outbreak',
      batchId: 'BATCH-CD-2025-004',
      product: 'Organic Chana Dal 1KG',
      quantity: '500 Bags (Silo A-4)',
      owner: 'Indore Quality Labs',
      time: '12 min ago',
      actionText: 'Execute Recall',
      actionUrl: '/dashboard/recall',
    },
    {
      id: 'att-2',
      severity: 'MAJOR',
      title: 'Cold-Chain Temperature Deviation (> 8.4°C for 42 mins)',
      batchId: 'BATCH-MO-2025-003',
      product: 'Cold-Pressed Mustard Oil 1L',
      quantity: '800 Bottles',
      owner: 'AgriTransit Logistics #04',
      time: '1 hr ago',
      actionText: 'Inspect IoT Log',
      actionUrl: '/dashboard/incidents',
    },
    {
      id: 'att-3',
      severity: 'MINOR',
      title: 'FSSAI Heavy Metal Chemical Assay Renewal Due',
      batchId: 'SKU-WHT-001',
      product: 'Organic Sharbati Wheat Flour 5KG',
      quantity: 'Annual License',
      owner: 'Sahyadri Regulatory Dept',
      time: '2 hrs ago',
      actionText: 'Review Assay',
      actionUrl: '/dashboard/regulator',
    },
  ];

  const recentAudits = [
    { block: '#18,492', timestamp: '14:22:01', event: 'Dual-QR Serialization Minted', batch: 'BATCH-WF-2025-042', actor: 'Sahyadri Milling', txHash: '0x88f2...fd83', verified: true },
    { block: '#18,491', timestamp: '13:58:44', event: 'Custodian Handover (Transit)', batch: 'BATCH-BR-2025-018', actor: 'AgriTransit Log', txHash: '0x33aa...be03', verified: true },
    { block: '#18,490', timestamp: '12:11:10', event: 'POS Quarantine Lockdown', batch: 'BATCH-CD-2025-004', actor: 'SmartContract #09', txHash: '0x99dd...733f', verified: true },
    { block: '#18,489', timestamp: '11:45:22', event: 'Harvest Genesis Registered', batch: 'BATCH-TD-2025-009', actor: 'Latur Co-Op', txHash: '0x55cc...aa89', verified: true },
    { block: '#18,488', timestamp: '10:04:19', event: 'Laboratory Assay Passed', batch: 'BATCH-HH-2025-001', actor: 'FSSAI MH Lab', txHash: '0x77ee...9949', verified: true },
  ];

  return (
    <div className={styles.dashboardContainer}>
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <h1 className={styles.pageTitle}>FoodTrace Operations & Supply Chain Console</h1>
          <p className={styles.pageSub}>
            Real-time multi-echelon traceability, immutable chain-of-custody, and automated risk quarantine.
          </p>
        </div>

        <div className={styles.headerActions}>
          <Link href="/dashboard/batches" className="btn btn--secondary">
            View All Batches
          </Link>
          <Link href="/dashboard/recall" className="btn btn--primary">
            Risk Propagator
          </Link>
        </div>
      </div>

      {/* ── 1. Compact Operational Status Strip ───────────────── */}
      <div className={styles.statusStrip}>
        {statusMetrics.map((m) => (
          <div key={m.label} className={styles.statusItem}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className={styles.statusLabel}>{m.label}</span>
              <span className={`badge badge--${m.tagType}`} style={{ fontSize: '9.5px', padding: '1px 4px' }}>
                {m.tag}
              </span>
            </div>
            <div className={styles.statusNumRow}>
              <span className={styles.statusNum}>{m.value}</span>
            </div>
            <span className={styles.statusSub}>{m.sub}</span>
          </div>
        ))}
      </div>

      {/* ── 2. Operational Flow Pipeline (Multi-Stage Network) ── */}
      <div className={styles.flowSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>
            <IconActivity size={15} color="#2563EB" />
            <span>End-to-End Supply Chain Lineage Throughput</span>
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Channel: <strong>foodtrace-mainnet-0</strong> • 100% Cryptographic Consensus
          </span>
        </div>

        <div className={styles.flowTrack}>
          {pipelineStages.map((stage) => (
            <div
              key={stage.name}
              className={styles.stageNode}
              style={{
                borderColor: stage.exception ? 'var(--color-danger-border)' : undefined,
                background: stage.exception ? 'var(--color-danger-bg)' : undefined,
              }}
            >
              <div className={styles.stageTop}>
                <span className={styles.stageName}>{stage.name}</span>
                <span className={styles.stageCount}>{stage.batches} Batches</span>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {stage.units}
              </div>
              <div className={styles.stageMeta}>
                <span style={{ color: stage.exception ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 600 }}>
                  ● {stage.status}
                </span>
                <span>{stage.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Attention Required Operational Triage Panel ────── */}
      <div className={styles.attentionSection}>
        <div className={styles.attentionHeader}>
          <span className={styles.attentionTitle}>
            <span>⚠️ Attention Required: Active Operational & Quality Exceptions</span>
          </span>
          <span style={{ fontSize: '11px', color: 'var(--color-danger)', fontWeight: 600 }}>
            3 Active Exceptions
          </span>
        </div>

        <div className={styles.attentionList}>
          {attentionItems.map((item) => (
            <div key={item.id} className={styles.attentionRow}>
              <div className={styles.attentionLeft}>
                <span
                  className={`badge badge--${
                    item.severity === 'CRITICAL' ? 'danger' : item.severity === 'MAJOR' ? 'warning' : 'info'
                  }`}
                >
                  {item.severity}
                </span>
                <div>
                  <div className={styles.attentionDesc}>{item.title}</div>
                  <div className={styles.attentionMeta}>
                    <span>Batch: <strong className="mono-num">{item.batchId}</strong></span>
                    <span>Product: {item.product}</span>
                    <span>Volume: {item.quantity}</span>
                    <span>Owner: {item.owner}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.time}</span>
                <Link
                  href={item.actionUrl}
                  className={`btn btn--${item.severity === 'CRITICAL' ? 'danger' : 'secondary'}`}
                  style={{ height: '28px', fontSize: '11.5px', padding: '0 10px' }}
                >
                  {item.actionText} <IconArrowUpRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Main Two-Column Grid: Telemetry + Recent Ledger ── */}
      <div className={styles.mainGrid}>
        {/* Panel 1: Batch Stage Distribution & Cold-Chain Health */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Batch Stage Breakdown & Cold-Chain Telemetry</span>
            <span className="badge badge--neutral">128 Total Batches</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className={styles.distributionBar}>
              <div style={{ width: '14%', background: '#D97706' }} title="Harvested (14%)"></div>
              <div style={{ width: '25%', background: '#6366F1' }} title="Processing (25%)"></div>
              <div style={{ width: '35%', background: '#059669' }} title="Packaged & Sealed (35%)"></div>
              <div style={{ width: '22%', background: '#2563EB' }} title="In Transit (22%)"></div>
              <div style={{ width: '4%', background: '#DC2626' }} title="Quarantined (4%)"></div>
            </div>

            <div className={styles.distLegRow}>
              <div className={styles.distLegItem}>
                <span style={{ color: 'var(--text-secondary)' }}>● Packaged (Dual-QR)</span>
                <span className="mono-num" style={{ fontWeight: 700 }}>45 (35%)</span>
              </div>
              <div className={styles.distLegItem}>
                <span style={{ color: 'var(--text-secondary)' }}>● In Processing</span>
                <span className="mono-num" style={{ fontWeight: 700 }}>32 (25%)</span>
              </div>
              <div className={styles.distLegItem}>
                <span style={{ color: 'var(--text-secondary)' }}>● In Transit (IoT GPS)</span>
                <span className="mono-num" style={{ fontWeight: 700 }}>28 (22%)</span>
              </div>
              <div className={styles.distLegItem}>
                <span style={{ color: 'var(--text-secondary)' }}>● Origin Harvested</span>
                <span className="mono-num" style={{ fontWeight: 700 }}>18 (14%)</span>
              </div>
              <div className={styles.distLegItem} style={{ gridColumn: 'span 2' }}>
                <span style={{ color: 'var(--color-danger)' }}>● Quarantined / Recall Hold</span>
                <span className="mono-num" style={{ fontWeight: 700, color: 'var(--color-danger)' }}>5 (4%)</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>Telemetry: <strong>Cold-Chain IoT 99.8% nominal</strong></span>
            <Link href="/dashboard/batches" style={{ color: 'var(--color-info)', fontWeight: 600 }}>
              View Batch Hierarchy →
            </Link>
          </div>
        </div>

        {/* Panel 2: Recent Ledger Audit Trail */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Recent Immutable Ledger Transactions</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Hyperledger Fabric Raft Consensus
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className={styles.auditTable}>
              <thead>
                <tr>
                  <th>Block</th>
                  <th>Time</th>
                  <th>Operational Action</th>
                  <th>Target Batch</th>
                  <th>Custodian</th>
                  <th>Tx Hash</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
                {recentAudits.map((a) => (
                  <tr key={a.block}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>{a.block}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{a.timestamp}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.event}</td>
                    <td>
                      <Link href={`/track/batch/${a.batch}`} style={{ color: 'var(--color-info)', textDecoration: 'underline' }}>
                        {a.batch}
                      </Link>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{a.actor}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px' }}>{a.txHash}</td>
                    <td>
                      <span className="badge badge--success" style={{ fontSize: '9.5px' }}>✓ Verified</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', marginTop: 'auto' }}>
            <span style={{ color: 'var(--text-muted)' }}>ECDSA P-256 signatures validated across all peer orgs.</span>
            <Link href="/dashboard/regulator" style={{ color: 'var(--color-info)', fontWeight: 600 }}>
              Open Regulatory Dossier →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
