'use client';
import styles from './StakeholderMatrix.module.css';

interface Actor {
  id: string;
  name: string;
  badge: string;
  contract: string;
  desc: string;
  permissions: string[];
  icon: React.ReactNode;
}

const ACTORS: Actor[] = [
  {
    id: 'farmer',
    name: 'Farmers & Growers',
    badge: 'ORIGIN LAYER',
    contract: 'TraceabilityContract.createBatch()',
    desc: 'Register raw harvest lots with GPS tags, pin organic soil test certificates to IPFS, and mint initial digital twins.',
    permissions: ['Mint Raw Produce Batch', 'Pin Soil Certs to IPFS', 'Sign Origin Transfer'],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M12 22v-9" />
        <path d="M9 15c0-3 3-5 3-8 0 3 3 5 3 8" />
        <path d="M6 18c0-3 6-5 6-11 0 6 6 8 6 11" />
      </svg>
    ),
  },
  {
    id: 'processor',
    name: 'Processors & Millers',
    badge: 'TRANSFORMATION',
    contract: 'TraceabilityContract.transformBatch()',
    desc: 'Record sortex cleaning, grain blending, and milling operations as immutable parent-child edges in the lineage graph.',
    permissions: ['Consume Parent Batches', 'Mint Child Batch Asset', 'Log Moisture / Quality Assay'],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M3 21h18" />
        <path d="M6 18V9l6-6 6 6v9" />
        <path d="M10 14h4" />
      </svg>
    ),
  },
  {
    id: 'manufacturer',
    name: 'Packaging Plants',
    badge: 'DUAL-QR MINTING',
    contract: 'TraceabilityContract.mintUnits()',
    desc: 'Bind public GS1 Digital Link outer QR codes with concealed tamper-evident ECDSA cryptographic inner credentials.',
    permissions: ['Unit Identity Minting', 'Cryptographic Seal Issuance', 'Dispatch Handoff Sign'],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
        <path d="M9 21V9" />
      </svg>
    ),
  },
  {
    id: 'logistics',
    name: 'Logistics Carriers',
    badge: 'CHAIN OF CUSTODY',
    contract: 'TraceabilityContract.transferCustody()',
    desc: 'Stream continuous IoT cold-chain temperature telemetry and sign cryptographic dual-custody handover events.',
    permissions: ['Sign Custody Transfer', 'Stream Cold-Chain Telemetry', 'Record Seal Verification'],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    id: 'retailer',
    name: 'Retailers & Outlets',
    badge: 'POINT OF SALE',
    contract: 'TraceabilityContract.receiveInventory()',
    desc: 'Verify pallet authenticity at warehouse intake and enforce automated real-time recall blocks directly on POS registers.',
    permissions: ['Dock Intake Verify', 'Store Inventory Intake', 'POS Autonomous Block'],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    id: 'consumer',
    name: 'Consumers & Regulators',
    badge: 'VERIFICATION & AUDIT',
    contract: 'IncidentContract.quarantineScope()',
    desc: 'Scan packaging for complete provenance, test concealed authenticity seals, and audit full regulatory evidence dossiers.',
    permissions: ['Public Provenance Lookup', 'Anti-Clone Verification', 'Submit Anomaly Feedback'],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </svg>
    ),
  },
];

export default function StakeholderMatrix() {
  return (
    <section className={styles.blockStakeholders} id="stakeholders">
      <div className="container">
        <header className="section-intro">
          <span className="eyebrow">PERMISSIONED ECOSYSTEM MATRIX</span>
          <h2 className="heading-2">
            Built for everyone in the chain. <strong>Permissioned access, cryptographic truth.</strong>
          </h2>
          <p className="lead">
            Every participant interacts through fine-grained role-based access control (RBAC), preserving commercial
            confidentiality while providing unbreakable end-to-end auditability.
          </p>
        </header>

        <div className={styles.matrixGrid} role="list">
          {ACTORS.map((actor) => (
            <div key={actor.id} className={styles.actorCard}>
              <div className={styles.actorCardHeader}>
                <div className={styles.iconCircle}>{actor.icon}</div>
                <span className="chip chip--green">{actor.badge}</span>
              </div>

              <h3 className={styles.actorName}>{actor.name}</h3>
              <div className={styles.contractScope}>{actor.contract}</div>
              <p className={styles.actorDesc}>{actor.desc}</p>

              <div className={styles.permWrap}>
                <span className={styles.permTitle}>Authorized Ledger Actions</span>
                <ul className={styles.permList}>
                  {actor.permissions.map((p) => (
                    <li key={p} className={styles.permItem}>
                      <span className={styles.permDot} />
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
