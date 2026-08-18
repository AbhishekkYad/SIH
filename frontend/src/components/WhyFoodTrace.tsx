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
              Food should never be a matter of <strong>trust alone.</strong>
            </h2>

            <div className={styles.featureDesc}>
              <p>
                Today, food can pass through farmers, processors, logistics providers, retailers and consumers — with critical information scattered across different systems and handoffs.
              </p>
            </div>

            <div className={styles.featureDesc}>
              <p>
                FoodTrace brings those journeys together, creating a verifiable record of where food came from, what happened to it, and how it reached the consumer. When something goes wrong, the right batch can be identified and traced instead of relying on guesswork.
              </p>
            </div>

            <div>
              <a
                href="https://www.fao.org/food-safety/food-control-systems/traceability---recalls/en"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--grass"
              >
                Explore The FoodTrace Ecosystem →
              </a>
            </div>
          </div>

          <div className="media-frame" style={{ aspectRatio: '4/3' }}>
            <img
              src="/images/why-foodtrace-warehouse.jpg"
              alt="Food processing warehouse with traceability monitoring"
              loading="lazy"
            />
          </div>
        </div>



        {/* Part 3: Quote & Endorsement Block */}
        <div
          className={styles.quoteBox}
          style={{ backgroundImage: "url('/images/logineko/soil-preservation-at-logineko.webp')" }}
        >
          <div className={styles.quoteOverlay} />
          <div className={styles.quoteContent}>
            <span className={styles.quoteEyebrow}>WHY TRACEABILITY MATTERS</span>

            <svg className={styles.quoteMark} viewBox="0 0 96 80" aria-hidden="true" focusable="false">
              <path d="M0 80V48Q0 27 9 14 18 0 36 0v16Q23 16 18 26 13 36 13 48h23v32H0Zm60 0V48q0-21 9-34Q78 0 96 0v16q-13 0-18 10t-5 22h23v32H60Z" />
            </svg>

            <blockquote className={styles.quoteText}>
              &ldquo;Countries must invest in technologies that <strong>trace food safety emergencies.</strong>&rdquo;
            </blockquote>

            <div className={styles.quoteAuthor}>
              <div className={styles.quoteAvatar}>
                <img src="/images/logineko/samo.png" alt="Dr Tedros Adhanom Ghebreyesus" />
              </div>
              <div className={styles.authorMeta}>
                <span className={styles.authorName}>Dr Tedros Adhanom Ghebreyesus</span>
                <span className={styles.authorRole}>Director-General, World Health Organization</span>
              </div>
            </div>

            <p className={styles.quotePrinciple}>
              FoodTrace is built around the same principle: make food journeys more transparent, traceable and verifiable — from origin to consumer.
            </p>

            <div className={styles.quoteCtaWrap}>
              <a
                href="https://www.who.int/news-room/detail/06-12-2019-more-complex-foodborne-disease-outbreaks-requires-new-technologies-greater-transparency"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.quoteCtaBtn}
              >
                <span>Read The WHO Report</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
