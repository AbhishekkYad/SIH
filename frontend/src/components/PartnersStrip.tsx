'use client';
import styles from './PartnersStrip.module.css';

const PARTNERS = [
  { name: 'GS1 Digital Link URI Standard', short: 'GS1 GLOBAL' },
  { name: 'FSSAI Traceability Guidelines', short: 'FSSAI INDIA' },
  { name: 'Hyperledger Fabric v2.5', short: 'LINUX FOUNDATION' },
  { name: 'W3C Verifiable Credentials', short: 'W3C COMPLIANT' },
  { name: 'IPFS Content-Addressing Vault', short: 'IPFS NETWORK' },
];

export default function PartnersStrip() {
  return (
    <section className={styles.blockPartners}>
      <div className="container">
        <div className={styles.partnersHeader}>
          <span className="eyebrow">OPEN ARCHITECTURAL &amp; REGULATORY STANDARDS</span>
        </div>

        <ul className={styles.logosList} role="list">
          {PARTNERS.map((p) => (
            <li key={p.name} className={styles.partnerBadge}>
              <div className={styles.badgeIcon}>✓</div>
              <span className={styles.badgeText}>{p.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
