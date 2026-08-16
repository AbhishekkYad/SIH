'use client';

import { useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

interface GalleryItem {
  id: string;
  category: string;
  title: string;
  src: string;
  timestamp: string;
  device: string;
  hash: string;
  description: string;
}

const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'harvest',
    category: 'Farm Origin',
    title: 'Plot Harvest & Field Sowing',
    src: '/images/logineko/field-operations-at-logineko-768x432.jpg',
    timestamp: '2026-08-10 06:45 IST',
    device: 'Field Drone DJI Mavic 3M (Multispectral)',
    hash: '0x88f291ab4289be03b4a606b7f6c9733f3b7fdd83',
    description: 'Nashik Cluster N-402 geofenced organic wheat harvest. Soil moisture recorded at 11.8%.',
  },
  {
    id: 'milling',
    category: 'Processing & Sortex',
    title: 'Sortex Optical Cleaning Facility',
    src: '/images/logineko/farming-software-maps-solution.jpg',
    timestamp: '2026-08-11 10:15 IST',
    device: 'Sortex Vision Pro Camera Node #04',
    hash: '0x44cd0911fe89be03b4a606b7f6c9733f3b7fdd83',
    description: 'Pneumatic de-stoning and optical grain classification yielding 99.92% defect-free purity.',
  },
  {
    id: 'packaging',
    category: 'Packaging & Logistics',
    title: 'Automated Nitrogen-Flushed Packaging',
    src: '/images/logineko/team-at-logineko-farm.jpg',
    timestamp: '2026-08-12 11:30 IST',
    device: 'Line #02 High-Speed Packager',
    hash: '0x12bb8849aa89be03b4a606b7f6c9733f3b7fdd83',
    description: 'Nitrogen-sealed 5KG consumer packs with serialized GS1 Digital Link dynamic QR codes.',
  },
  {
    id: 'lab_cert',
    category: 'Lab Verification',
    title: 'FSSAI NABL Laboratory Certificate',
    src: '/images/logineko/soil-preservation-at-logineko.webp',
    timestamp: '2026-08-11 16:30 IST',
    device: 'Eurofins Spectrophotometer Lab Node',
    hash: '0x77eeff220189be03b4a606b7f6c9733f3b7fdd83',
    description: 'Certified 0.00 PPM chemical residues and 13.4% premium gluten protein verified.',
  },
];

