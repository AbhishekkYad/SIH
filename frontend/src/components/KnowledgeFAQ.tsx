'use client';
import styles from './KnowledgeFAQ.module.css';

interface Article {
  id: string;
  img: string;
  tag: string;
  title: string;
  description: string;
  source: string;
  cta: string;
  link: string;
}

const ARTICLES: Article[] = [
  {
    id: 'fao',
    img: '/images/knowledge/research-fao.jpg',
    tag: '#FOOD_SAFETY · #FAO',
    title: 'Traceability is a food-safety tool.',
    description:
      'Traceability helps follow food through production, processing and distribution — supporting food-safety investigations, recalls, quality assurance and product authenticity.',
    source: 'FAO — Traceability & Recalls',
    cta: 'READ THE RESEARCH',
    link: 'https://www.fao.org/food-safety/food-control-systems/traceability---recalls/en',
  },
  {
    id: 'fda',
    img: '/images/knowledge/research-fda.jpg',
    tag: '#TRACEABILITY · #FDA',
    title: 'Every critical event leaves a record.',
    description:
      'The FDA Food Traceability Rule organizes food tracking around Critical Tracking Events and Key Data Elements across activities such as harvesting, shipping, receiving and transformation.',
    source: 'FDA — Food Traceability Rule',
    cta: 'EXPLORE THE FRAMEWORK',
    link: 'https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-requirements-additional-traceability-records-certain-foods',
  },
  {
    id: 'gs1',
    img: '/images/knowledge/research-gs1.jpg',
    tag: '#SUPPLY_CHAIN · #GS1',
    title: 'Turn supply-chain events into shared visibility.',
    description:
      'GS1 EPCIS provides a common way to share supply-chain event data — capturing what happened, where, when and why across organizations.',
    source: 'GS1 — EPCIS',
    cta: 'EXPLORE THE STANDARD',
    link: 'https://www.gs1.org/standards/epcis',
  },
];

export default function KnowledgeFAQ() {
  return (
    <section className={styles.blockKnowledge} id="knowledge">
      <div className="container">
        <header className="section-intro">
          <span className="eyebrow">KNOWLEDGE BASE &amp; RESEARCH</span>
          <h2 className="heading-2">
            Insights on <strong>food safety, verification, and cryptography.</strong>
          </h2>
          <p className="lead">
            Explore whitepapers, architectural guides, and research on food traceability standards.
          </p>
        </header>

        {/* 3 Research Cards */}
        <div className={styles.knowledgeGrid} role="list">
          {ARTICLES.map((art) => (
            <article key={art.id} className={styles.knowledgeCard}>
              <div className={styles.cardImageWrap}>
                <img src={art.img} alt={art.title} loading="lazy" />
              </div>
              <div className={styles.cardBody}>
                <div className={styles.tagRow}>
                  <span className={styles.researchTag}>{art.tag}</span>
                </div>
                <h3 className={styles.cardTitle}>{art.title}</h3>
                <p className={styles.cardDescription}>{art.description}</p>
                <div className={styles.cardFooter}>
                  <div className={styles.sourceWrap}>
                    <span className={styles.sourceLabel}>Source</span>
                    <span className={styles.sourceName}>{art.source}</span>
                  </div>
                  <a
                    href={art.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.ctaLink}
                    aria-label={`${art.cta} (${art.source})`}
                  >
                    <span>{art.cta}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
