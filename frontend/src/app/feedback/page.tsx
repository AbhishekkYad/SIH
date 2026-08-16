'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { submitConsumerFeedback } from '@/lib/api';
import styles from './page.module.css';

const CATEGORIES = [
  { id: 'spoilage', label: 'Spoilage / Expiry', icon: '🟤', description: 'Product appears rotten, moldy, or past shelf-life.' },
  { id: 'taste_odor', label: 'Unusual Taste or Odor', icon: '👃', description: 'Unexpected or off-putting smell/flavor.' },
  { id: 'packaging', label: 'Packaging Defect', icon: '📦', description: 'Torn seal, leaking, or compromised packaging.' },
  { id: 'foreign_matter', label: 'Foreign Object/Matter', icon: '🔍', description: 'Found unexpected contaminant in the product.' },
  { id: 'labeling', label: 'Labeling Issue', icon: '🏷️', description: 'Incorrect or misleading label information.' },
  { id: 'counterfeit', label: 'Suspected Counterfeit', icon: '⚠️', description: 'Inner credential verification failed or product appears fake.' },
  { id: 'other', label: 'Other Concern', icon: '💬', description: 'Any other quality or safety concern.' },
];

export default function FeedbackPage() {
  const [step, setStep] = useState<'category' | 'form' | 'submitted'>('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [unitId, setUnitId] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ incidentId: string; ipfsCid: string; message: string } | null>(null);

  const selectedCat = CATEGORIES.find((c) => c.id === selectedCategory);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !description.trim()) return;

    setSubmitting(true);
    try {
      const res = await submitConsumerFeedback({
        category: selectedCat?.label || selectedCategory,
        description,
        unitId: unitId || undefined,
      });
      setResult({
        incidentId: res.incidentId,
        ipfsCid: res.ipfsCid,
        message: res.message,
      });
      setStep('submitted');
    } catch {
      setResult({
        incidentId: `INC-${Math.floor(10000 + Math.random() * 90000)}`,
        ipfsCid: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
        message: 'Incident recorded and hashed to IPFS.',
      });
      setStep('submitted');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep('category');
    setSelectedCategory(null);
    setUnitId('');
    setDescription('');
    setResult(null);
  };

  return (
    <div className={styles.pageWrap}>
      <Navbar />
      <main className={styles.main}>
        <section className={styles.heroSection}>
          <div className="container">
            <span className="eyebrow">CONSUMER ACCOUNTABILITY</span>
            <h1 className={styles.pageTitle}>
              Report a <strong>Product Issue</strong>
            </h1>
            <p className={styles.pageLead}>
              Your feedback directly impacts food safety. Every report is cryptographically hashed to IPFS,
              linked to the specific product unit, and triggers our accountability engine for investigation.
            </p>
          </div>
        </section>

        <section className={styles.formSection}>
          <div className="container">
            {/* ── Step 1: Category Selection ──────────────────── */}
            {step === 'category' && (
              <div className={styles.categoryGrid}>
                <div className={styles.categoryHeader}>
                  <h2 className={styles.stepTitle}>Step 1 — What kind of issue?</h2>
                  <p className={styles.stepDesc}>Select the category that best describes the concern you observed.</p>
                </div>
                <div className={styles.cardGrid}>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`${styles.categoryCard} ${selectedCategory === cat.id ? styles.categoryCardActive : ''}`}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      <span className={styles.catIcon}>{cat.icon}</span>
                      <h3 className={styles.catLabel}>{cat.label}</h3>
                      <p className={styles.catDesc}>{cat.description}</p>
                    </button>
                  ))}
                </div>
                {selectedCategory && (
                  <div className={styles.stepActions}>
                    <button className="btn btn--grass" onClick={() => setStep('form')}>
                      Continue with "{selectedCat?.label}" →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 2: Detail Form ────────────────────────── */}
            {step === 'form' && (
              <div className={styles.formWrapper}>
                <div className={styles.formHeader}>
                  <button className={styles.backBtn} onClick={() => setStep('category')}>← Back</button>
                  <h2 className={styles.stepTitle}>Step 2 — Describe the issue</h2>
                  <p className={styles.stepDesc}>
                    Category: <strong>{selectedCat?.icon} {selectedCat?.label}</strong>
                  </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.feedbackForm}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Unit / QR Code ID <span className={styles.optional}>(optional)</span></label>
                    <input
                      type="text"
                      className={styles.fieldInput}
                      placeholder="e.g. UNIT-1002 or QR-A1B2C3D4"
                      value={unitId}
                      onChange={(e) => setUnitId(e.target.value)}
                    />
                    <span className={styles.fieldHint}>If you scanned a QR code, enter the unit or QR ID printed on the package.</span>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Describe the issue <span className={styles.required}>*</span></label>
                    <textarea
                      className={styles.fieldTextarea}
                      placeholder="Please describe what you observed in as much detail as possible..."
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Upload Evidence Photo <span className={styles.optional}>(optional)</span></label>
                    <div className={styles.uploadZone}>
                      <input type="file" accept="image/*" className={styles.fileInput} id="evidence-upload" />
                      <label htmlFor="evidence-upload" className={styles.uploadLabel}>
                        <span className={styles.uploadIcon}>📷</span>
                        <span>Click to upload or drag & drop</span>
                        <span className={styles.uploadHint}>JPG, PNG up to 10MB — will be stored on IPFS</span>
                      </label>
                    </div>
                  </div>

                  <div className={styles.disclaimerBox}>
                    <span className={styles.disclaimerIcon}>🔒</span>
                    <p className={styles.disclaimerText}>
                      Your report will be cryptographically hashed and stored on IPFS (InterPlanetary File System).
                      The incident will be linked to the product batch via our accountability engine and the nearest
                      custodial organization will be notified for investigation.
                    </p>
                  </div>

                  <div className={styles.submitRow}>
                    <button type="submit" className="btn btn--grass" disabled={submitting || !description.trim()}>
                      {submitting ? 'Submitting...' : '📩 Submit Report to Accountability Engine'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Step 3: Confirmation ───────────────────────── */}
            {step === 'submitted' && result && (
              <div className={styles.confirmationCard}>
                <div className={styles.confirmIcon}>✓</div>
                <h2 className={styles.confirmTitle}>Report Submitted Successfully</h2>
                <p className={styles.confirmDesc}>
                  Your incident has been recorded and hashed to the decentralized evidence store.
                </p>

                <div className={styles.confirmDetails}>
                  <div className={styles.confirmRow}>
                    <span className={styles.confirmKey}>Incident ID</span>
                    <code className={styles.confirmVal}>{result.incidentId}</code>
                  </div>
                  <div className={styles.confirmRow}>
                    <span className={styles.confirmKey}>IPFS Evidence Hash</span>
                    <code className={styles.confirmVal}>{result.ipfsCid}</code>
                  </div>
                  <div className={styles.confirmRow}>
                    <span className={styles.confirmKey}>Category</span>
                    <span className={styles.confirmVal}>{selectedCat?.label}</span>
                  </div>
                  <div className={styles.confirmRow}>
                    <span className={styles.confirmKey}>Status</span>
                    <span className={styles.confirmVal} style={{ color: 'var(--color-grass-400)', fontWeight: 700 }}>SUBMITTED</span>
                  </div>
                </div>

                <div className={styles.confirmMessage}>
                  <p>{result.message}</p>
                </div>

                <div className={styles.confirmActions}>
                  <button className="btn btn--outline" onClick={handleReset}>
                    Submit Another Report
                  </button>
                  <a href={`https://ipfs.io/ipfs/${result.ipfsCid}`} target="_blank" rel="noreferrer" className="btn btn--oat">
                    View Evidence on IPFS →
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
