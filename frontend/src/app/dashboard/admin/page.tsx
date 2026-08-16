'use client';

import { useState } from 'react';
import styles from './page.module.css';

interface Org {
  id: string;
  name: string;
  role: string;
  mspId: string;
  users: number;
  status: 'ACTIVE' | 'SUSPENDED';
  joinedDate: string;
}

interface UserRecord {
  id: string;
  username: string;
  role: string;
  org: string;
  lastLogin: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const ORGS_DATA: Org[] = [
  { id: 'ORG-001', name: 'Sahyadri Agro Processing', role: 'Producer / Processor', mspId: 'Org1MSP', users: 12, status: 'ACTIVE', joinedDate: '01 Jul 2026' },
  { id: 'ORG-002', name: 'GreenBasket Retail Pvt Ltd', role: 'Retailer & POS', mspId: 'Org2MSP', users: 8, status: 'ACTIVE', joinedDate: '03 Jul 2026' },
  { id: 'ORG-003', name: 'AgriTransit Logistics', role: 'Cold-Chain Transporter', mspId: 'Org1MSP', users: 5, status: 'ACTIVE', joinedDate: '05 Jul 2026' },
  { id: 'ORG-004', name: 'FSSAI Regional Office MH', role: 'Regulatory Auditor', mspId: 'RegulatorOrg', users: 3, status: 'ACTIVE', joinedDate: '01 Jul 2026' },
  { id: 'ORG-005', name: 'Himalayan Apiaries Cluster', role: 'Farmer Supplier Co-Op', mspId: 'Org1MSP', users: 2, status: 'ACTIVE', joinedDate: '10 Jul 2026' },
];

const USERS_DATA: UserRecord[] = [
  { id: 'USR-001', username: 'admin@sahyadri', role: 'Lead QA Auditor', org: 'Sahyadri Agro Processing', lastLogin: '16 Aug 2026 21:14', status: 'ACTIVE' },
  { id: 'USR-002', username: 'ops@greenbasket', role: 'Retail POS Manager', org: 'GreenBasket Retail', lastLogin: '16 Aug 2026 19:45', status: 'ACTIVE' },
  { id: 'USR-003', username: 'inspector@fssai', role: 'Regional Regulatory Inspector', org: 'FSSAI Regional MH', lastLogin: '15 Aug 2026 16:30', status: 'ACTIVE' },
  { id: 'USR-004', username: 'driver@agritransit', role: 'IoT Logistics Operator', org: 'AgriTransit Logistics', lastLogin: '16 Aug 2026 18:22', status: 'ACTIVE' },
];

const FABRIC_NODES = [
  { name: 'Peer0 Org1 (Sahyadri Processing)', endpoint: 'peer0.org1.foodtrace.io:7051', latency: '3ms', status: 'NOMINAL', blocks: 18492 },
  { name: 'Peer0 Org2 (GreenBasket Retail)', endpoint: 'peer0.org2.foodtrace.io:9051', latency: '4ms', status: 'NOMINAL', blocks: 18492 },
  { name: 'Raft Orderer 0 (Consensus Leader)', endpoint: 'orderer0.foodtrace.io:7050', latency: '2ms', status: 'NOMINAL', blocks: 18492 },
  { name: 'IPFS Storage Gateway Cluster', endpoint: 'ipfs.foodtrace.io:5001', latency: '9ms', status: 'NOMINAL', blocks: '14 Pin CIDs' },
  { name: 'PostgreSQL Relational Core', endpoint: 'db.foodtrace.io:5432', latency: '1ms', status: 'NOMINAL', blocks: 'Replica Sync' },
  { name: 'Redis Cache Cluster', endpoint: 'cache.foodtrace.io:6379', latency: '0.8ms', status: 'NOMINAL', blocks: 'Hit Rate 99.4%' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'orgs' | 'users' | 'nodes'>('orgs');

  return (
    <div className={styles.container}>
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className={styles.topBar}>
        <div className={styles.titleBlock}>
          <h1 className={styles.pageTitle}>Governance, Membership & Node Infrastructure</h1>
          <p className={styles.pageSubtitle}>
            Hyperledger Fabric Membership Service Provider (MSP) identities, role-based access control, and Raft consensus status.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn--primary"
            onClick={() => alert('Opening Org Registration Wizard...')}
          >
            + Register Organization
          </button>
        </div>
      </div>

      {/* ── Status Metrics Strip ──────────────────────────────── */}
      <div className={styles.metricsStrip}>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Member Organizations</span>
          <span className={styles.metricVal}>5</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cryptographic MSP identities</span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Active Operators</span>
          <span className={styles.metricVal}>30</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Role-based access enforced</span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Raft Consensus Quorum</span>
          <span className={styles.metricVal} style={{ color: 'var(--color-success)' }}>3 / 3</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>100% Byzantine fault tolerant</span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>API Response Latency</span>
          <span className={styles.metricVal}>2.8 ms</span>
          <span style={{ fontSize: '11px', color: 'var(--color-success)' }}>FastAPI Gateway nominal</span>
        </div>
      </div>

      {/* ── Tab Switcher ──────────────────────────────────────── */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'orgs' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('orgs')}
        >
          Member Organizations (5)
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'users' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Identities & Roles (4)
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'nodes' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('nodes')}
        >
          Fabric Node Infrastructure (6)
        </button>
      </div>

      {/* ── Tab 1: Organizations ──────────────────────────────── */}
      {activeTab === 'orgs' && (
        <div className={styles.tableContainer}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Organization Identifier</th>
                  <th>Legal Entity</th>
                  <th>Supply Chain Function</th>
                  <th>Fabric MSP</th>
                  <th>Active Operators</th>
                  <th>Status</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {ORGS_DATA.map((org) => (
                  <tr key={org.id}>
                    <td><code className="badge badge--neutral mono-num">{org.id}</code></td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{org.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{org.role}</td>
                    <td><code className="mono-num" style={{ color: 'var(--color-info)' }}>{org.mspId}</code></td>
                    <td className="mono-num" style={{ fontWeight: 600 }}>{org.users} users</td>
                    <td><span className="badge badge--success">✓ Active</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{org.joinedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab 2: Users & Roles ──────────────────────────────── */}
      {activeTab === 'users' && (
        <div className={styles.tableContainer}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Operator Email</th>
                  <th>Role Scope</th>
                  <th>Parent Organization</th>
                  <th>Last Authentication</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {USERS_DATA.map((u) => (
                  <tr key={u.id}>
                    <td><code className="badge badge--neutral mono-num">{u.id}</code></td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.username}</td>
                    <td><span className="badge badge--info">{u.role}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.org}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{u.lastLogin}</td>
                    <td><span className="badge badge--success">✓ Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab 3: Fabric Nodes ───────────────────────────────── */}
      {activeTab === 'nodes' && (
        <div className={styles.healthGrid}>
          {FABRIC_NODES.map((node) => (
            <div key={node.name} className={styles.healthCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{node.name}</span>
                <span className="badge badge--success" style={{ fontSize: '9.5px' }}>● {node.status}</span>
              </div>
              <code style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{node.endpoint}</code>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11px', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                <span>Latency: <strong className="mono-num" style={{ color: 'var(--color-success)' }}>{node.latency}</strong></span>
                <span>Blocks: <strong className="mono-num">{node.blocks}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
