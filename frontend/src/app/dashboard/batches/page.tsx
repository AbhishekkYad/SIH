'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import {
  IconSearch,
  IconClose,
  IconCopy,
  IconExternal,
} from '@/components/icons/Icons';

interface Batch {
  id: string;
  batchNumber: string;
  productName: string;
  custodian: string;
  quantity: number;
  unitType: string;
  healthScore: number;
  stage: 'HARVESTED' | 'PROCESSING' | 'PACKAGED' | 'IN_TRANSIT' | 'RETAIL_READY' | 'RECALLED';
  txHash: string;
  blockHeight: number;
  createdDate: string;
  temperature: string;
  humidity: string;
  farmOrigin: string;
}

const BATCHES_DATA: Batch[] = [
  {
    id: '1',
    batchNumber: 'BATCH-WF-2025-042',
    productName: 'Organic Sharbati Wheat Flour 5KG',
    custodian: 'Sahyadri Milling Unit #04',
    quantity: 450,
    unitType: 'Bags',
    healthScore: 98,
    stage: 'PACKAGED',
    txHash: '0x88f291ab4289be03b4a606b7f6c9733f3b7fdd83',
    blockHeight: 18492,
    createdDate: '10 Aug 2026',
    temperature: '21.4°C',
    humidity: '11.8%',
    farmOrigin: 'Farmer Cluster #402, Nashik Valley',
  },
  {
    id: '2',
    batchNumber: 'BATCH-BR-2025-018',
    productName: 'Premium Basmati Rice 10KG',
    custodian: 'Taraori Rice Mills, Karnal',
    quantity: 1200,
    unitType: 'Sacks',
    healthScore: 94,
    stage: 'IN_TRANSIT',
    txHash: '0x33aa0911fe89be03b4a606b7f6c9733f3b7fdd83',
    blockHeight: 18491,
    createdDate: '08 Aug 2026',
    temperature: '22.0°C',
    humidity: '12.1%',
    farmOrigin: 'Karnal Organic Co-Op, Haryana',
  },
  {
    id: '3',
    batchNumber: 'BATCH-MO-2025-003',
    productName: 'Cold-Pressed Mustard Oil 1L',
    custodian: 'Alwar Cold-Press Unit #02',
    quantity: 800,
    unitType: 'Bottles',
    healthScore: 82,
    stage: 'IN_TRANSIT',
    txHash: '0x12ff8849aa89be03b4a606b7f6c9733f3b7fdd83',
    blockHeight: 18485,
    createdDate: '05 Aug 2026',
    temperature: '8.4°C (Excursion)',
    humidity: 'N/A',
    farmOrigin: 'Alwar Mustard Growers, Rajasthan',
  },
  {
    id: '4',
    batchNumber: 'BATCH-TD-2025-009',
    productName: 'Unpolished Toor Dal 1KG',
    custodian: 'Latur Agri Co-Op Cluster',
    quantity: 600,
    unitType: 'Pouches',
    healthScore: 100,
    stage: 'HARVESTED',
    txHash: '0x55cc2249aa89be03b4a606b7f6c9733f3b7fdd83',
    blockHeight: 18480,
    createdDate: '12 Aug 2026',
    temperature: '24.1°C',
    humidity: '10.2%',
    farmOrigin: 'Marathwada Organic Hub, Latur',
  },
  {
    id: '5',
    batchNumber: 'BATCH-CD-2025-004',
    productName: 'Organic Chana Dal 1KG',
    custodian: 'Indore Pulse Processing',
    quantity: 500,
    unitType: 'Pouches',
    healthScore: 42,
    stage: 'RECALLED',
    txHash: '0x99dd1149aa89be03b4a606b7f6c9733f3b7fdd83',
    blockHeight: 18475,
    createdDate: '28 Jul 2026',
    temperature: '26.8°C',
    humidity: '18.4% (Moisture Exceeded)',
    farmOrigin: 'Malwa Farmer Association, MP',
  },
];

