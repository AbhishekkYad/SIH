"use client";
import { useState } from "react";
import styles from "./Hero.module.css";

interface InsightCard {
  id: string;
  badge: string;
  title: string;
  desc: string;
  metric: string;
  metricLabel: string;
  icon: string;
}

const INSIGHTS: InsightCard[] = [
  {
    id: "traceable",
    badge: "CRYPTOGRAPHIC AUDIT",
    title: "100% Traceable Batches",
    desc: "Every agricultural lot is immutably anchored to parent-child transformation records on-chain.",
    metric: "100%",
    metricLabel: "Tamper-Evident Lineage",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    id: "visibility",
    badge: "MULTI-TIER VISIBILITY",
    title: "End-to-End Supply Visibility",
    desc: "Continuous tracking across GPS farm geofences, milling silos, cold freight, and retail shelves.",
    metric: "8 Stages",
    metricLabel: "Unified Custody Trail",
    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  },
  {
    id: "verified",
    badge: "DECENTRALIZED IDENTITY",
    title: "Verified Stakeholder Actions",
    desc: "Each handover, quality test, and dispatch is signed with role-based W3C verifiable credentials.",
    metric: "W3C DID",
    metricLabel: "Authenticated Signatures",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
  {
    id: "monitoring",
    badge: "IOT SENSORY TELEMETRY",
    title: "Real-Time Batch Monitoring",
    desc: "Live telemetry logs temperature, humidity excursions, and dispatch transit timelines continuously.",
    metric: "Real-Time",
    metricLabel: "Active Condition Feeds",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    id: "feedback",
    badge: "DIRECT ACCOUNTABILITY",
    title: "Consumer Feedback Connected",
    desc: "Point-of-consumption QR scans feed verified sensory and defect reports directly to origin mills.",
    metric: "Direct Loop",
    metricLabel: "POS-to-Farm Accountability",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  },
  {
    id: "recall",
    badge: "RECURSIVE LINEAGE DAG",
    title: "Faster Issue Identification",
    desc: "Instant blast-radius traversal isolates contaminated packaging units in minutes instead of weeks.",
    metric: "Sub-Minute",
    metricLabel: "Precision Quarantine",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
];

export default function Hero() {
  const [activeTab, setActiveTab] = useState<string>("traceable");
  const activeInsight = INSIGHTS.find((i) => i.id === activeTab) || INSIGHTS[0];

  return (
    <section className={styles.hpHero}>
      <div className="container">
        {/* Top Hero Banner with New Traceability Visual */}
        <div
          className={styles.heroInner}
          style={{
            backgroundImage:
              "url('/images/logineko/supply_chain_traceability_hero.jpg')",
          }}
        >
          <div className={styles.heroOverlay} />

          {/* Hero Main Copy */}
          <div className={styles.heroContent}>
            <div className={styles.heroEyebrow}>
              <span className={styles.pulseDot} />
              <span>
                National Food Traceability &amp; Safety Infrastructure
              </span>
            </div>

            <h1 className={styles.heroTitle}>
              From farm &amp; harvest to retail.{" "}
              <strong>Every single step verifiable.</strong>
            </h1>

            <p className={styles.heroLead}>
              A unified digital infrastructure connecting farmers, processors,
              logistics, retailers, and consumers. Replace fragmented paper
              trails with an immutable, cryptographically verifiable food
              journey.
            </p>

            <div className={styles.heroCtaGroup}>
              <a href="#workflow" className="btn btn--grass">
                View Live Product Workflow →
              </a>
              <a href="/one-food" className="btn btn--white-outline">
                Explore Batch Explorer (Demo)
              </a>
            </div>

            {/* Quick Flow Badge Strip */}
            <div className={styles.flowStrip}>
              <span className={styles.flowItem}>🌾 Farm Origin</span>
              <span className={styles.flowArrow}>→</span>
              <span className={styles.flowItem}>⚙️ Processing</span>
              <span className={styles.flowArrow}>→</span>
              <span className={styles.flowItem}>🚚 Distribution</span>
              <span className={styles.flowArrow}>→</span>
              <span className={styles.flowItem}>🏬 Retail POS</span>
              <span className={styles.flowArrow}>→</span>
              <span className={styles.flowItem}>📱 QR Consumer</span>
            </div>
          </div>
        </div>

        {/* Platform Insights Box (Requirement 2) */}
        <div className={styles.insightsSection}>
          <div className={styles.insightsHeader}>
            <div className={styles.insightsTitleWrap}>
              <span className="eyebrow">PLATFORM-VERIFIED CAPABILITIES</span>
              <h2 className={styles.insightsHeading}>
                Designed for <strong>uncompromising integrity</strong> at every
                tier.
              </h2>
            </div>
            <p className={styles.insightsSubtext}>
              Built on open standards (GS1 Digital Link, W3C DID, Hyperledger
              Fabric). Meaningful data trails without vanity metrics.
            </p>
          </div>

          <div className={styles.insightsGrid}>
            {INSIGHTS.map((item) => (
              <div
                key={item.id}
                className={`${styles.insightCard} ${activeTab === item.id ? styles.insightCardActive : ""}`}
                onClick={() => setActiveTab(item.id)}
                role="button"
                tabIndex={0}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.iconCircle}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={item.icon} />
                    </svg>
                  </div>
                  <span className={styles.badge}>{item.badge}</span>
                </div>

                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDesc}>{item.desc}</p>

                <div className={styles.cardFooter}>
                  <span className={styles.metricVal}>{item.metric}</span>
                  <span className={styles.metricLabel}>{item.metricLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
