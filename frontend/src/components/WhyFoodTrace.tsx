"use client";
import styles from "./WhyFoodTrace.module.css";

interface ImpactCard {
  num: string;
  title: string;
  desc: string;
  benefit: string;
  icon: string;
}

const IMPACT_CARDS: ImpactCard[] = [
  {
    num: "01",
    title: "Transparency",
    desc: "Know where the product came from and how it moved at every point of handover.",
    benefit:
      "Granular batch & origin visibility across multi-tier agricultural supply lines.",
    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  },
  {
    num: "02",
    title: "Accountability",
    desc: "Every important supply-chain action is connected to an authenticated, signed stakeholder identity.",
    benefit:
      "Non-repudiable audit trails for farmers, millers, lab certifiers, and freight haulers.",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    num: "03",
    title: "Faster Response",
    desc: "Identify potential problems earlier in the chain instead of discovering them at retail shelves.",
    benefit:
      "Autonomous POS quarantine in under 200ms without disruptive blanket recalls.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    num: "04",
    title: "Consumer Trust",
    desc: "Give consumers a simple, smartphone-ready way to verify the authentic products they purchase.",
    benefit:
      "Instant GS1 Digital Link scan without downloading any proprietary app.",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  },
  {
    num: "05",
    title: "Business Intelligence",
    desc: "Turn raw supply-chain activity and transit telemetry into actionable operational insights.",
    benefit:
      "Reduce food waste, optimize delivery corridors, and verify quality compliance.",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
];

export default function WhyFoodTrace() {
  return (
    <section className={styles.section} id="why">
      <div className="container">
        {/* Editorial Manifesto Card */}
        <div className={styles.manifestoCard}>
          <div className={styles.manifestoHeader}>
            <span className="eyebrow">WHY WE BUILT THIS PLATFORM</span>
            <h2 className={styles.manifestoTitle}>
              Food supply chains are complex, fragmented and difficult to
              verify.
            </h2>
          </div>

          <p className={styles.manifestoLead}>
            When something goes wrong in agricultural supply lines, identifying
            where the problem originated can be slow, costly, and contentious.
            We built FoodTrace to create a transparent digital trail for every
            product — connecting every stakeholder from agricultural origin to
            everyday consumers.
          </p>
        </div>

        {/* 5 Impact Cards Grid */}
        <div className={styles.impactGrid}>
          {IMPACT_CARDS.map((card) => (
            <div key={card.num} className={styles.impactCard}>
              <div className={styles.cardTop}>
                <div className={styles.iconWrap}>
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={card.icon} />
                  </svg>
                </div>
                <span className={styles.cardNum}>{card.num}</span>
              </div>

              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardDesc}>{card.desc}</p>

              <div className={styles.cardBenefit}>
                <span className={styles.benefitTag}>IMPACT</span>
                <span className={styles.benefitText}>{card.benefit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
