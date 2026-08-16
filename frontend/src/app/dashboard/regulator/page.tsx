'use client';

import { useState } from 'react';
import styles from './page.module.css';
import {
  IconSearch,
  IconCopy,
  IconExternal,
} from '@/components/icons/Icons';

interface Certificate {
  id: string;
  certNumber: string;
  facility: string;
  certType: string;
  authority: string;
  validUntil: string;
  ipfsHash: string;
  status: 'ACTIVE' | 'RENEWAL_DUE' | 'AUDIT_PENDING';
}

const CERTS_DATA: Certificate[] = [
  { id: '1', certNumber: 'FSSAI-MH-2026-004', facility: 'Sahyadri Milling Unit #04', certType: 'Central Food Safety License (Manufacturing)', authority: 'FSSAI Regional MH', validUntil: '31 Dec 2026', ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG', status: 'ACTIVE' },
  { id: '2', certNumber: 'ORG-APEDA-2026-091', facility: 'Nashik Organic Farmer Cluster #402', certType: 'NPOP Organic Farming Certification', authority: 'APEDA India', validUntil: '15 Oct 2026', ipfsHash: 'QmRAQB6YaCyidP37UdDnjFY5vQuiBrcqdyoW1CuDgwxkD4', status: 'ACTIVE' },
  { id: '3', certNumber: 'ISO-22000-FSMS-2026', facility: 'Alwar Cold-Press Unit #02', certType: 'ISO 22000:2018 Food Safety Management', authority: 'Bureau Veritas', validUntil: '20 Sep 2026', ipfsHash: 'QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq', status: 'RENEWAL_DUE' },
  { id: '4', certNumber: 'FSSAI-MP-2026-112', facility: 'Indore Pulse Processing Plant', certType: 'Central Food Processing License', authority: 'FSSAI Regional MP', validUntil: '10 Aug 2026 (Expired)', ipfsHash: 'QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2hLDFms8Cwo7W3hB', status: 'AUDIT_PENDING' },
];

export default function RegulatorPage() {
  const [certs] = useState<Certificate[]>(CERTS_DATA);
  const [search, setSearch] = useState('');
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(CERTS_DATA[0]);

  const filtered = certs.filter((c) =>
    c.certNumber.toLowerCase().includes(search.toLowerCase()) ||
    c.facility.toLowerCase().includes(search.toLowerCase()) ||
    c.certType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className={styles.topBar}>
        <div className={styles.titleBlock}>
          <h1 className={styles.pageTitle}>Regulatory Compliance & Evidence Vault</h1>
          <p className={styles.pageSubtitle}>
            FSSAI Section 16 compliance dossiers, APEDA organic credentials, ISO certifications, and auditor attestations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn--primary"
            onClick={() => alert('Generating FSSAI Comprehensive Annual Compliance Certificate on Blockchain...')}
          >
            Generate FSSAI Dossier
          </button>
        </div>
      </div>

      {/* ── Status Metrics Strip ──────────────────────────────── */}
      <div className={styles.metricsStrip}>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Audit Readiness Score</span>
          <span className={styles.metricVal} style={{ color: 'var(--color-success)' }}>98.4%</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>FSSAI Schedule IV Compliant</span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Active Licenses</span>
          <span className={styles.metricVal}>156</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Valid across 27 facilities</span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Renewals Due (30 Days)</span>
          <span className={styles.metricVal} style={{ color: 'var(--color-warning)' }}>7</span>
          <span style={{ fontSize: '11px', color: 'var(--color-warning)' }}>Action required</span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Audit Trail Integrity</span>
          <span className={styles.metricVal} style={{ color: 'var(--color-success)' }}>100%</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Zero ledger tampering</span>
        </div>
      </div>

      {/* ── Split Auditor Console Layout ──────────────────────── */}
      <div className={styles.consoleGrid}>
        {/* Left: Certificate Registry Table */}
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
                placeholder="Search certificate, facility..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Showing <strong>{filtered.length}</strong> certificates
            </span>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>License / Cert No</th>
                  <th>Facility Location</th>
                  <th>Scope</th>
                  <th>Valid Until</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCert(c)}
                    style={{ background: selectedCert?.id === c.id ? '#EFF6FF' : undefined, cursor: 'pointer' }}
                  >
                    <td>
                      <span className="mono-num" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {c.certNumber}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.facility}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.certType}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{c.validUntil}</td>
                    <td>
                      {c.status === 'ACTIVE' ? (
                        <span className="badge badge--success">✓ Valid</span>
                      ) : c.status === 'RENEWAL_DUE' ? (
                        <span className="badge badge--warning">● Renewal Due</span>
                      ) : (
                        <span className="badge badge--danger">● Audit Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Auditor Evidence Dossier */}
        {selectedCert && (
          <div className={styles.dossierCard}>
            <div>
              <span className="badge badge--neutral mono-num">{selectedCert.certNumber}</span>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                {selectedCert.certType}
              </h3>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Facility: <strong>{selectedCert.facility}</strong>
              </div>
            </div>

            {/* Verification Metadata */}
            <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Issuing Authority</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedCert.authority}</div>
              </div>
              <div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Validity Period</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedCert.validUntil}</div>
              </div>
            </div>

            {/* IPFS Proof */}
            <div style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Encrypted IPFS Certificate Proof</span>
                <div className="mono-num" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{selectedCert.ipfsHash.substring(0, 24)}...</div>
              </div>
              <button
                onClick={() => alert(`IPFS Certificate Hash:\n${selectedCert.ipfsHash}`)}
                style={{ fontSize: '11px', color: 'var(--color-info)', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                <IconCopy size={11} /> Copy
              </button>
            </div>

            {/* Auditor Actions */}
            <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
              <button
                className="btn btn--secondary"
                style={{ flex: 1 }}
                onClick={() => alert(`Certificate ${selectedCert.certNumber} PDF downloaded.`)}
              >
                <IconExternal size={12} /> Download PDF
              </button>
              <button
                className="btn btn--primary"
                style={{ flex: 1 }}
                onClick={() => alert(`Cryptographic verification proof confirmed for ${selectedCert.certNumber}.`)}
              >
                Verify On-Chain
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