export default function OneFoodPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [activeItemId, setActiveItemId] = useState<string>(INITIAL_GALLERY[0].id);
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [selectedCrop, setSelectedCrop] = useState<string>('Wheat');
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeItem = gallery.find((g) => g.id === activeItemId) || gallery[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setGallery((prev) =>
      prev.map((item) =>
        item.id === activeItemId
          ? {
              ...item,
              src: objectUrl,
              title: `${item.title} (Updated)`,
              hash: `0x${Math.random().toString(16).substring(2, 10)}...ipfs`,
              timestamp: new Date().toLocaleString(),
            }
          : item
      )
    );
    setUploadNotice(`✓ Updated ${activeItem.category} image with "${file.name}"`);
    setTimeout(() => setUploadNotice(null), 4000);
  };

  const handleResetImages = () => {
    setGallery(INITIAL_GALLERY);
    setUploadNotice('↺ Restored default on-chain ledger images.');
    setTimeout(() => setUploadNotice(null), 3000);
  };

  return (
    <div className={styles.pageWrap}>
      <Navbar />

      <main className={styles.main}>
        {/* Page Hero Header */}
        <section className={styles.heroSection}>
          <div className={styles.heroTop}>
            <div className={styles.badgeRow}>
              <span className="badge badge--success">✓ Verified Genesis Lot</span>
              <span className="badge badge--neutral mono-num">ID: BATCH-WF-2025-042</span>
            </div>
            <h1 className={styles.pageTitle}>
              One FoodTrace Provenance Explorer
            </h1>
            <p className={styles.pageLead}>
              Single-lot cryptographic audit trail: photographic evidence, sensory parameters, and NABL laboratory certificates pinned to IPFS.
            </p>
          </div>

          {/* Quick Crop Selector */}
          <div className={styles.cropSelector}>
            <span className={styles.cropSelectorLabel}>Select Commodity:</span>
            {['Wheat', 'Basmati Rice', 'Mustard Oil', 'Toor Dal', 'Honey', 'Chana Dal'].map((crop) => (
              <button
                key={crop}
                type="button"
                className={`${styles.cropBtn} ${selectedCrop === crop ? styles.cropBtnActive : ''}`}
                onClick={() => setSelectedCrop(crop)}
              >
                {crop}
              </button>
            ))}
          </div>
        </section>

        {/* Interactive Evidence Workspace */}
        <section className={styles.workspaceGrid}>
          {/* Left Column: Stage Selector */}
          <div className={styles.controlPanel}>
            <div className={styles.panelHead}>
              <span className={styles.panelTitle}>Verified Handover Stages</span>
              <span className={styles.panelSub}>4 Stages</span>
            </div>

            <div className={styles.slotList}>
              {gallery.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.slotCard} ${activeItemId === item.id ? styles.slotCardActive : ''}`}
                  onClick={() => setActiveItemId(item.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.slotThumbWrap}>
                    {item.src ? (
                      <img src={item.src} alt={item.title} className={styles.slotThumb} />
                    ) : (
                      <div className={styles.emptyThumb}>No Image</div>
                    )}
                  </div>
                  <div className={styles.slotInfo}>
                    <span className={styles.slotCat}>{item.category}</span>
                    <span className={styles.slotTitle}>{item.title}</span>
                    <span className={styles.slotTime}>{item.timestamp.split(' ')[0]}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>→</span>
                </div>
              ))}
            </div>

            {/* Media Actions */}
            <div className={styles.actionBox}>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
              />
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => fileInputRef.current?.click()}
              >
                Replace {activeItem.category} Image
              </button>

              <button
                type="button"
                className="btn btn--secondary"
                onClick={handleResetImages}
              >
                Restore Ledger Defaults
              </button>

              {uploadNotice && (
                <div style={{ fontSize: '11px', color: 'var(--color-success)', background: 'var(--color-success-bg)', padding: '6px 8px', borderRadius: '4px' }}>
                  {uploadNotice}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: High-Resolution Preview */}
          <div className={styles.previewPanel}>
            <div className={styles.previewHeader}>
              <div>
                <span className={styles.previewCategory}>{activeItem.category}</span>
                <h2 className={styles.previewTitle}>{activeItem.title}</h2>
              </div>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setPreviewModalOpen(true)}
              >
                Fullscreen HD
              </button>
            </div>

            <div className={styles.mediaContainer}>
              <img
                src={activeItem.src}
                alt={activeItem.title}
                className={styles.mainMedia}
                onClick={() => setPreviewModalOpen(true)}
              />
            </div>

            <div className={styles.metadataGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaKey}>TIMESTAMP</span>
                <span className={styles.metaVal}>{activeItem.timestamp}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaKey}>DEVICE SENSOR</span>
                <span className={styles.metaVal}>{activeItem.device}</span>
              </div>
              <div className={styles.metaItem} style={{ gridColumn: 'span 2' }}>
                <span className={styles.metaKey}>IPFS CONTENT CID</span>
                <code className={styles.metaCode}>{activeItem.hash}</code>
              </div>
              <div className={styles.metaItem} style={{ gridColumn: 'span 2' }}>
                <span className={styles.metaKey}>STAGE DESCRIPTION</span>
                <span className={styles.metaVal}>{activeItem.description}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Quality Assay Specifications */}
        <section className={styles.specsCard}>
          <span className={styles.specsTitle}>NABL Laboratory Chemical Assay & Origin Specification</span>
          <div className={styles.specsGrid}>
            <div className={styles.specBox}>
              <span className={styles.specKey}>Pesticide Residue</span>
              <span className={styles.specVal} style={{ color: 'var(--color-success)' }}>0.00 PPM (Clean)</span>
              <span className={styles.specSub}>Screened 180 Organophosphates</span>
            </div>
            <div className={styles.specBox}>
              <span className={styles.specKey}>Moisture Retention</span>
              <span className={styles.specVal}>11.8% Standard</span>
              <span className={styles.specSub}>Threshold ceiling 12.5%</span>
            </div>
            <div className={styles.specBox}>
              <span className={styles.specKey}>Optical Sortex Purity</span>
              <span className={styles.specVal} style={{ color: 'var(--color-success)' }}>99.92% Defect-Free</span>
              <span className={styles.specSub}>Laser sortex classified</span>
            </div>
            <div className={styles.specBox}>
              <span className={styles.specKey}>Farmer Revenue Escrow</span>
              <span className={styles.specVal} style={{ color: 'var(--color-success)' }}>72.4% Direct Payout</span>
              <span className={styles.specSub}>Settled on smart contract</span>
            </div>
          </div>
        </section>
      </main>

      {/* Fullscreen HD Modal */}
      {previewModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setPreviewModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>{activeItem.title}</span>
              <button className="btn btn--ghost" onClick={() => setPreviewModalOpen(false)}>✕</button>
            </div>
            <img src={activeItem.src} alt={activeItem.title} className={styles.modalImg} />
            <div className={styles.modalFoot}>
              <span>{activeItem.timestamp}</span>
              <code className="mono-num">{activeItem.hash}</code>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
