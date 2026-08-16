'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const MOCK_UNITS = [
  { id: 'UNIT-1001', batchId: 'BATCH-MBTSDM2UM', status: 'PRINTED', outerQR: 'QR-A1B2C3D4', innerCode: 'SEC-9981-A' },
  { id: 'UNIT-1002', batchId: 'BATCH-MBTSDM2UM', status: 'PRINTED', outerQR: 'QR-X9Y8Z7W6', innerCode: 'SEC-4412-B' },
  { id: 'UNIT-1003', batchId: 'BATCH-IKHJWTOYD', status: 'PENDING', outerQR: 'N/A', innerCode: 'N/A' },
];

export default function UnitsPage() {
  const [units, setUnits] = useState(MOCK_UNITS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [revealCredentials, setRevealCredentials] = useState(false);
  const [formData, setFormData] = useState({
    batchId: 'BATCH-MBTSDM2UM',
    count: '10'
  });

  const handleGenerateSerials = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(formData.count, 10) || 1;
    const newUnits = Array.from({ length: count }).map((_, i) => ({
      id: `UNIT-${1004 + i + units.length}`,
      batchId: formData.batchId,
      status: 'PRINTED',
      outerQR: `QR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      innerCode: `SEC-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + (i % 26))}`
    }));
    
    setUnits([...newUnits, ...units]);
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.title}>Admin / Consumer Unit Identities & Credentials</div>
      </div>

      <div className={styles.qrSection}>
        <div className={styles.qrText}>
          <h3>QR Code & Credential Provisioning</h3>
          <p>Generate Outer QR codes for batch-level traceability and secure Inner Credentials for physical product packaging.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn--outline" onClick={() => setRevealCredentials(!revealCredentials)}>
            {revealCredentials ? '🔒 Hide Creator Keys' : '🔓 Unhide Creator Inner Keys'}
          </button>
          <button className="btn btn--outline" onClick={() => setIsPrintModalOpen(true)}>
            🖨️ Print Label Sheet
          </button>
          <button className="btn btn--grass" onClick={() => setIsModalOpen(true)}>
            + Generate Unit Serials
          </button>
        </div>
      </div>

      <div className={styles.controls}>
        <input type="text" placeholder="Search units by ID, Batch, or QR..." className={styles.search} />
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Unit ID</th>
              <th>Parent Batch</th>
              <th>Status</th>
              <th>Outer QR (Traceability)</th>
              <th>Inner Credential (Authenticity)</th>
            </tr>
          </thead>
          <tbody>
            {units.map(unit => (
              <tr key={unit.id}>
                <td style={{fontWeight: 600}}>{unit.id}</td>
                <td>{unit.batchId}</td>
                <td><span className={styles.status}>{unit.status}</span></td>
                <td>
                  {unit.outerQR !== 'N/A' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=48x48&data=${encodeURIComponent(`http://localhost:3000/track/batch/${unit.batchId}`)}`} 
                        alt="Outer QR" 
                        style={{ width: '36px', height: '36px', borderRadius: '4px', border: '1px solid var(--color-oat-300)' }}
                      />
                      <span className={styles.qrCode}>{unit.outerQR}</span>
                    </div>
                  ) : '-'}
                </td>
                <td>
                  {unit.innerCode === 'N/A' ? '-' : (
                    revealCredentials ? (
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--color-grass-500)', background: 'var(--color-grass-100)', padding: '4px 8px', borderRadius: '4px' }}>
                        {unit.innerCode}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        •••••••• (Hidden)
                      </span>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Generation Modal */}
      {isModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Generate Unit Serials</h2>
              <button className={styles.modalClose} onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleGenerateSerials}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Parent Production Batch</label>
                <select className={styles.formSelect} value={formData.batchId} onChange={e => setFormData({...formData, batchId: e.target.value})}>
                  <option value="BATCH-MBTSDM2UM">BATCH-MBTSDM2UM (Organic Wheat Flour 5KG)</option>
                  <option value="BATCH-IKHJWTOYD">BATCH-IKHJWTOYD (Cold Pressed Mustard Oil 1L)</option>
                  <option value="BATCH-GQU2F3SI4">BATCH-GQU2F3SI4 (Pure Himalayan Honey 500g)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Number of Units to Generate</label>
                <input type="number" className={styles.formInput} value={formData.count} onChange={e => setFormData({...formData, count: e.target.value})} min="1" max="1000" />
              </div>

              <div style={{ marginTop: '16px', padding: '16px', background: 'var(--color-oat-100)', borderRadius: '8px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <strong>Packaging Dual-Code Spec:</strong>
                </p>
                <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', marginLeft: '20px', marginTop: '8px' }}>
                  <li><strong>Outer QR:</strong> Printed on carton label. Links to <code>/track/batch/[id]</code>.</li>
                  <li><strong>Inner Credential:</strong> Sealed under scratch-off strip for physical product verification.</li>
                </ul>
              </div>

              <div className={styles.formActions}>
                <button type="button" className="btn btn--outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn--grass">Generate & Provision</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dual Label Print Export Modal */}
      {isPrintModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsPrintModalOpen(false)}>
          <div className={styles.modalContent} style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Dual Packaging Label Export Sheet</h2>
              <button className={styles.modalClose} onClick={() => setIsPrintModalOpen(false)}>✕</button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Export sheet for factory laser printers. Ready to print on packaging lines.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', maxHeight: '350px', overflowY: 'auto', padding: '8px' }}>
              {units.filter(u => u.outerQR !== 'N/A').map(u => (
                <div key={u.id} style={{ border: '2px dashed var(--color-oat-300)', padding: '12px', borderRadius: '8px', background: '#FFF', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>{u.id} ({u.batchId})</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`http://localhost:3000/track/batch/${u.batchId}`)}`} 
                        alt="Outer QR" 
                        style={{ width: '60px', height: '60px' }}
                      />
                      <div style={{ fontSize: '9px', fontWeight: '700', marginTop: '2px' }}>OUTER QR (Scan)</div>
                    </div>
                    <div style={{ background: 'var(--color-oat-200)', padding: '8px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--color-bean-400)', fontFamily: 'var(--font-mono)' }}>
                        {u.innerCode}
                      </div>
                      <div style={{ fontSize: '8px', color: 'var(--text-muted)', marginTop: '2px' }}>INNER SCRATCH CODE</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.formActions} style={{ marginTop: '20px' }}>
              <button type="button" className="btn btn--outline" onClick={() => setIsPrintModalOpen(false)}>Close</button>
              <button type="button" className="btn btn--grass" onClick={() => window.print()}>🖨️ Send to Factory Printer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
