"use client";
import styles from "./TrackedCropsGrid.module.css";

interface CropItem {
  id: string;
  name: string;
  volume: string;
  origin: string;
  img: string;
}

const CROPS: CropItem[] = [
  {
    id: "wheat",
    name: "Organic Wheat",
    volume: "12,400 MT",
    origin: "Nashik Cluster N-402",
    img: "/images/logineko/crop-wheat-logineko-150x150.jpg",
  },
  {
    id: "oats",
    name: "Milled Oats",
    volume: "9,590 MT",
    origin: "Pune Hub Depot",
    img: "/images/logineko/crop-oats-logineko-150x150.jpg",
  },
  {
    id: "peas",
    name: "Yellow & Green Peas",
    volume: "6,900 MT",
    origin: "Madhya Pradesh APMC",
    img: "/images/logineko/crop-peas-logineko-150x150.jpg",
  },
  {
    id: "chickpeas",
    name: "Desi Chickpeas",
    volume: "4,320 MT",
    origin: "Maharashtra Collective",
    img: "/images/logineko/crop-chickpea-logineko-150x150.jpg",
  },
  {
    id: "sunflower",
    name: "Sunflower Seeds",
    volume: "7,290 MT",
    origin: "Rajasthan Agrilog Hub",
    img: "/images/logineko/crop-sunflower-logineko-150x150.jpg",
  },
  {
    id: "flax",
    name: "Organic Flaxseed",
    volume: "2,760 MT",
    origin: "Karnataka Bio-Cluster",
    img: "/images/logineko/crop-flax-logineko-150x150.jpg",
  },
];

export default function TrackedCropsGrid() {
  return (
    <section className={styles.blockCrops} id="crops">
      <div className="container">
        <header className="section-intro">
          <span className="eyebrow">WHAT WE TRACK</span>
          <h2 className="heading-2">
            We track <strong>staple crops &amp; commodities</strong> — from
            field origin to retail shelf.
          </h2>
          <p className="lead">
            Here are the primary agricultural assets registered and committed
            across active harvest nodes in 2025/2026.
          </p>
        </header>

        <div className={styles.cropsGrid} role="list">
          {CROPS.map((crop) => (
            <div key={crop.id} className={styles.cropCard}>
              <div className={styles.cropImageWrap}>
                <img src={crop.img} alt={crop.name} loading="lazy" />
              </div>
              <div className={styles.cropInfo}>
                <h3 className={styles.cropName}>{crop.name}</h3>
                <span className={styles.cropMetric}>{crop.volume}</span>
                <span className={styles.cropOrigin}>{crop.origin}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
