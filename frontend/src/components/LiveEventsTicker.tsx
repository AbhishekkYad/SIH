"use client";
import { useState } from "react";
import styles from "./LiveEventsTicker.module.css";

interface SupplyChainEvent {
  id: string;
  img: string;
  tag1: string;
  tag2: string;
  title: string;
  date: string;
  type: string;
  hash: string;
}

const EVENTS: SupplyChainEvent[] = [
  {
    id: "1",
    img: "/images/logineko/field-operations-at-logineko-768x432.jpg",
    tag1: "#FarmOrigin",
    tag2: "#NashikOrganic",
    title:
      "12,000 KG Sharbati Wheat Harvest Minted with Organic Soil Lab Assay CID",
    date: "Aug 15, 2026",
    type: "FABRIC_TX_0x7c91",
    hash: "CID: bafybeic...7k4m",
  },
  {
    id: "2",
    img: "/images/logineko/farming-software-maps-solution-768x513.jpg",
    tag1: "#SortexMilling",
    tag2: "#LineageDAG",
    title:
      "Pune Milling Unit #04 Multi-Parent Grain Blending Committed to Lineage Graph",
    date: "Aug 14, 2026",
    type: "EDGE_8941_PUNE",
    hash: "DAG Parent-Child Link",
  },
  {
    id: "3",
    img: "/images/logineko/users-and-equipment-on-fields-768x408.jpg",
    tag1: "#ColdChainIoT",
    tag2: "#WesternCorridor",
    title:
      "Interstate Freight Checkpoint: Continuous +4.1°C Compliant Telemetry Streamed",
    date: "Aug 14, 2026",
    type: "IOT_SENSOR_PASS",
    hash: "Ed25519 Signed Handoff",
  },
  {
    id: "4",
    img: "/images/logineko/origin-solutions-for-transaprency-768x513.jpg",
    tag1: "#DualQR",
    tag2: "#AntiCloning",
    title:
      "Mumbai Packaging Facility Minted 5,000 Retail Units with Concealed ECDSA Seals",
    date: "Aug 13, 2026",
    type: "GS1_DIGITAL_LINK",
    hash: "Batch WF-2026-0815",
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

  // Circular reordering for simple slide effect
  const visibleEvents = [
    ...EVENTS.slice(startIndex),
    ...EVENTS.slice(0, startIndex),
  ];

  return (
    <section className={styles.blockNews}>
      <div className="container">
        <header className={styles.newsHeader}>
          <div>
            <span className="eyebrow">LIVE BLOCKCHAIN TELEMETRY</span>
            <h2 className={styles.newsTitle}>
              Real-time events from <strong>across the chain</strong>
            </h2>
          </div>

          <div className={styles.controls}>
            <button
              className={styles.arrowBtn}
              type="button"
              onClick={handlePrev}
              aria-label="Previous events"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              className={styles.arrowBtn}
              type="button"
              onClick={handleNext}
              aria-label="Next events"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </button>
          </div>
        </header>

        <div className={styles.sliderTrack}>
          {visibleEvents.map((evt) => (
            <article key={evt.id} className={styles.eventCard}>
              <div className={styles.cardMedia}>
                <img src={evt.img} alt={evt.title} loading="lazy" />
              </div>
              <div className={styles.cardBody}>
                <div className={styles.tagsRow}>
                  <span className={styles.tagChip}>{evt.tag1}</span>
                  <span className={styles.tagChipSub}>{evt.tag2}</span>
                </div>
                <h3 className={styles.cardHeading}>{evt.title}</h3>
                <div className={styles.cardMeta}>
                  <time>{evt.date}</time>
                  <span className={styles.metaType}>{evt.type}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
