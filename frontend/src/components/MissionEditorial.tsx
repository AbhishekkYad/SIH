'use client';
import styles from './MissionEditorial.module.css';

export default function MissionEditorial() {
  return (
    <section className={styles.blockImageText} id="mission">
      <div className="container">
        <div className={styles.inner}>
          {/* Text Content */}
          <div className={styles.content}>
            <span className="eyebrow">WHO WE ARE &amp; WHAT WE SOLVE</span>

            <h2 className={styles.title}>
              One food ecosystem. <strong>One trusted journey.</strong>
            </h2>

            <div className={styles.bodyText}>
              <p>
                Food moves through many hands before it reaches your plate. FoodTrace connects that entire journey — from source and processing to distribution, retail, and the consumer.
              </p>
            </div>

            <div className={styles.bodyText}>
              <p>
                Every meaningful event builds a trusted, auditable product history. When something goes wrong, FoodTrace helps identify the source, trace what else may be affected, and turn consumer signals into targeted action.
              </p>
            </div>

            {/* 3 PRD-aligned stats highlights */}
            <div className={styles.statsHighlightRow}>
              <div className={styles.statsItem}>
                <span className={styles.statsVal}>End-to-End</span>
                <span className={styles.statsLabel}>SOURCE → CONSUMER</span>
                <span className={styles.statsSub}>CONNECTED JOURNEY</span>
              </div>
              <div className={styles.statsItem}>
                <span className={styles.statsVal}>Bidirectional</span>
                <span className={styles.statsLabel}>UPSTREAM + DOWNSTREAM</span>
                <span className={styles.statsSub}>RISK PROPAGATION</span>
              </div>
              <div className={styles.statsItem}>
                <span className={styles.statsVal}>Targeted</span>
                <span className={styles.statsLabel}>RECALL SCOPE</span>
                <span className={styles.statsSub}>LESS WASTE. FASTER ACTION.</span>
              </div>
            </div>

            <div className={styles.ctaWrap}>
              <a href="#solutions" className="btn btn--grass">
                EXPLORE THE FOOD JOURNEY →
              </a>
            </div>
          </div>

          {/* Media Frame (Kept original image intact) */}
          <div className={styles.mediaFrame}>
            <img
              src="/images/logineko/logineko-who-we-are.jpg"
              alt="Agricultural harvest and food processing verification"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
