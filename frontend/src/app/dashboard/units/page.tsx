'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import {
  IconSearch,
  IconDownload,
  IconCopy,
  IconExternal,
} from '@/components/icons/Icons';

interface SerialUnit {
  id: string;
  serialNumber: string;
  batchNumber: string;
  outerQR: string;
  scratchKey: string;
  printDate: string;
  scanCount: number;
  status: 'SEALED' | 'AUTHENTICATED' | 'QUARANTINED';
}

const UNITS_DATA: SerialUnit[] = [
  { id: '1', serialNumber: 'UNIT-WF-1002-001', batchNumber: 'BATCH-WF-2025-042', outerQR: 'https://foodtrace.io/qr/u1002001', scratchKey: 'SEC-9812-WF', printDate: '10 Aug 2026', scanCount: 1, status: 'AUTHENTICATED' },
  { id: '2', serialNumber: 'UNIT-WF-1002-002', batchNumber: 'BATCH-WF-2025-042', outerQR: 'https://foodtrace.io/qr/u1002002', scratchKey: 'SEC-7714-WF', printDate: '10 Aug 2026', scanCount: 0, status: 'SEALED' },
  { id: '3', serialNumber: 'UNIT-BR-2018-044', batchNumber: 'BATCH-BR-2025-018', outerQR: 'https://foodtrace.io/qr/u2018044', scratchKey: 'SEC-4421-BR', printDate: '08 Aug 2026', scanCount: 2, status: 'AUTHENTICATED' },
  { id: '4', serialNumber: 'UNIT-MO-3003-012', batchNumber: 'BATCH-MO-2025-003', outerQR: 'https://foodtrace.io/qr/u3003012', scratchKey: 'SEC-1190-MO', printDate: '05 Aug 2026', scanCount: 0, status: 'SEALED' },
  { id: '5', serialNumber: 'UNIT-TD-9009-088', batchNumber: 'BATCH-TD-2025-009', outerQR: 'https://foodtrace.io/qr/u9009088', scratchKey: 'SEC-6632-TD', printDate: '12 Aug 2026', scanCount: 0, status: 'SEALED' },
  { id: '6', serialNumber: 'UNIT-CD-4004-009', batchNumber: 'BATCH-CD-2025-004', outerQR: 'https://foodtrace.io/qr/u4004009', scratchKey: 'SEC-8821-CD', printDate: '28 Jul 2026', scanCount: 5, status: 'QUARANTINED' },
];

export default function UnitsPage() {
  const [units] = useState<SerialUnit[]>(UNITS_DATA);
  const [search, setSearch] = useState('');
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});

  const toggleKey = (id: string) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = units.filter((u) =>
    u.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
    u.batchNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className={styles.topBar}>
        <div className={styles.titleBlock}>
          <h1 className={styles.pageTitle}>Units & Dual-QR Security Serialization</h1>
          <p className={styles.pageSubtitle}>
            Item-level cryptographic provenance: public outer GS1 Digital Link paired with tamper-evident scratch-off credentials.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn--secondary"
            onClick={() => alert('Exporting factory laser applicator print sheet (24 labels/A4)...')}
          >
            <IconDownload size={13} /> Print Sheet
          </button>
          <button
            className="btn btn--primary"
            onClick={() => alert('Provisioning 500 new cryptographic serial pairs on Hyperledger Fabric...')}
          >
            + Provision Serial Range
          </button>
        </div>
      </div>

      {/* ── Metrics Strip ──────────────────────────────────────── */}
      <div className={styles.metricsStrip}>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Total Provisioned Units</span>
          <span className={styles.metricVal}>45,200</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dual-QR Encoded</span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Consumer Verifications</span>
          <span className={styles.metricVal}>18,450</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>40.8% scratch validation rate</span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Anti-Counterfeit Score</span>
          <span className={styles.metricVal} style={{ color: 'var(--color-success)' }}>99.98%</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Zero duplicate collision</span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Quarantined Serials</span>
          <span className={styles.metricVal} style={{ color: 'var(--color-danger)' }}>2</span>
          <span style={{ fontSize: '11px', color: 'var(--color-danger)' }}>Excessive scan collision</span>
        </div>
      </div>

      {/* ── Dual-QR Architecture Banner ───────────────────────── */}
      <div className={styles.banner}>
        <div className={styles.bannerLeft}>
          <span className={styles.bannerTitle}>Dual-Layer Anti-Counterfeiting Security Architecture</span>
          <p className={styles.bannerText}>
            Public Outer QR is accessible to retail scanners to trace farm-to-fork chain-of-custody. The Scratch-Off Secret Key is validated exclusively by the end consumer via SHA-256 HMAC verification to prevent packaging clone attacks.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '8px 14px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)' }}>OUTER QR</div>
            <code className="mono-num" style={{ fontSize: '11px', color: 'var(--color-info)' }}>GS1 DigitalLink</code>
          </div>
          <span style={{ color: 'var(--text-subtle)' }}>+</span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)' }}>SCRATCH SECRET</div>
            <code className="mono-num" style={{ fontSize: '11px', color: 'var(--color-success)' }}>HMAC Token</code>
          </div>
        </div>
      </div>

      {/* ── Dense Table ───────────────────────────────────────── */}
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
              placeholder="Search serial or parent batch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Showing <strong>{filtered.length}</strong> serialized records
          </span>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Serial Identifier</th>
                <th>Parent Batch ID</th>
                <th>Public GS1 QR URI</th>
                <th>Tamper Scratch Secret</th>
                <th>Scan Velocity</th>
                <th>Printed Date</th>
                <th>State</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isRevealed = revealedKeys[u.id];
                return (
                  <tr key={u.id}>
                    <td>
                      <span className="mono-num" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {u.serialNumber}
                      </span>
                    </td>
                    <td>
                      <Link href={`/track/batch/${u.batchNumber}`} style={{ color: 'var(--color-info)', textDecoration: 'underline' }}>
                        {u.batchNumber}
                      </Link>
                    </td>
                    <td>
                      <code className="badge badge--neutral mono-num" style={{ fontSize: '10.5px' }}>
                        {u.outerQR.replace('https://', '')}
                      </code>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <code className="mono-num" style={{ color: isRevealed ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {isRevealed ? u.scratchKey : '••••••••••••'}
                        </code>
                        <button
                          onClick={() => toggleKey(u.id)}
                          style={{ fontSize: '10.5px', color: 'var(--color-info)', textDecoration: 'underline' }}
                        >
                          {isRevealed ? 'Hide' : 'Reveal'}
                        </button>
                      </div>
                    </td>
                    <td className="mono-num" style={{ fontWeight: 600 }}>
                      {u.scanCount} scans
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{u.printDate}</td>
                    <td>
                      {u.status === 'AUTHENTICATED' ? (
                        <span className="badge badge--success">✓ Authenticated</span>
                      ) : u.status === 'SEALED' ? (
                        <span className="badge badge--info">● Sealed</span>
                      ) : (
                        <span className="badge badge--danger">● Quarantined</span>
                      )}
                    </td>
                    <td>
                      <Link
                        href={`/track/batch/${u.batchNumber}`}
                        style={{ color: 'var(--color-info)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        <IconExternal size={11} /> Validate
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
