'use client';

import { useState } from 'react';
import styles from './page.module.css';
import {
  IconShield,
} from '@/components/icons/Icons';

export default function RecallPage() {
  const [targetBatch, setTargetBatch] = useState('BATCH-CD-2025-004');
  const [recallExecuted, setRecallExecuted] = useState(false);

  const isContaminated = targetBatch === 'BATCH-CD-2025-004';

  const handleExecuteRecall = () => {
    setRecallExecuted(true);
    alert(`SMART CONTRACT RECALL BROADCAST COMPLETED!\nBatch ${targetBatch} locked on-chain. POS terminals updated across 24 retail stores.`);
  };

  return (
    <div className={styles.container}>
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className={styles.topBar}>
        <div className={styles.titleBlock}>
          <h1 className={styles.pageTitle}>Targeted Recall Command & Risk Propagator</h1>
          <p className={styles.pageSubtitle}>
            Graph-based blast radius isolation, forward supply chain dependency tracing, and automated POS shelf lockouts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn--danger"
            onClick={handleExecuteRecall}
          >
            🚨 Execute On-Chain Recall Lockdown
          </button>
        </div>
      </div>

      {/* ── Status Metrics Strip ──────────────────────────────── */}
      <div className={styles.metricsStrip}>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Blast Radius Isolation</span>
          <span className={styles.metricVal} style={{ color: 'var(--color-success)' }}>&lt; 0.05%</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Targeted lot containment</span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>POS Lockout Latency</span>
          <span className={styles.metricVal}>14 ms</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Smart contract event broadcast</span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Synchronized Retail Shelves</span>
          <span className={styles.metricVal}>24 Outlets</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Live ledger webhook handshake</span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Mitigated Inventory Waste</span>
          <span className={styles.metricVal} style={{ color: 'var(--color-success)' }}>$34,200</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Uncontaminated stock preserved</span>
        </div>
      </div>

      {/* ── DAG Simulation Grid ───────────────────────────────── */}
      <div className={styles.dagGrid}>
        {/* Left: Query Panel */}
        <div className={styles.controlPanel}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IconShield size={16} color="var(--color-danger)" />
            <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>Risk Propagator Query</h3>
          </div>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Select an origin batch to trace forward Directed Acyclic Graph (DAG) dependencies across silos, logistics hubs, and retail outlets.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Root Lot / Batch ID</label>
            <select
              style={{
                height: '32px',
                padding: '0 10px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                fontSize: '12px',
                background: 'var(--bg-subtle)',
                outline: 'none',
              }}
              value={targetBatch}
              onChange={(e) => {
                setTargetBatch(e.target.value);
                setRecallExecuted(false);
              }}
            >
              <option value="BATCH-CD-2025-004">BATCH-CD-2025-004 (Chana Dal - Critical)</option>
              <option value="BATCH-WF-2025-042">BATCH-WF-2025-042 (Wheat Flour - Clean)</option>
              <option value="BATCH-BR-2025-018">BATCH-BR-2025-018 (Basmati Rice - Clean)</option>
            </select>
          </div>

          {isContaminated ? (
            <div style={{ background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', borderRadius: '4px', padding: '10px', fontSize: '11.5px', color: 'var(--color-danger)' }}>
              <strong>Contamination Vector Confirmed:</strong> Forward DAG propagates risk to 1 Processing Silo, 2 Logistics Hubs, and 24 Retail Shelves.
            </div>
          ) : (
            <div style={{ background: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', borderRadius: '4px', padding: '10px', fontSize: '11.5px', color: 'var(--color-success)' }}>
              <strong>Lineage Clean:</strong> Zero cross-contamination detected across downstream retail nodes.
            </div>
          )}

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              className="btn btn--secondary"
              onClick={() => alert(`Recalculated forward DAG graph dependencies for ${targetBatch}`)}
            >
              Recalculate Blast Radius
            </button>
          </div>
        </div>

        {/* Right: Interactive DAG Graph */}
        <div className={styles.graphPanel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Directed Acyclic Graph (DAG) Forward Lineage Progression
            </span>
            <span style={{ fontSize: '11px', color: recallExecuted ? 'var(--color-danger)' : 'var(--text-muted)', fontWeight: 600 }}>
              {recallExecuted ? '● RECALL BROADCAST COMMITTED' : '● SIMULATING LIVE PATHWAY'}
            </span>
          </div>

          <div className={styles.dagCanvas}>
            {/* Node 1 */}
            <div className={`${styles.dagNode} ${isContaminated ? styles.nodeInfected : styles.nodeSafe}`}>
              <span className={styles.nodeStage}>1. Farm Origin</span>
              <span className={styles.nodeName}>Farmer Cluster #402</span>
              <span className={styles.nodeSub}>{targetBatch}</span>
            </div>

            <span style={{ color: isContaminated ? 'var(--color-danger)' : 'var(--text-subtle)', fontWeight: 800 }}>→</span>

            {/* Node 2 */}
            <div className={`${styles.dagNode} ${isContaminated ? styles.nodeInfected : styles.nodeSafe}`}>
              <span className={styles.nodeStage}>2. Processing Silo</span>
              <span className={styles.nodeName}>Indore Mill Unit #01</span>
              <span className={styles.nodeSub}>Silo A-4 (500 KG)</span>
            </div>

            <span style={{ color: isContaminated ? 'var(--color-danger)' : 'var(--text-subtle)', fontWeight: 800 }}>→</span>

            {/* Node 3 */}
            <div className={`${styles.dagNode} ${isContaminated ? styles.nodeInfected : styles.nodeSafe}`}>
              <span className={styles.nodeStage}>3. Serial Packaging</span>
              <span className={styles.nodeName}>Packaging Unit</span>
              <span className={styles.nodeSub}>500 Sealed Bags</span>
            </div>

            <span style={{ color: isContaminated ? 'var(--color-danger)' : 'var(--text-subtle)', fontWeight: 800 }}>→</span>

            {/* Node 4 */}
            <div className={`${styles.dagNode} ${isContaminated ? styles.nodeInfected : styles.nodeSafe}`}>
              <span className={styles.nodeStage}>4. Point of Sale (POS)</span>
              <span className={styles.nodeName}>Retail Shelves</span>
              <span className={styles.nodeSub}>{recallExecuted ? '⛔ POS LOCKED' : '24 Outlets'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: 'var(--text-muted)' }}>
            <span>Targeted Recall quarantines contaminated items without blanket product waste.</span>
            <span className="mono-num" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Channel: foodtrace-mainnet-0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
