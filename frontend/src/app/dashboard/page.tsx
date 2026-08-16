'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function DashboardOverviewPage() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.title}>FoodTrace Intelligence Dashboard</div>
        <div className={styles.subtitle}>
          Master operational control for packaged foods, batch provenance, serial generation, and targeted recalls.
        </div>
      </div>

      {/* Metrics Row */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Registered SKUs</span>
          <span className={styles.metricValue}>14</span>
          <span className={styles.metricSub}>+2 added this week</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Active Batches</span>
          <span className={styles.metricValue}>128</span>
          <span className={styles.metricSub}>100% lineage verified</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Provisioned Units</span>
          <span className={styles.metricValue}>45,200</span>
          <span className={styles.metricSub}>Dual QR + Credential</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Risk Incidents</span>
          <span className={styles.metricValue} style={{ color: 'var(--color-alert-red)' }}>1</span>
          <span className={styles.metricSub} style={{ color: 'var(--color-alert-red)' }}>Action required</span>
        </div>
      </div>

      <div className={styles.sectionsGrid}>
        {/* Quick Operations */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Quick Operations</h3>
          </div>
          <div className={styles.quickActions}>
            <Link href="/dashboard/batches" className={styles.actionBtn}>
              <span>📦 Create New Production Batch</span>
              <span>→</span>
            </Link>
            <Link href="/dashboard/units" className={styles.actionBtn}>
              <span>🏷️ Provision Dual QRs & Credentials for Packaging</span>
              <span>→</span>
            </Link>
            <Link href="/dashboard/recall" className={styles.actionBtn}>
              <span>🚨 Risk Propagator & Targeted Recall Panel</span>
              <span>→</span>
            </Link>
            <Link href="/dashboard/incidents" className={styles.actionBtn}>
              <span>📩 Review Consumer Incident Submissions</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* System Health */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Network Node Status</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-oat-200)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Fabric Peer Node:</span>
              <span style={{ color: 'var(--brand-green)', fontWeight: '700' }}>● ONLINE (Peer 0)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-oat-200)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>PostgreSQL Read Replica:</span>
              <span style={{ color: 'var(--brand-green)', fontWeight: '700' }}>● HEALTHY</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-oat-200)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>IPFS Storage Gateway:</span>
              <span style={{ color: 'var(--brand-green)', fontWeight: '700' }}>● CONNECTED</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
              <span style={{ color: 'var(--text-secondary)' }}>FastAPI Router:</span>
              <span style={{ color: 'var(--color-grass-500)', fontWeight: '700' }}>v1.0.0 Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
