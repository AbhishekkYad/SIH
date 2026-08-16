'use client';

import { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { verifyInnerCredential } from '@/lib/api';
import styles from './page.module.css';

type VerifyState = 'initial' | 'scratching' | 'entering' | 'verifying' | 'authentic' | 'failed';

export default function VerifyPage() {
  const [state, setState] = useState<VerifyState>('initial');
  const [code, setCode] = useState('');
  const [scratchProgress, setScratchProgress] = useState(0);
  const [result, setResult] = useState<{ isAuthentic: boolean; message: string } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  // Initialize scratch canvas
  useEffect(() => {
    if (state !== 'scratching') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with scratch-off coating
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#c0c2bb');
    gradient.addColorStop(0.5, '#969a8d');
    gradient.addColorStop(1, '#c0c2bb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add "SCRATCH HERE" text
    ctx.fillStyle = '#6b715f';
    ctx.font = 'bold 16px "Public Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SCRATCH TO REVEAL CREDENTIAL', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '12px "Public Sans", sans-serif';
    ctx.fillText('Use your cursor to scratch the silver coating', canvas.width / 2, canvas.height / 2 + 15);
  }, [state]);

  const handleScratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (state !== 'scratching') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x: number, y: number;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Calculate scratch progress
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let clearedPixels = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) clearedPixels++;
    }
    const totalPixels = canvas.width * canvas.height;
    const progress = Math.min((clearedPixels / totalPixels) * 100, 100);
    setScratchProgress(progress);

    if (progress > 50) {
      // Reveal complete — move to code entry
      setTimeout(() => setState('entering'), 500);
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) return;
    setState('verifying');

    try {
      const res = await verifyInnerCredential(code);
      setResult({ isAuthentic: res.isAuthentic, message: res.message });
      setState(res.isAuthentic ? 'authentic' : 'failed');
    } catch {
      setResult({ isAuthentic: false, message: 'Verification service unavailable. Please try again.' });
      setState('failed');
    }
  };

  const handleReset = () => {
    setState('initial');
    setCode('');
    setScratchProgress(0);
    setResult(null);
  };

  return (
    <div className={styles.pageWrap}>
      <Navbar />
      <main className={styles.main}>
        <section className={styles.heroSection}>
          <div className="container">
            <span className="eyebrow">PHYSICAL AUTHENTICITY VERIFICATION</span>
            <h1 className={styles.pageTitle}>
              Verify <strong>Product Authenticity</strong>
            </h1>
            <p className={styles.pageLead}>
              Each FoodTrace product contains a concealed inner credential hidden beneath a tamper-evident
              scratch coating. Reveal the code and verify it against our cryptographic registry.
            </p>
          </div>
        </section>

        <section className={styles.verifySection}>
          <div className="container">
            <div className={styles.verifyCard}>
              {/* ── Step 1: Start ─────────────────────────────── */}
              {state === 'initial' && (
                <div className={styles.stepContent}>
                  <div className={styles.stepIcon}>🔐</div>
                  <h2 className={styles.stepTitle}>Inner Credential Verification</h2>
                  <p className={styles.stepDesc}>
                    Look for the silver scratch panel on your product packaging. This concealed credential
                    prevents counterfeit duplication — even if the outer QR is copied, the inner code
                    is unique and physically tamper-evident.
                  </p>

                  <div className={styles.instructionCards}>
                    <div className={styles.instructionCard}>
                      <span className={styles.instrNum}>1</span>
                      <h4>Locate the Panel</h4>
                      <p>Find the silver scratch area on the inner fold of the packaging.</p>
                    </div>
                    <div className={styles.instructionCard}>
                      <span className={styles.instrNum}>2</span>
                      <h4>Scratch to Reveal</h4>
                      <p>Gently scratch the silver coating to reveal the hidden alphanumeric code.</p>
                    </div>
                    <div className={styles.instructionCard}>
                      <span className={styles.instrNum}>3</span>
                      <h4>Verify Online</h4>
                      <p>Enter the revealed code below to verify against the blockchain registry.</p>
                    </div>
                  </div>

                  <div className={styles.actionRow}>
                    <button className="btn btn--grass" onClick={() => setState('scratching')}>
                      🪙 Simulate Scratch & Reveal
                    </button>
                    <button className="btn btn--outline" onClick={() => setState('entering')}>
                      I already have the code →
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 2: Scratch Simulation ────────────────── */}
              {state === 'scratching' && (
                <div className={styles.stepContent}>
                  <h2 className={styles.stepTitle}>Scratch the Panel</h2>
                  <p className={styles.stepDesc}>
                    Use your cursor (or finger on mobile) to scratch off the silver coating below.
                    Reveal at least 50% to decode the hidden credential.
                  </p>

                  <div className={styles.scratchContainer}>
                    <div className={styles.hiddenCode}>
                      <span className={styles.revealedCode}>SEC-A7K2-M9XP</span>
                      <span className={styles.codeLabel}>INNER CREDENTIAL CODE</span>
                    </div>
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={120}
                      className={styles.scratchCanvas}
                      onMouseDown={() => { isDrawingRef.current = true; }}
                      onMouseUp={() => { isDrawingRef.current = false; }}
                      onMouseLeave={() => { isDrawingRef.current = false; }}
                      onMouseMove={(e) => { if (isDrawingRef.current) handleScratch(e); }}
                      onTouchStart={() => { isDrawingRef.current = true; }}
                      onTouchEnd={() => { isDrawingRef.current = false; }}
                      onTouchMove={(e) => { if (isDrawingRef.current) handleScratch(e); }}
                    />
                  </div>

                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${scratchProgress}%` }} />
                  </div>
                  <span className={styles.progressLabel}>{Math.round(scratchProgress)}% revealed</span>
                </div>
              )}

              {/* ── Step 3: Code Entry ────────────────────────── */}
              {state === 'entering' && (
                <div className={styles.stepContent}>
                  <div className={styles.stepIcon}>🔑</div>
                  <h2 className={styles.stepTitle}>Enter Inner Credential</h2>
                  <p className={styles.stepDesc}>
                    Type the alphanumeric code revealed beneath the scratch panel.
                  </p>

                  <div className={styles.codeInputGroup}>
                    <input
                      type="text"
                      className={styles.codeInput}
                      placeholder="e.g. SEC-A7K2-M9XP"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      autoFocus
                      maxLength={20}
                    />
                    <button
                      className="btn btn--grass"
                      onClick={handleVerify}
                      disabled={!code.trim()}
                    >
                      Verify Authenticity
                    </button>
                  </div>

                  <button className={styles.backLink} onClick={() => setState('initial')}>
                    ← Back to instructions
                  </button>
                </div>
              )}

              {/* ── Verifying Spinner ─────────────────────────── */}
              {state === 'verifying' && (
                <div className={styles.stepContent}>
                  <div className={styles.spinner} />
                  <h2 className={styles.stepTitle}>Verifying Against Registry...</h2>
                  <p className={styles.stepDesc}>
                    Checking credential <code>{code}</code> against the cryptographic product registry.
                  </p>
                </div>
              )}

              {/* ── Result: Authentic ─────────────────────────── */}
              {state === 'authentic' && result && (
                <div className={styles.stepContent}>
                  <div className={styles.resultIcon} style={{ backgroundColor: 'var(--color-grass-400)' }}>✓</div>
                  <h2 className={styles.stepTitle} style={{ color: 'var(--color-grass-400)' }}>Authenticity Confirmed</h2>
                  <p className={styles.resultMessage}>{result.message}</p>

                  <div className={styles.resultDetails}>
                    <div className={styles.resultRow}>
                      <span>Credential Code</span>
                      <code>{code}</code>
                    </div>
                    <div className={styles.resultRow}>
                      <span>Verification Status</span>
                      <span style={{ color: 'var(--color-grass-400)', fontWeight: 700 }}>AUTHENTIC ✓</span>
                    </div>
                    <div className={styles.resultRow}>
                      <span>Registry Match</span>
                      <span style={{ color: 'var(--color-grass-400)' }}>Confirmed on Fabric Ledger</span>
                    </div>
                  </div>

                  <div className={styles.actionRow}>
                    <button className="btn btn--outline" onClick={handleReset}>Verify Another Product</button>
                    <a href="/feedback" className="btn btn--oat">Report an Issue →</a>
                  </div>
                </div>
              )}

              {/* ── Result: Failed ────────────────────────────── */}
              {state === 'failed' && result && (
                <div className={styles.stepContent}>
                  <div className={styles.resultIcon} style={{ backgroundColor: 'var(--color-alert-red)' }}>✕</div>
                  <h2 className={styles.stepTitle} style={{ color: 'var(--color-alert-red)' }}>Verification Failed</h2>
                  <p className={styles.resultMessage}>{result.message}</p>

                  <div className={styles.warningBox}>
                    <h4>⚠️ This product may be counterfeit</h4>
                    <p>
                      The inner credential code you entered does not match any record in the cryptographic registry.
                      This could indicate the product packaging has been tampered with or is a counterfeit copy.
                    </p>
                    <a href="/feedback" className="btn btn--grass" style={{ marginTop: '16px' }}>
                      🚨 Report Suspected Counterfeit
                    </a>
                  </div>

                  <button className="btn btn--outline" onClick={handleReset} style={{ marginTop: '16px' }}>
                    ← Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
