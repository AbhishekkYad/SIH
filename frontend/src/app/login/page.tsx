'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

export type UserRole = 'producer' | 'logistics' | 'retailer' | 'qa' | 'regulator' | 'admin';

interface RolePreset {
  id: UserRole;
  name: string;
  org: string;
  email: string;
  scope: string;
  defaultRoute: string;
}

const ROLE_PRESETS: RolePreset[] = [
  {
    id: 'producer',
    name: 'Producer / Plant',
    org: 'Sahyadri Agro Processing',
    email: 'producer@sahyadri.com',
    scope: 'Batch Genesis, SKUs, Dual-QR Serialization, Lab Assays',
    defaultRoute: '/dashboard/batches',
  },
  {
    id: 'qa',
    name: 'QA & Safety',
    org: 'National Quality Labs',
    email: 'qa@foodtrace.com',
    scope: 'Contamination Inquests, Blast Radius Recall, Lab Assays',
    defaultRoute: '/dashboard/incidents',
  },
  {
    id: 'retailer',
    name: 'Retailer & POS',
    org: 'GreenBasket Retail',
    email: 'retail@greenbasket.com',
    scope: 'Shelf POS Reception, Lot Quarantine, Customer Inquests',
    defaultRoute: '/dashboard',
  },
  {
    id: 'logistics',
    name: 'Logistics / Cold Chain',
    org: 'AgriTransit Logistics',
    email: 'logistics@agritransit.com',
    scope: 'GPS Tracking, Cold-Chain Telemetry, Handover Signatures',
    defaultRoute: '/dashboard/batches',
  },
  {
    id: 'regulator',
    name: 'FSSAI Regulator',
    org: 'FSSAI Regional MH',
    email: 'auditor@fssai.gov.in',
    scope: 'Section 16 Compliance, Audit Dossiers, Recall Logs',
    defaultRoute: '/dashboard/regulator',
  },
  {
    id: 'admin',
    name: 'Platform Admin',
    org: 'FoodTrace Network',
    email: 'admin@foodtrace.com',
    scope: 'Governance, MSP Identities, Peer Node Cluster',
    defaultRoute: '/dashboard/admin',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('producer');
  const activePreset = ROLE_PRESETS.find((r) => r.id === selectedRole) || ROLE_PRESETS[0];

  const [email, setEmail] = useState(activePreset.email);
  const [password, setPassword] = useState('••••••••••••');

  const handleRoleChange = (roleId: UserRole) => {
    setSelectedRole(roleId);
    const preset = ROLE_PRESETS.find((r) => r.id === roleId);
    if (preset) {
      setEmail(preset.email);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('foodtrace_active_role', selectedRole);
      localStorage.setItem('foodtrace_user_email', email);
      localStorage.setItem('foodtrace_user_org', activePreset.org);
    }
    router.push('/dashboard');
  };

  return (
    <div className={styles.pageWrap}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.loginCard}>
          <div className={styles.headerBlock}>
            <div className={styles.badgeRow}>
              <span className="badge badge--info">Hyperledger Fabric IAM</span>
              <span className="badge badge--neutral mono-num">MSP Org1/Org2</span>
            </div>
            <h1 className={styles.title}>Stakeholder Identity Portal</h1>
            <p className={styles.subtitle}>
              Authenticate with your cryptographic supply chain role to access dedicated operational views.
            </p>
          </div>

          {/* Role Preset Selector */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              SELECT OPERATIONAL PERSONA
            </div>
            <div className={styles.roleGrid}>
              {ROLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`${styles.roleOption} ${selectedRole === preset.id ? styles.roleOptionActive : ''}`}
                  onClick={() => handleRoleChange(preset.id)}
                >
                  <span className={styles.roleName}>{preset.name}</span>
                  <span className={styles.roleOrg}>{preset.org.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Scope Summary */}
          <div className={styles.presetBanner}>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              Organization: <strong>{activePreset.org}</strong>
            </div>
            <div style={{ color: 'var(--text-muted)' }}>
              Permissions: {activePreset.scope}
            </div>
          </div>

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <div className={styles.labelRow}>
                <label>MSP Operator Email</label>
                <span className="mono-num" style={{ fontSize: '10px' }}>ECDSA P-256</span>
              </div>
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.labelRow}>
                <label>Cryptographic Private Key / Password</label>
                <span style={{ fontSize: '10px', color: 'var(--color-info)', cursor: 'pointer' }}>
                  Hardware HSM
                </span>
              </div>
              <input
                type="password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.submitBtn}>
              Sign In to {activePreset.name} Console →
            </button>
          </form>

          <div className={styles.footerNote}>
            Protected by Hyperledger Fabric MSP & FSSAI Digital Signatures
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
