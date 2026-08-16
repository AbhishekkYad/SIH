'use client';

import { useState } from 'react';
import styles from './page.module.css';

interface Organization {
  id: string;
  name: string;
  type: string;
  mspId: string;
  status: 'ACTIVE' | 'SUSPENDED';
  users: number;
  createdAt: string;
}

interface SystemUser {
  id: string;
  username: string;
  role: string;
  orgId: string;
  orgName: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin: string;
}

const MOCK_ORGS: Organization[] = [
  { id: 'ORG-001', name: 'Sahyadri Agro Processing', type: 'Producer', mspId: 'Org1MSP', status: 'ACTIVE', users: 12, createdAt: '01 Jul 2026' },
  { id: 'ORG-002', name: 'GreenBasket Retail Pvt Ltd', type: 'Retailer', mspId: 'Org2MSP', status: 'ACTIVE', users: 8, createdAt: '03 Jul 2026' },
  { id: 'ORG-003', name: 'AgriTransit Logistics', type: 'Transporter', mspId: 'Org1MSP', status: 'ACTIVE', users: 5, createdAt: '05 Jul 2026' },
  { id: 'ORG-004', name: 'FSSAI Regional Office MH', type: 'Regulator', mspId: 'RegulatorOrg', status: 'ACTIVE', users: 3, createdAt: '01 Jul 2026' },
  { id: 'ORG-005', name: 'Himalayan Apiaries Cluster', type: 'Supplier', mspId: 'Org1MSP', status: 'SUSPENDED', users: 2, createdAt: '10 Jul 2026' },
];

const MOCK_USERS: SystemUser[] = [
  { id: 'USR-001', username: 'admin@sahyadri', role: 'producer', orgId: 'ORG-001', orgName: 'Sahyadri Agro Processing', status: 'ACTIVE', lastLogin: '16 Aug 2026 14:22' },
  { id: 'USR-002', username: 'ops@greenbasket', role: 'retailer', orgId: 'ORG-002', orgName: 'GreenBasket Retail', status: 'ACTIVE', lastLogin: '16 Aug 2026 09:45' },
  { id: 'USR-003', username: 'inspector@fssai', role: 'regulator', orgId: 'ORG-004', orgName: 'FSSAI Regional Office MH', status: 'ACTIVE', lastLogin: '15 Aug 2026 18:11' },
  { id: 'USR-004', username: 'driver@agritransit', role: 'transporter', orgId: 'ORG-003', orgName: 'AgriTransit Logistics', status: 'ACTIVE', lastLogin: '16 Aug 2026 06:30' },
  { id: 'USR-005', username: 'harvest@himalayan', role: 'supplier', orgId: 'ORG-005', orgName: 'Himalayan Apiaries', status: 'INACTIVE', lastLogin: '10 Aug 2026 12:00' },
];

const SYSTEM_HEALTH = [
  { service: 'PostgreSQL (Data Service)', endpoint: 'localhost:8001', status: 'HEALTHY', latency: '2ms' },
  { service: 'Redis Cache', endpoint: 'localhost:6379', status: 'HEALTHY', latency: '1ms' },
  { service: 'IPFS Gateway (Kubo)', endpoint: 'localhost:5001', status: 'HEALTHY', latency: '14ms' },
  { service: 'Fabric Peer (Org1)', endpoint: 'localhost:7051', status: 'HEALTHY', latency: '8ms' },
  { service: 'Fabric Peer (Org2)', endpoint: 'localhost:9051', status: 'HEALTHY', latency: '9ms' },
  { service: 'Fabric Orderer', endpoint: 'localhost:7050', status: 'HEALTHY', latency: '5ms' },
  { service: 'Blockchain Gateway', endpoint: 'localhost:3005', status: 'HEALTHY', latency: '12ms' },
  { service: 'Application Service', endpoint: 'localhost:8000', status: 'HEALTHY', latency: '3ms' },
];