export default function BatchesPage() {
  const [batches] = useState<Batch[]>(BATCHES_DATA);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(BATCHES_DATA[0]);

  const filtered = batches.filter((b) => {
    const matchSearch = b.batchNumber.toLowerCase().includes(search.toLowerCase()) || b.productName.toLowerCase().includes(search.toLowerCase()) || b.custodian.toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === 'ALL' || b.stage === stageFilter;
    return matchSearch && matchStage;
  });

  const getStageBadge = (stage: Batch['stage']) => {
    switch (stage) {
      case 'PACKAGED':
      case 'RETAIL_READY':
        return <span className="badge badge--success">● {stage}</span>;
      case 'IN_TRANSIT':
        return <span className="badge badge--info">● {stage.replace('_', ' ')}</span>;
      case 'PROCESSING':
      case 'HARVESTED':
        return <span className="badge badge--warning">● {stage}</span>;
      case 'RECALLED':
        return <span className="badge badge--danger">● QUARANTINED</span>;
    }
  };

  const getHealthBadge = (score: number) => {
    if (score >= 90) return <span className="mono-num" style={{ color: 'var(--color-success)', fontWeight: 700 }}>● {score}/100</span>;
    if (score >= 70) return <span className="mono-num" style={{ color: 'var(--color-warning)', fontWeight: 700 }}>● {score}/100</span>;
    return <span className="mono-num" style={{ color: 'var(--color-danger)', fontWeight: 700 }}>● {score}/100</span>;
  };

  return (
    <div className={styles.container}>
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className={styles.topBar}>
        <div className={styles.titleBlock}>
          <h1 className={styles.pageTitle}>Production Batches & Lineage Ledger</h1>
          <p className={styles.pageSubtitle}>
            Full multi-echelon chain-of-custody, cryptographic signatures, sensory assays, and cold-chain compliance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn--secondary"
            onClick={() => alert('Exporting batch provenance audit trail CSV...')}
          >
            Export CSV
          </button>
          <button
            className="btn btn--primary"
            onClick={() => alert('Simulating genesis batch creation on Hyperledger Fabric...')}
          >
            + Create Genesis Batch
          </button>
        </div>
      </div>

      {/* ── Status Metrics Strip ──────────────────────────────── */}
      <div className={styles.metricsStrip}>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Total Active Batches</span>
          <span className={styles.metricVal}>128</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>100% On-Chain Ledger</span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Units In-Transit</span>
          <span className={styles.metricVal}>28,500</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>GPS Cold-Chain Sync Active</span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Consensus Rate</span>
          <span className={styles.metricVal} style={{ color: 'var(--color-success)' }}>100%</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Raft Orderer Verified</span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Quarantined Batches</span>
          <span className={styles.metricVal} style={{ color: 'var(--color-danger)' }}>1</span>
          <span style={{ fontSize: '11px', color: 'var(--color-danger)' }}>Aflatoxin Contamination</span>
        </div>
      </div>

      {/* ── Filter Toolbar ────────────────────────────────────── */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}>
            <IconSearch size={13} />
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Filter by Batch ID, product, or custodian..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.chipGroup}>
          {(['ALL', 'HARVESTED', 'PROCESSING', 'PACKAGED', 'IN_TRANSIT', 'RECALLED'] as const).map((st) => (
            <button
              key={st}
              className={`${styles.filterBtn} ${stageFilter === st ? styles.filterBtnActive : ''}`}
              onClick={() => setStageFilter(st)}
            >
              {st === 'ALL' ? 'All Stages' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ── Dense Batch Grid Table ────────────────────────────── */}
      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Batch Identifier</th>
                <th>Product Description</th>
                <th>Current Custodian</th>
                <th>Volume</th>
                <th>Health Score</th>
                <th>Stage</th>
                <th>Fabric Block</th>
                <th>Origin / Genesis</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => setSelectedBatch(b)}
                  className={selectedBatch?.id === b.id ? styles.rowSelected : ''}
                >
                  <td>
                    <span className="mono-num" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {b.batchNumber}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{b.productName}</td>
                  <td>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{b.custodian}</span>
                  </td>
                  <td className="mono-num" style={{ fontWeight: 600 }}>
                    {b.quantity} {b.unitType}
                  </td>
                  <td>{getHealthBadge(b.healthScore)}</td>
                  <td>{getStageBadge(b.stage)}</td>
                  <td>
                    <code className="badge badge--neutral mono-num">
                      #{b.blockHeight}
                    </code>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{b.farmOrigin}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{b.createdDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Contextual Right-Side Batch Detail Workspace Drawer ─ */}
      {selectedBatch && (
        <div className={styles.drawerBackdrop} onClick={() => setSelectedBatch(null)}>
          <div className={styles.drawerPanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Batch Workspace Inspection
                </span>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {selectedBatch.batchNumber}
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {selectedBatch.productName}
                </div>
              </div>
              <button onClick={() => setSelectedBatch(null)} className="btn btn--ghost" style={{ padding: '4px' }}>
                <IconClose size={16} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              {/* Batch Metadata Grid */}
              <div className={styles.detailSection}>
                <div className={styles.detailTitle}>Cryptographic Batch Summary</div>
                <div className={styles.detailGrid}>
                  <div className={styles.detailField}>
                    <span className={styles.detailLabel}>Health Index</span>
                    <span className={styles.detailVal}>{getHealthBadge(selectedBatch.healthScore)}</span>
                  </div>
                  <div className={styles.detailField}>
                    <span className={styles.detailLabel}>Stage</span>
                    <span className={styles.detailVal}>{getStageBadge(selectedBatch.stage)}</span>
                  </div>
                  <div className={styles.detailField}>
                    <span className={styles.detailLabel}>Current Custodian</span>
                    <span className={styles.detailVal}>{selectedBatch.custodian}</span>
                  </div>
                  <div className={styles.detailField}>
                    <span className={styles.detailLabel}>Inventory Volume</span>
                    <span className={styles.detailVal}>{selectedBatch.quantity} {selectedBatch.unitType}</span>
                  </div>
                  <div className={styles.detailField}>
                    <span className={styles.detailLabel}>Sensory Temperature</span>
                    <span className={styles.detailVal}>{selectedBatch.temperature}</span>
                  </div>
                  <div className={styles.detailField}>
                    <span className={styles.detailLabel}>Moisture Content</span>
                    <span className={styles.detailVal}>{selectedBatch.humidity}</span>
                  </div>
                </div>
              </div>

              {/* Chain of Custody Timeline */}
              <div className={styles.detailSection}>
                <div className={styles.detailTitle}>Immutable Chain of Custody</div>
                <div className={styles.timelineWrapper}>
                  <div className={styles.timelineItem}>
                    <div className={`${styles.timelineDot} ${styles.timelineDotVerified}`}></div>
                    <div className={styles.timelineHeader}>
                      <span>1. Genesis Harvest Registration</span>
                      <span className="mono-num" style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>06:45 AM</span>
                    </div>
                    <div className={styles.timelineMeta}>
                      {selectedBatch.farmOrigin} • Harvest assay certified
                    </div>
                  </div>

                  <div className={styles.timelineItem}>
                    <div className={`${styles.timelineDot} ${styles.timelineDotVerified}`}></div>
                    <div className={styles.timelineHeader}>
                      <span>2. Grain Cleaning & Processing</span>
                      <span className="mono-num" style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>10:15 AM</span>
                    </div>
                    <div className={styles.timelineMeta}>
                      Sahyadri Milling Unit #04 • Optical Sortex classification
                    </div>
                  </div>

                  <div className={styles.timelineItem}>
                    <div className={`${styles.timelineDot} ${styles.timelineDotVerified}`}></div>
                    <div className={styles.timelineHeader}>
                      <span>3. Packaging & Dual-QR Serialization</span>
                      <span className="mono-num" style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>11:30 AM</span>
                    </div>
                    <div className={styles.timelineMeta}>
                      450 Consumer Units provisioned with tamper-evident scratch keys
                    </div>
                  </div>
                </div>
              </div>

              {/* Blockchain Proof & Actions */}
              <div className={styles.detailSection}>
                <div className={styles.detailTitle}>Hyperledger Fabric Proof</div>
                <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Transaction Root Hash</span>
                    <button
                      onClick={() => alert(`Copied Tx Hash: ${selectedBatch.txHash}`)}
                      style={{ color: 'var(--color-info)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      <IconCopy size={11} /> Copy
                    </button>
                  </div>
                  <code style={{ fontSize: '11px', wordBreak: 'break-all', color: 'var(--text-secondary)' }}>
                    {selectedBatch.txHash}
                  </code>
                </div>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                <Link
                  href={`/track/batch/${selectedBatch.batchNumber}`}
                  className="btn btn--secondary"
                  style={{ flex: 1 }}
                >
                  <IconExternal size={13} /> Public Journey
                </Link>
                {selectedBatch.stage === 'RECALLED' ? (
                  <Link
                    href="/dashboard/recall"
                    className="btn btn--danger"
                    style={{ flex: 1 }}
                  >
                    View Recall Blast Radius
                  </Link>
                ) : (
                  <button
                    className="btn btn--primary"
                    style={{ flex: 1 }}
                    onClick={() => alert(`Batch ${selectedBatch.batchNumber} audit certificate generated.`)}
                  >
                    Generate Certificate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
