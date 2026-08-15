'use client';
import { useState } from 'react';
import styles from './SubscribeCTA.module.css';

export default function SubscribeCTA() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  return (
    <section className={styles.blockSubscribe}>
      <div className="container">
        <div className={styles.subscribeCard}>
          <span className="eyebrow" style={{ color: 'var(--color-grass-400)' }}>
            PILOT &amp; PLATFORM REGISTRATION
          </span>

          <h2 className={styles.subscribeTitle}>
            Join the national movement for <strong>verifiable food safety &amp; transparency.</strong>
          </h2>

          <div className={styles.formWrap}>
            {!subscribed ? (
              <form onSubmit={handleSubmit} className={styles.inputRow}>
                <input
                  type="email"
                  className={styles.emailInput}
                  placeholder="Enter your enterprise or work email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn--primary">
                  Request Pilot →
                </button>
              </form>
            ) : (
              <div className={styles.successMsg}>
                ✓ Thank you! We&apos;ve registered your enterprise access request.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
