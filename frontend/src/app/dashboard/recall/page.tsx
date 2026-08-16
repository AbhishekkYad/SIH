'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function RecallPage() {
  const [searchId, setSearchId] = useState('');
  const [analyzed, setAnalyzed] = useState(false);
  const [recalled, setRecalled] = useState(false);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId) {
      setAnalyzed(true);
      setRecalled(false);
    }
  };

  const handleRecall = () => {
    setRecalled(true);
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.title}>Admin / Risk & Recall Command Center</div>
        <div className={styles.subtitle}>Trace lineage graphs (DAG) to perform targeted recalls and block propagation.</div>
      </div>

      <div className={styles.dashboardGrid}>
        
        {/* Left Panel: Query & Action */}
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Risk Propagator Query</h3>
          <form onSubmit={handleAnalyze} className={styles.inputGroup}>
            <label className={styles.inputLabel}>Target Batch ID</label>
            <input 
              type="text" 
              className={styles.inputField} 
              placeholder="e.g. BATCH-MBTSDM2UM" 
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
            <button type="submit" className={styles.btnSearch}>Analyze Propagation</button>
          </form>

          {analyzed && (
            <div style={{ marginTop: '24px' }}>
              <div style={{ padding: '16px', backgroundColor: 'var(--color-alert-soft)', borderRadius: '8px', border: '1px solid var(--color-alert-red)' }}>
                <h4 style={{ color: 'var(--color-alert-red)', fontSize: '14px', marginBottom: '8px' }}>⚠️ Contamination Risk Detected</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  The Risk Propagator found <strong>3 downstream child batches</strong> currently holding or distributing material derived from {searchId}.
                </p>
              </div>

              {!recalled ? (
                <button className={styles.recallBtn} onClick={handleRecall}>
                  <span>🚨 ISSUE TARGETED RECALL</span>
                </button>
              ) : (
                <div style={{ padding: '16px', backgroundColor: 'var(--color-grass-100)', borderRadius: '8px', border: '1px solid var(--color-grass-300)', marginTop: '16px' }}>
                  <h4 style={{ color: 'var(--color-grass-500)', fontSize: '14px', marginBottom: '4px' }}>✓ Recall Issued Successfully</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Fabric <code>IncidentContract</code> executed. 3 downstream batches are now BLOCKED at POS terminals.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel: DAG Visualization */}
        <div className={styles.panel} style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--color-oat-200)' }}>
            <h3 className={styles.panelTitle} style={{ border: 'none', padding: 0 }}>Forward Lineage Trace</h3>
          </div>
          
          <div className={styles.treeContainer}>
            {analyzed ? (
              <>
                {/* Root Node */}
                <div className={`${styles.treeNode} ${styles.nodeRoot}`}>
                  <div className={styles.nodeType}>ROOT COMPROMISED BATCH</div>
                  <div className={styles.nodeTitle}>{searchId}</div>
                  <div className={styles.nodeMeta}>Origin Farm: Nashik Valley</div>
                </div>

                <div className={styles.treeArrow}>↓</div>

                {/* Level 1 Children */}
                <div className={styles.treeRow}>
                  <div className={`${styles.treeNode} ${recalled ? styles.nodeRoot : styles.nodeChild}`}>
                    <div className={styles.nodeType}>TRANSFORMED BATCH</div>
                    <div className={styles.nodeTitle}>BATCH-FLOUR-881</div>
                    <div className={styles.nodeMeta}>Status: {recalled ? 'BLOCKED' : 'IN_TRANSIT'}</div>
                  </div>
                  <div className={`${styles.treeNode} ${styles.nodeSafe}`}>
                    <div className={styles.nodeType}>TRANSFORMED BATCH</div>
                    <div className={styles.nodeTitle}>BATCH-FLOUR-882</div>
                    <div className={styles.nodeMeta}>Status: VALIDATED (Safe)</div>
                  </div>
                </div>

                <div className={styles.treeArrow}>↓</div>

                {/* Level 2 Children */}
                <div className={styles.treeRow}>
                  <div className={`${styles.treeNode} ${recalled ? styles.nodeRoot : styles.nodeChild}`}>
                    <div className={styles.nodeType}>RETAIL ALLOCATION</div>
                    <div className={styles.nodeTitle}>BATCH-RTL-90A</div>
                    <div className={styles.nodeMeta}>Location: GreenBasket Bandra<br/>Status: {recalled ? 'BLOCKED AT POS' : 'ON SHELF'}</div>
                  </div>
                  <div className={`${styles.treeNode} ${recalled ? styles.nodeRoot : styles.nodeChild}`}>
                    <div className={styles.nodeType}>RETAIL ALLOCATION</div>
                    <div className={styles.nodeTitle}>BATCH-RTL-90B</div>
                    <div className={styles.nodeMeta}>Location: GreenBasket Juhu<br/>Status: {recalled ? 'BLOCKED AT POS' : 'ON SHELF'}</div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '100px' }}>
                Enter a Batch ID to visualize its forward lineage propagation.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
