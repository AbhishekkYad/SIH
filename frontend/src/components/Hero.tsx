'use client';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hpHero}>
      <div className="container">
        {/* Main Hero Visual Card */}
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
              <a href="#solutions" className={styles.btnPrimary}>
                <span>Explore The Ecosystem</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
              <a href="#crops" className={styles.btnSecondary}>
                View Tracked Crops &amp; Batches
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