const ROLE_OPTIONS = ['producer', 'retailer', 'transporter', 'regulator', 'supplier', 'consumer', 'admin'];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'orgs' | 'users' | 'health'>('orgs');
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [showAssignRole, setShowAssignRole] = useState(false);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.headerTop}>
          <div>
            <div className={styles.eyebrow}>⚙️ PLATFORM ADMINISTRATION</div>
            <div className={styles.title}>Admin Control Panel</div>
            <div className={styles.subtitle}>
              Manage organizations, user roles, system health monitoring, and platform configuration.
            </div>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.btnPrimary} onClick={() => setShowCreateOrg(!showCreateOrg)}>
              + Register Organization
            </button>
            <button className={styles.btnSecondary} onClick={() => setShowAssignRole(!showAssignRole)}>
              🔑 Assign Role
            </button>
          </div>
        </div>
      </div>

      {/* Inline Create Org Form */}
      {showCreateOrg && (
        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>Register New Organization</h3>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Organization Name</label>
              <input type="text" className={styles.formInput} placeholder="e.g. Nashik Organic Co-Op" />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Type</label>
              <select className={styles.formInput}>
                <option value="">Select type...</option>
                <option>Producer</option>
                <option>Retailer</option>
                <option>Transporter</option>
                <option>Supplier</option>
                <option>Regulator</option>
              </select>
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Fabric MSP ID</label>
              <select className={styles.formInput}>
                <option value="Org1MSP">Org1MSP (Producer Network)</option>
                <option value="Org2MSP">Org2MSP (Retailer Network)</option>
                <option value="RegulatorOrg">RegulatorOrg</option>
              </select>
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Admin Email</label>
              <input type="email" className={styles.formInput} placeholder="admin@org.com" />
            </div>
          </div>
          <div className={styles.formActions}>
            <button className={styles.btnPrimary}>Create Organization</button>
            <button className={styles.btnGhost} onClick={() => setShowCreateOrg(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Inline Assign Role Form */}
      {showAssignRole && (
        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>Assign User Role</h3>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Username</label>
              <input type="text" className={styles.formInput} placeholder="e.g. ops@greenbasket" />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Organization</label>
              <select className={styles.formInput}>
                {MOCK_ORGS.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Role</label>
              <select className={styles.formInput}>
                {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className={styles.formActions}>
            <button className={styles.btnPrimary}>Assign Role</button>
            <button className={styles.btnGhost} onClick={() => setShowAssignRole(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabBar}>
        {(['orgs', 'users', 'health'] as const).map((tab) => (
          <button
            key={tab}
            className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'orgs' ? '🏢 Organizations' : tab === 'users' ? '👤 Users & Roles' : '💚 System Health'}
          </button>
        ))}
      </div>

      {/* ── Organizations Table ───────────────────────────────── */}
      {activeTab === 'orgs' && (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Organization</th>
                <th>Type</th>
                <th>MSP ID</th>
                <th>Users</th>
                <th>Status</th>
                <th>Registered</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ORGS.map((org) => (
                <tr key={org.id}>
                  <td><code className={styles.monoCell}>{org.id}</code></td>
                  <td style={{ fontWeight: 600 }}>{org.name}</td>
                  <td>{org.type}</td>
                  <td><code className={styles.monoCell}>{org.mspId}</code></td>
                  <td>{org.users}</td>
                  <td>
                    <span className={`${styles.badge} ${org.status === 'ACTIVE' ? styles.badgeGreen : styles.badgeRed}`}>
                      {org.status}
                    </span>
                  </td>
                  <td>{org.createdAt}</td>
                  <td>
                    <button className={styles.rowAction}>⋮</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Users & Roles Table ───────────────────────────────── */}
      {activeTab === 'users' && (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>Organization</th>
                <th>Status</th>
                <th>Last Login</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {MOCK_USERS.map((user) => (
                <tr key={user.id}>
                  <td><code className={styles.monoCell}>{user.id}</code></td>
                  <td style={{ fontWeight: 600 }}>{user.username}</td>
                  <td>
                    <span className={styles.roleBadge}>{user.role}</span>
                  </td>
                  <td>{user.orgName}</td>
                  <td>
                    <span className={`${styles.badge} ${user.status === 'ACTIVE' ? styles.badgeGreen : styles.badgeMuted}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.lastLogin}</td>
                  <td>
                    <button className={styles.rowAction}>⋮</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── System Health ─────────────────────────────────────── */}
      {activeTab === 'health' && (
        <div className={styles.healthGrid}>
          {SYSTEM_HEALTH.map((s) => (
            <div key={s.service} className={styles.healthCard}>
              <div className={styles.healthCardTop}>
                <span className={`${styles.healthDot} ${s.status === 'HEALTHY' ? styles.healthDotGreen : styles.healthDotRed}`}></span>
                <span className={styles.healthStatus}>{s.status}</span>
              </div>
              <h4 className={styles.healthService}>{s.service}</h4>
              <div className={styles.healthMeta}>
                <span className={styles.healthEndpoint}>{s.endpoint}</span>
                <span className={styles.healthLatency}>{s.latency}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
