'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

// Mock data based on PRD/TRD specs
const MOCK_BATCHES = [
  { id: 'BATCH-MBTSDM2UM', product: 'Paddy', state: 'VALIDATED', custodian: 'Applewood Orchard', date: '27 Jul 2024 10:17 AM', txId: '193fdf9f5898be03b4a606b7f6c9733f3b7fdd83af5df2c96587212743e7afba' },
  { id: 'BATCH-IKHJWTOYD', product: 'Soybean', state: 'IN_TRANSIT', custodian: 'Cloverdale Ranch', date: '26 Jul 2024 09:00 AM', txId: '824dafa3433be03b4a606b7f6c9733f3b7fdd83af5df2c96587212743e7a123' },
  { id: 'BATCH-GQU2F3SI4', product: 'Wheat', state: 'VALIDATED', custodian: 'Serenity Farm', date: '25 Jul 2024 11:30 AM', txId: '492bba4511be03b4a606b7f6c9733f3b7fdd83af5df2c96587212743e7a456' },
  { id: 'BATCH-HDNVS88B', product: 'Cucumber', state: 'BLOCKED', custodian: 'Autumn Bliss', date: '24 Jul 2024 14:20 PM', txId: '58ab88dd11be03b4a606b7f6c9733f3b7fdd83af5df2c96587212743e7a789' },
];

export default function BatchesPage() {
  const [batches, setBatches] = useState(MOCK_BATCHES);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    product: 'Organic Sharbati Wheat',
    quantity: '5000',
    uom: 'KG',
    custodian: 'Default Org',
    date: new Date().toISOString().split('T')[0]
  });

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const newBatch = {
      id: `BATCH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      product: formData.product,
      state: 'CREATED',
      custodian: formData.custodian,
      date: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' AM',
      txId: 'Pending Fabric Tx...'
    };
    setBatches([newBatch, ...batches]);
    setIsModalOpen(false);
  };

  // In a real scenario, this would fetch from GET /api/v1/dashboard/batches
  useEffect(() => {
    // fetch('/api/v1/dashboard/batches').then(...)
  }, []);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.title}>Admin / Production Batches</div>
      </div>

      <div className={styles.controls}>
        <input type="text" placeholder="Search batches..." className={styles.search} />
        <div className={styles.actions}>
          <button className="btn btn--outline" style={{ height: '40px' }}>Filters</button>
          <button className="btn btn--primary" style={{ height: '40px' }} onClick={() => setIsModalOpen(true)}>+ Create Batch</button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Batch ID</th>
              <th>Product Name</th>
              <th>State</th>
              <th>Current Custodian</th>
              <th>Created Date</th>
              <th>Blockchain Info</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {batches.map(batch => (
              <tr key={batch.id}>
                <td style={{fontWeight: 600}}>{batch.id}</td>
                <td>{batch.product}</td>
                <td>
                  <span className={`${styles.status} ${batch.state === 'VALIDATED' ? styles.statusValidated : batch.state === 'IN_TRANSIT' ? styles.statusTransit : batch.state === 'BLOCKED' ? styles.statusBlocked : ''}`}>
                    {batch.state}
                  </span>
                </td>
                <td>{batch.custodian}</td>
                <td>{batch.date}</td>
                <td>
                  <div 
                    className={styles.bcInfo} 
                    onClick={() => setActiveTooltip(activeTooltip === batch.id ? null : batch.id)}
                  >
                    {batch.txId.length > 15 ? batch.txId.substring(0, 10) + '...' : batch.txId}
                    {activeTooltip === batch.id && (
                      <div className={styles.tooltip}>
                        <div className={styles.tooltipRow}>
                          <span className={styles.tooltipLabel}>Transaction ID</span>
                          <span className={styles.tooltipValue}>{batch.txId}</span>
                        </div>
                        <div className={styles.tooltipRow}>
                          <span className={styles.tooltipLabel}>Channel Id</span>
                          <span className={styles.tooltipValue}>foodtraze-channel</span>
                        </div>
                        <div className={styles.tooltipRow}>
                          <span className={styles.tooltipLabel}>Event When</span>
                          <span className={styles.tooltipValue}>{batch.date}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <button style={{background:'transparent', border:'none', cursor:'pointer', fontSize:'20px'}}>⋮</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Create New Batch</h2>
              <button className={styles.modalClose} onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleCreateBatch}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Product Reference</label>
                <select className={styles.formSelect} value={formData.product} onChange={e => setFormData({...formData, product: e.target.value})}>
                  <option value="Organic Sharbati Wheat">Organic Sharbati Wheat</option>
                  <option value="Premium Organic Paddy">Premium Organic Paddy</option>
                  <option value="Golden Soybean">Golden Soybean</option>
                </select>
              </div>

              <div style={{display: 'flex', gap: '16px'}}>
                <div className={styles.formGroup} style={{flex: 1}}>
                  <label className={styles.formLabel}>Quantity</label>
                  <input type="number" className={styles.formInput} value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                </div>
                <div className={styles.formGroup} style={{width: '100px'}}>
                  <label className={styles.formLabel}>UOM</label>
                  <select className={styles.formSelect} value={formData.uom} onChange={e => setFormData({...formData, uom: e.target.value})}>
                    <option value="KG">KG</option>
                    <option value="Tons">Tons</option>
                    <option value="L">L</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Initial Custodian (Auto-filled)</label>
                <input type="text" className={styles.formInput} value={formData.custodian} disabled />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Harvest / Creation Date</label>
                <input type="date" className={styles.formInput} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>

              <div className={styles.formActions}>
                <button type="button" className="btn btn--outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary">Register Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
