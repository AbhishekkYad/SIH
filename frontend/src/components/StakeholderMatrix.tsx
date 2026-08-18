'use client';
import styles from './StakeholderMatrix.module.css';

interface Stakeholder {
  id: string;
  stepTag: string;
  headline: string;
  benefit: string;
  img: string;
}

const STAKEHOLDERS: Stakeholder[] = [
  {
    id: 'farmer',
    stepTag: '01 — FARMER',
    headline: 'Start with a trusted origin.',
    benefit: 'Register raw materials, attach supporting evidence and create a verifiable starting point for every food journey.',
    img: '/images/stakeholders/stakeholder-farmer.jpg',
  },
  {
    id: 'processor',
    stepTag: '02 — PRODUCER / PROCESSOR',
    headline: 'Transform without losing lineage.',
    benefit: 'Validate incoming materials, record processing events and connect every transformed batch to its source.',
    img: '/images/stakeholders/stakeholder-processor.jpg',
  },
  {
    id: 'manufacturer',
    stepTag: '03 — MANUFACTURER',
    headline: 'Know every batch you create.',
    benefit: 'Create traceable batches and units, monitor product status and act quickly when a safety issue emerges.',
    img: '/images/stakeholders/stakeholder-manufacturer.png',
  },
  {
    id: 'logistics',
    stepTag: '04 — TRANSPORTER / LOGISTICS',
    headline: 'Keep the chain moving & visible.',
    benefit: 'Record verified transfers and maintain a clear chain of custody as products move between supply-chain stages.',
    img: '/images/stakeholders/stakeholder-logistics.png',
  },
  {
    id: 'retailer',
    stepTag: '05 — RETAILER',
    headline: 'Turn the final handoff into trust.',
    benefit: 'Receive traceable inventory, connect products with consumer interactions and respond to complaints within context.',
    img: '/images/stakeholders/stakeholder-retailer.png',
  },
  {
    id: 'consumer',
    stepTag: '06 — CONSUMER',
    headline: "Know what you're buying.",
    benefit: "Scan the product, view its permitted journey, verify traceability and report concerns when something isn't right.",
    img: '/images/stakeholders/stakeholder-consumer.png',
  },
];

export default function StakeholderMatrix() {
  return (
    <section className={styles.blockStakeholders} id="stakeholders">
      <div className="container">
        <header className={styles.sectionHeader}>
          <span className="eyebrow">WHO WE EMPOWER</span>
          <h2 className={styles.sectionTitle}>
            One connected platform. Six stakeholders. <strong>One trusted food journey.</strong>
          </h2>
          <p className={styles.sectionLead}>
            FoodTrace gives every participant visibility, accountability and the right tools to manage food from source to consumer — without breaking the chain of trust.
          </p>
        </header>

        <div className={styles.matrixGrid} role="list">
          {STAKEHOLDERS.map((s) => (
            <article key={s.id} className={styles.actorCard}>
              <div className={styles.circleWrap}>
                <img src={s.img} alt={s.headline} loading="lazy" className={styles.circleImg} />
              </div>

              <div className={styles.cardHeader}>
                <span className={styles.stepTag}>{s.stepTag}</span>
                <h3 className={styles.headline}>{s.headline}</h3>
              </div>

              <p className={styles.benefit}>{s.benefit}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
