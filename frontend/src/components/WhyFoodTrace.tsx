'use client';
import styles from './WhyFoodTrace.module.css';

export default function WhyFoodTrace() {
  return (
    <section className={styles.blockWhy} id="why">
      <div className="container">
        {/* Part 1: Top Image + Text Split */}
        <div className={styles.featureSplit}>
          <div className={styles.featureContent}>
            <span className="eyebrow">WHY WE BUILT FOODTRACE</span>

            <h2 className={styles.featureTitle}>
              People and public health <strong>depend on verifiable truth.</strong>
            </h2>

            <div className={styles.featureDesc}>
              <p>
                The way food moves across traditional supply chains loses custody, temperature, and origin records at every handoff. Suspected contamination triggers blind, wasteful store-wide product destruction over 7 to 14 days.
              </p>
            </div>

            <div className={styles.featureDesc}>
              <p>
                FoodTrace replaces opaque paper trails with an immutable consensus DAG — proving that safe, transparent, and instantly verifiable food supply is possible at national scale.
              </p>
            </div>

            <div>
              <a href="#risk-engine" className="btn btn--grass">
                Inspect Risk Traversal Engine →
              </a>
            </div>
          </div>

          <div className="media-frame" style={{ aspectRatio: '4/3' }}>
            <img
              src="/images/logineko/team-at-logineko-farm.jpg"
              alt="Food traceability and supply chain operations team"
              loading="lazy"
            />
          </div>
        </div>

        <hr className={styles.divider} />

        {/* Part 2: 3-Card Grid */}
        <h3 className={styles.cardsHeading}>
          Verifiable food for <strong>everyone means</strong>
        </h3>

        <div className={styles.cardsGrid} role="list">
          {/* Card 1 */}
          <div
            className={styles.whyCard}
            style={{ backgroundImage: "url('/images/logineko/trace-your-seeds-origin-768x576.jpg')" }}
          >
            <div className={styles.whyCardOverlay} />
            <h4 className={styles.whyCardTitle}>
              <strong>Food that&apos;s verifiable,</strong> not just claimed on a label.
            </h4>
          </div>

          {/* Card 2 */}
          <div
            className={styles.whyCard}
            style={{ backgroundImage: "url('/images/logineko/feat-2-1.png')" }}
          >
            <div className={styles.whyCardOverlay} />
            <h4 className={styles.whyCardTitle}>
              <strong>Lineage that survives</strong> multi-farm blending &amp; milling.
            </h4>
          </div>

          {/* Card 3 */}
          <div
            className={styles.whyCard}
            style={{ backgroundImage: "url('/images/logineko/feat3-1.png')" }}
          >
            <div className={styles.whyCardOverlay} />
            <h4 className={styles.whyCardTitle}>
              <strong>Targeted lot isolation</strong> in &lt; 200ms with zero collateral waste.
            </h4>
          </div>
        </div>

        {/* Part 3: Quote Block */}
        <div
          className={styles.quoteBox}
          style={{ backgroundImage: "url('/images/logineko/soil-preservation-at-logineko.webp')" }}
        >
          <div className={styles.quoteOverlay} />
          <div className={styles.quoteContent}>
            <svg className={styles.quoteMark} viewBox="0 0 96 80" aria-hidden="true" focusable="false">
              <path d="M0 80V48Q0 27 9 14 18 0 36 0v16Q23 16 18 26 13 36 13 48h23v32H0Zm60 0V48q0-21 9-34Q78 0 96 0v16q-13 0-18 10t-5 22h23v32H60Z" />
            </svg>

            <blockquote className={styles.quoteText}>
              &ldquo;When a parent buys food for their children, safety and authenticity shouldn&apos;t be an act of faith. <strong>Every grain should carry cryptographic proof of where it grew and how it reached the table.</strong>&rdquo;
            </blockquote>

            <div className={styles.quoteAuthor}>
              <div className={styles.quoteAvatar}>
                <img src="/images/logineko/samo.png" alt="FoodTrace Lead Architect" />
              </div>
              <div className={styles.authorMeta}>
                <span className={styles.authorName}>FoodTrace Architectural Council</span>
                <span className={styles.authorRole}>National Digital Trust Initiative</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
