'use client';
import { useEffect, useRef, useState } from 'react';
import styles from './Hero.module.css';

interface Stat {
  target: number;
  suffix: string;
  prefix?: string;
  label: string;
  sub: string;
  isDec?: boolean;
}

const STATS: Stat[] = [
  { target: 100, suffix: '%', label: 'LINEAGE INTEGRITY', sub: 'W3C Verifiable Credentials' },
  { target: 48291, suffix: '+', label: 'COMMITTED BATCHES', sub: 'Hyperledger Fabric Ledger' },
  { target: 200, prefix: '< ', suffix: 'ms', label: 'RECALL TRAVERSAL', sub: 'Sub-second blast isolation' },
  { target: 99.8, suffix: '%', label: 'COLD-CHAIN COMPLIANCE', sub: 'Continuous IoT Telemetry', isDec: true },
];

function StatCounter({ stat }: { stat: Stat }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired.current) {
          fired.current = true;
          const duration = 1400;
          const start = performance.now();

          const step = (time: number) => {
            const progress = Math.min((time - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = stat.isDec
              ? parseFloat((eased * stat.target).toFixed(1))
              : Math.floor(eased * stat.target);
            setVal(current);
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [stat]);

  return (
    <div ref={ref} className={styles.statItem}>
      <span className={styles.statValue}>
        {stat.prefix}
        <span className={styles.statValueHighlight}>{val.toLocaleString()}</span>
        {stat.suffix}
      </span>
      <span className={styles.statLabel}>{stat.label}</span>
      <span className={styles.statSub}>{stat.sub}</span>
    </div>
  );
}

export default function Hero() {
  return (
    <section className={styles.hpHero}>
      <div className="container">
        <div
          className={styles.heroInner}
          style={{
            backgroundImage: "url('/images/logineko/hero-custom.jpg')",
          }}
        >
          <div className={styles.heroOverlay} />

          {/* Hero Main Copy */}
          <div className={styles.heroContent}>
            <div className={styles.heroEyebrow}>
              <span className={styles.pulseDot} />
              <span>National Food Traceability & Safety Platform</span>
            </div>

            <h1 className={styles.heroTitle}>
              From source &amp; harvest to shelf. <strong>Every single step verifiable.</strong>
            </h1>

            <p className={styles.heroLead}>
              FoodTrace binds agricultural origin, multi-parent milling transformations, cold-chain transport,
              and tamper-evident physical QR verification into one immutable digital twin.
            </p>

            <div className={styles.heroCtaGroup}>
              <a href="#solutions" className="btn btn--grass">
                Explore The Ecosystem →
              </a>
              <a href="#crops" className="btn btn--white-outline">
                View Tracked Crops &amp; Batches
              </a>
            </div>
          </div>

          {/* Bottom Floating Stats Strip */}
          <div className={styles.heroStats} role="list">
            {STATS.map((stat) => (
              <StatCounter key={stat.label} stat={stat} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
