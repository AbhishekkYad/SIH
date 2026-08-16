'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import { verifyInnerCredential, submitConsumerFeedback } from '@/lib/api';

// Mock timeline data for the specific unit
const MOCK_TIMELINE = [
  {
    id: 'evt-1',
    name: 'Harvest & Genesis',
    date: '10 Aug 2026, 06:45 AM',
    desc: 'Crop harvested and registered on the blockchain.',
    actor: 'Ramesh Patil (Organic Farmer Cluster #402)',
    location: 'Nashik Valley, Maharashtra',
    txId: '0x88f2...91ab42'
  },
  {
    id: 'evt-2',
    name: 'Processing & Sortex Cleaning',
    date: '11 Aug 2026, 10:15 AM',
    desc: 'Optical grain classification and cleaning.',
    actor: 'Sahyadri Milling & Processing Unit #04',
    location: 'Chakan Industrial Hub, Pune',
    txId: '0x44cd...0911fe'
  },
  {
    id: 'evt-3',
    name: 'Packaging & Serialization',
    date: '12 Aug 2026, 11:30 AM',
    desc: 'Sealed in consumer pack and printed with Dual QR.',
    actor: 'Central Cold Storage & Packaging Facility',
    location: 'Tathawade Logistics Hub, Pune',
    txId: '0x12bb...8849aa'
  },
  {
    id: 'evt-4',
    name: 'Retail Reception',
    date: '14 Aug 2026, 08:00 AM',
    desc: 'Received at retail shelf. Authenticity verified.',
    actor: 'GreenBasket Hypermarket Bandra',
    location: 'Mumbai Retail Outlets',
    txId: '0x33dd...2249aa'
  }
];

export default function TrackProductPage({ params }: { params: { id: string } }) {
  const [innerCode, setInnerCode] = useState('');
  const [isAuthentic, setIsAuthentic] = useState<boolean | null>(null);
  
  const [feedbackCategory, setFeedbackCategory] = useState('Spoilage');
  const [feedbackDesc, setFeedbackDesc] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleVerify = async () => {
    const res = await verifyInnerCredential(innerCode);
    setIsAuthentic(res.isAuthentic);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitConsumerFeedback({ category: feedbackCategory, description: feedbackDesc, unitId: params.id });
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setFeedbackDesc('');
    }, 5000);
  };

  return (
    <div className={styles.pageWrap}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.heroSection}>
          <span className={styles.eyebrow}>Verified Product Journey</span>
          <h1 className={styles.title}>Organic Sharbati Wheat Flour</h1>
          <p className={styles.subtitle}>
            You are viewing the immutable history for unit <strong>{params.id}</strong>. Every step below is backed by a cryptographic signature on the Hyperledger Fabric network.
          </p>
        </section>

        <section>
          <div className="container">
            <div className={styles.grid}>
              
              {/* Left Column: Traceability Timeline */}
              <div className={styles.timelineCard}>
                <h2 className={styles.cardTitle}>Farm-to-Fork Timeline</h2>
                <div className={styles.timeline}>
                  {MOCK_TIMELINE.map((evt, idx) => (
                    <div key={evt.id} className={styles.timelineItem}>
                      <div className={styles.timelineIcon}>{idx + 1}</div>
                      <div className={styles.timelineContent}>
                        <div className={styles.eventHeader}>
                          <span className={styles.eventName}>{evt.name}</span>
                          <span className={styles.eventTime}>{evt.date}</span>
                        </div>
                        <p className={styles.eventDesc}>{evt.desc}</p>
                        <div className={styles.eventMeta}>
                          <div className={styles.metaRow}>
                            <span className={styles.metaLabel}>Actor:</span>
                            <span className={styles.metaVal}>{evt.actor}</span>
                          </div>
                          <div className={styles.metaRow}>
                            <span className={styles.metaLabel}>Location:</span>
                            <span className={styles.metaVal}>{evt.location}</span>
                          </div>
                          <div className={styles.metaRow}>
                            <span className={styles.metaLabel}>Tx Hash:</span>
                            <span className={styles.metaVal} style={{color: 'var(--brand-green)'}}>{evt.txId}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Consumer Actions (Authenticity + Feedback) */}
              <div className={styles.sidebar}>
                
                <div className={styles.actionCard}>
                  <h3 className={styles.actionTitle}>Authenticity Check</h3>
                  <p className={styles.actionDesc}>
                    Scratch the silver panel on your package and enter the 8-digit <strong>Inner Credential</strong> below.
                  </p>
                  <div className={styles.inputGroup}>
                    <input 
                      type="text" 
                      className={styles.inputField} 
                      placeholder="e.g. A9B8C7D6"
                      value={innerCode}
                      onChange={(e) => {
                        setInnerCode(e.target.value);
                        setIsAuthentic(null);
                      }}
                    />
                  </div>
                  <button className="btn btn--grass" onClick={handleVerify} disabled={!innerCode} style={{width: '100%'}}>Verify Product</button>
                  
                  {isAuthentic === true && (
                    <div className={styles.verifyBadge}>
                      ✅ Verified Authentic
                    </div>
                  )}
                  {isAuthentic === false && (
                    <div className={styles.verifyBadge} style={{backgroundColor: 'var(--color-alert-soft)', color: 'var(--color-alert-red)', borderColor: 'var(--color-alert-red)'}}>
                      ❌ Risk of Counterfeit
                    </div>
                  )}
                </div>

                <div className={styles.actionCard}>
                  <h3 className={styles.actionTitle}>Report an Issue</h3>
                  <p className={styles.actionDesc}>
                    Problem with this specific item? Submitting a report instantly alerts the supply chain.
                  </p>
                  {feedbackSubmitted ? (
                    <div className={styles.successMessage}>
                      ✓ Incident successfully hashed to IPFS and reported to QA.
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitFeedback}>
                      <div className={styles.inputGroup}>
                        <select className={styles.selectField} value={feedbackCategory} onChange={e => setFeedbackCategory(e.target.value)}>
                          <option value="Spoilage">Spoilage / Contamination</option>
                          <option value="Packaging Defect">Packaging Defect / Broken Seal</option>
                          <option value="Taste">Abnormal Taste or Odor</option>
                          <option value="Counterfeit">Suspected Counterfeit</option>
                        </select>
                      </div>
                      <div className={styles.inputGroup}>
                        <textarea 
                          className={styles.textareaField} 
                          placeholder="Describe the issue..."
                          value={feedbackDesc}
                          onChange={e => setFeedbackDesc(e.target.value)}
                          required
                        ></textarea>
                      </div>
                      <button type="submit" className="btn btn--primary" style={{width: '100%'}}>Submit Report</button>
                    </form>
                  )}
                </div>

              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
