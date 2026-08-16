"use client";
import styles from "./MissionEditorial.module.css";

export default function MissionEditorial() {
  return (
    <section className={styles.blockImageText} id="mission">
      <div className="container">
        <div className={styles.inner}>
          {/* Text Content */}
          <div className={styles.content}>
            <span className="eyebrow">WHO WE ARE &amp; WHAT WE SOLVE</span>

            <h2 className={styles.title}>
              One food ecosystem. On an even{" "}
              <strong>bigger trust mission.</strong>
            </h2>

            <div className={styles.bodyText}>
              <p>
                Across <strong>12,400+ MT</strong> of certified agricultural
                harvest and <strong>48,000+</strong> committed batches,
                FoodTrace replaces fragmented paper chits and siloed ERP
                spreadsheets with a unified, permissioned{" "}
                <strong>Hyperledger Fabric DAG</strong>.
              </p>
            </div>

            <div className={styles.bodyText}>
              <p>
                Every grain blending, mill transformation, and
                temperature-controlled freight handover is cryptographically
                signed — giving consumers, brands, and regulators verifiable
                truth from soil to fork.
              </p>
            </div>

            <div className={styles.statsHighlightRow}>
              <div className={styles.statsItem}>
                <span className={styles.statsVal}>12+ Clusters</span>
                <span className={styles.statsSub}>APMC Farm Networks</span>
              </div>
              <div className={styles.statsItem}>
                <span className={styles.statsVal}>&lt; 200ms</span>
                <span className={styles.statsSub}>
                  Targeted Recall Traversal
                </span>
              </div>
              <div className={styles.statsItem}>
                <span className={styles.statsVal}>GS1 / W3C</span>
                <span className={styles.statsSub}>Open Global Standards</span>
              </div>
            </div>

            <div>
              <a
                href="#crops"
                className="btn btn--primary"
                style={{ marginTop: "8px" }}
              >
                View Harvested Commodities →
              </a>
            </div>
          </div>

          {/* Media Frame */}
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
