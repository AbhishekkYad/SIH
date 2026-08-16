'use client';
import { useState } from 'react';
import styles from './LiveEventsTicker.module.css';

interface SupplyChainEvent {
  id: string;
  stepNum: string;
  tag: string;
  title: string;
  description: string;
  meta: string;
  img?: string;
}

const EVENTS: SupplyChainEvent[] = [
  {
    id: '1',
    stepNum: '01',
    tag: 'SOURCE ORIGIN',
    title: 'Raw material registered at source',
    description: 'Wheat batch W001 registered with its origin, evidence and source details.',
    meta: 'SOURCE EVENT · BATCH_W001',
    img: '/images/logineko/card-source-origin.jpg',
  },
  {
    id: '2',
    stepNum: '02',
    tag: 'PROCESSING · LINEAGE',
    title: 'One batch becomes the next',
    description: 'Raw material is transformed into a new batch while its parent-child lineage stays connected.',
    meta: 'TRANSFORMATION · W001 → F001',
  },
  {
    id: '3',
    stepNum: '03',
    tag: 'LOGISTICS · CHAIN OF CUSTODY',
    title: 'Every transfer leaves a trail',
    description: 'Verified movement events connect processors, manufacturers, transporters and retailers.',
    meta: 'TRANSFER VERIFIED · CHAIN_EVENT_00481',
  },
  {
    id: '4',
    stepNum: '04',
    tag: 'CONSUMER · VERIFICATION',
    title: 'The journey reaches your hands',
    description: 'Scan the QR to reveal the product journey and verify its traceability.',
    meta: 'TRACEABILITY VERIFIED · UNIT_B001-U0723',
  },
];

export default function LiveEventsTicker() {
  const [startIndex, setStartIndex] = useState(0);

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % EVENTS.length);
  };

  const handlePrev = () => {
    setStartIndex((prev) => (prev - 1 + EVENTS.length) % EVENTS.length);
  };

  // Circular reordering for slide interaction
  const visibleEvents = [
    ...EVENTS.slice(startIndex),
    ...EVENTS.slice(0, startIndex),
  ];

  return (
    <section className={styles.blockNews}>
      <div className="container">
        <header className={styles.newsHeader}>
          <div className={styles.headerLeft}>
            <span className="eyebrow">LIVE SUPPLY CHAIN</span>
            <h2 className={styles.newsTitle}>
              See every movement. <strong>Trace every decision.</strong>
            </h2>
            <p className={styles.newsLead}>
              From source to shelf, FoodTrace connects every critical event into one trusted journey — so you can see what happened, where it happened, and what it means.
            </p>
          </div>

          <div className={styles.controls}>
            <button
              className={styles.arrowBtn}
              type="button"
              onClick={handlePrev}
              aria-label="Previous events"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              className={styles.arrowBtn}
              type="button"
              onClick={handleNext}
              aria-label="Next events"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </button>
          </div>
        </header>

        <div className={styles.sliderTrack}>
          {visibleEvents.map((evt) => (
            <article key={evt.id} className={styles.eventCard}>
              {evt.img && (
                <div className={styles.cardMedia}>
                  <img src={evt.img} alt={evt.title} loading="lazy" />
                  <span className={styles.mediaTag}>{evt.stepNum}</span>
                </div>
              )}

              <div className={styles.cardInner}>
                <div className={styles.cardHeader}>
                  <span className={styles.tagChip}>{evt.tag}</span>
                  {!evt.img && <span className={styles.stepNum}>{evt.stepNum}</span>}
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.cardHeading}>{evt.title}</h3>
                  <p className={styles.cardDesc}>{evt.description}</p>
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.metaIndicator} />
                  <span className={styles.metaText}>{evt.meta}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
