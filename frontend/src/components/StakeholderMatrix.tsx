'use client';
import styles from './StakeholderMatrix.module.css';

interface RoleCard {
  role: string;
  badge: string;
  desc: string;
  icon: string;
  permissions: string[];
}

const ROLES: RoleCard[] = [
  {
    role: 'Farmer / Producer',
    badge: 'ORIGIN TIER',
    desc: 'Where the food begins. Production details, geofence harvesting and genesis registration.',
    icon: '🌾',
    permissions: [
      'Create genesis crop production records',
      'View & audit own harvest batches',
      'Update soil health & pesticide records',
      'Sign initial custody handover DID',
    ],
  },
  {
    role: 'Processor / Miller',
    badge: 'TRANSFORMATION TIER',
    desc: 'Milling, optical sortex grading, batch transformation and lab food safety compliance.',
    icon: '⚙️',
    permissions: [
      'Receive raw aggregation shipments',
      'Add processing & moisture parameters',
      'Link input crops to output packaged lots',
      'Attach accredited NABL lab certificates',
    ],
  },
  {
    role: 'Distributor / Logistics',
    badge: 'TRANSIT TIER',
    desc: 'Cold-chain telemetry, reefer temperature monitoring and inter-facility transit handovers.',
    icon: '🚚',
    permissions: [
      'View cryptographically assigned shipments',
      'Stream real-time IoT temperature & GPS',
      'Log transit delay or seal status events',
      'Confirm custody delivery to warehouse / POS',
    ],
  },
  {
    role: 'Retailer / Supermarket',
    badge: 'COMMERCE TIER',
    desc: 'Inbound dock verification, POS inventory sync, shelf tracking and immediate quarantine receipt.',
    icon: '🏬',
    permissions: [
      'Verify incoming pallet cryptographic seals',
      'Manage inventory & shelf life limits',
      'Execute sub-second POS barcode lock',
      'Review and respond to consumer issues',
    ],
  },
  {
    role: 'Consumer / Citizen',
    badge: 'VERIFICATION TIER',
    desc: 'GS1 Digital Link smartphone scan, farm-to-fork journey verification and quality feedback loop.',
    icon: '📱',
    permissions: [
      'Verify authentic farm origin & harvest date',
      'View complete 8-stage custody history',
      'Inspect pesticide & nutritional lab reports',
      'Submit direct quality feedback or defect alert',
    ],
  },
];

export default function StakeholderMatrix() {
  return (
    <section className={styles.section} id="stakeholders">
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <span className="eyebrow">ROLE-BASED ECOSYSTEM ACCESS</span>
          <h2 className={styles.title}>
            Permissioned Ecosystem: <strong>Tailored for every stakeholder.</strong>
          </h2>
          <p className={styles.lead}>
            FoodTrace operates on a clean, role-based access model. Every participant accesses precisely the data and actions relevant to their operational responsibility.
          </p>
        </div>

        {/* Card-Based Grid */}
        <div className={styles.grid}>
          {ROLES.map((item) => (
            <div key={item.role} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.roleIcon}>{item.icon}</span>
                <span className={styles.roleBadge}>{item.badge}</span>
              </div>

              <h3 className={styles.roleTitle}>{item.role}</h3>
              <p className={styles.roleDesc}>{item.desc}</p>

              <div className={styles.permsWrap}>
                <span className={styles.permsHead}>PERMITTED ACTIONS</span>
                <ul className={styles.permsList}>
                  {item.permissions.map((p, idx) => (
                    <li key={idx} className={styles.permItem}>
                      <span className={styles.permCheck}>✓</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
