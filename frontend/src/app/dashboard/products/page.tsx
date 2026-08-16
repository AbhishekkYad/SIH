'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import {
  IconSearch,
  IconClose,
} from '@/components/icons/Icons';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  gtin: string;
  shelfLife: string;
  facility: string;
  activeBatches: number;
  fssaiCompliance: 'PASSED' | 'AUDIT_PENDING' | 'RENEWAL_DUE';
  description: string;
}

const PRODUCTS_DATA: Product[] = [
  { id: '1', sku: 'SKU-WHT-001', name: 'Organic Sharbati Wheat Flour 5KG', category: 'Grains & Cereals', gtin: '8901030889211', shelfLife: '9 Months', facility: 'Sahyadri Milling Unit #04', activeBatches: 42, fssaiCompliance: 'PASSED', description: 'Stone-ground MP whole wheat grain, moisture retention under 12%, heavy metals assay compliant.' },
  { id: '2', sku: 'SKU-RIC-002', name: 'Premium Basmati Rice 10KG', category: 'Grains & Cereals', gtin: '8901030889228', shelfLife: '24 Months', facility: 'Taraori Rice Mills, Karnal', activeBatches: 26, fssaiCompliance: 'PASSED', description: 'Aged 1121 steam basmati rice, grain length avg 8.35mm, DNA authenticity verified.' },
  { id: '3', sku: 'SKU-OIL-003', name: 'Cold-Pressed Mustard Oil 1L', category: 'Oils & Fats', gtin: '8901030889235', shelfLife: '12 Months', facility: 'Alwar Cold-Press Unit #02', activeBatches: 14, fssaiCompliance: 'PASSED', description: 'Kachi Ghani cold-pressed mustard oil, erucic acid under regulatory limit, zero argemone oil.' },
  { id: '4', sku: 'SKU-PUL-004', name: 'Unpolished Toor Dal 1KG', category: 'Pulses', gtin: '8901030889242', shelfLife: '12 Months', facility: 'Latur Agri Co-Op Cluster', activeBatches: 18, fssaiCompliance: 'PASSED', description: 'Desi toor dal unpolished without leather/synthetic glaze, protein content > 22.4%.' },
  { id: '5', sku: 'SKU-HNY-005', name: 'Wild Forest Raw Honey 500g', category: 'Sweeteners', gtin: '8901030889259', shelfLife: '36 Months', facility: 'Himalayan Apiaries, HP', activeBatches: 8, fssaiCompliance: 'PASSED', description: 'Unfiltered raw forest honey, NMR spectroscopy tested for C4/C3 sugar adulteration.' },
  { id: '6', sku: 'SKU-PUL-006', name: 'Organic Chana Dal 1KG', category: 'Pulses', gtin: '8901030889266', shelfLife: '12 Months', facility: 'Indore Pulse Processing', activeBatches: 12, fssaiCompliance: 'RENEWAL_DUE', description: 'Certified organic split chickpea, undergoing annual aflatoxin lab validation.' },
];

export default function ProductsPage() {
  const [products] = useState<Product[]>(PRODUCTS_DATA);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(PRODUCTS_DATA[0]);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || p.gtin.includes(search);
    const matchCat = catFilter === 'ALL' || p.category === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className={styles.container}>
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className={styles.topBar}>
        <div className={styles.titleBlock}>
          <h1 className={styles.pageTitle}>Product Catalog & Master SKUs</h1>
          <p className={styles.pageSubtitle}>
            GTIN barcode registry, formulation shelf-life constraints, lab specifications, and active lot provenance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn--primary"
            onClick={() => alert('Simulating SKU Registration on Blockchain Catalog...')}
          >
            + Register New SKU
          </button>
        </div>
      </div>

      {/* ── Metrics Strip ──────────────────────────────────────── */}
      <div className={styles.metricsStrip}>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Total Catalog SKUs</span>
          <span className={styles.metricVal}>234</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>+2 registered this month</span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>In Production</span>
          <span className={styles.metricVal}>188</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>80.3% active production utilization</span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>FSSAI Compliant</span>
          <span className={styles.metricVal} style={{ color: 'var(--color-success)' }}>98.4%</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>All sensory assays certified</span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Assay Renewal Due</span>
          <span className={styles.metricVal} style={{ color: 'var(--color-warning)' }}>3</span>
          <span style={{ fontSize: '11px', color: 'var(--color-warning)' }}>Within 30 calendar days</span>
        </div>
      </div>

      {/* ── Filter Bar ────────────────────────────────────────── */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}>
            <IconSearch size={13} />
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by SKU, product name, or GTIN barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.chipGroup}>
          {(['ALL', 'Grains & Cereals', 'Pulses', 'Oils & Fats', 'Sweeteners'] as const).map((cat) => (
            <button
              key={cat}
              className={`${styles.filterBtn} ${catFilter === cat ? styles.filterBtnActive : ''}`}
              onClick={() => setCatFilter(cat)}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Dense Table ───────────────────────────────────────── */}
      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product SKU</th>
                <th>Product Description</th>
                <th>Category</th>
                <th>GTIN-13 Barcode</th>
                <th>Shelf Life</th>
                <th>Origin Processing Facility</th>
                <th>Active Batches</th>
                <th>Compliance State</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className={selectedProduct?.id === p.id ? styles.rowSelected : ''}
                >
                  <td>
                    <span className="mono-num" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {p.sku}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{p.category}</td>
                  <td>
                    <code className="badge badge--neutral mono-num">{p.gtin}</code>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{p.shelfLife}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{p.facility}</td>
                  <td className="mono-num" style={{ fontWeight: 600 }}>{p.activeBatches} batches</td>
                  <td>
                    {p.fssaiCompliance === 'PASSED' ? (
                      <span className="badge badge--success">✓ Passed</span>
                    ) : (
                      <span className="badge badge--warning">● Renewal Due</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Right-Side Detail Drawer ──────────────────────────── */}
      {selectedProduct && (
        <div className={styles.drawerBackdrop} onClick={() => setSelectedProduct(null)}>
          <div className={styles.drawerPanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  SKU Specification
                </span>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {selectedProduct.name}
                </h2>
                <span className="badge badge--neutral mono-num" style={{ marginTop: '4px' }}>
                  {selectedProduct.sku}
                </span>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="btn btn--ghost" style={{ padding: '4px' }}>
                <IconClose size={16} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              {/* Formulation Description */}
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Product Formulation & Quality Parameters
                </span>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
                  {selectedProduct.description}
                </p>
              </div>

              {/* Data Grid */}
              <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>GTIN-13 Barcode</div>
                  <div className="mono-num" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedProduct.gtin}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Category</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedProduct.category}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Shelf Life Limit</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedProduct.shelfLife}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Primary Plant</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedProduct.facility}</div>
                </div>
              </div>

              {/* Barcode Vector Preview */}
              <div style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>GS1 Compliant EAN/GTIN-13 Barcode Vector</span>
                {/* SVG Barcode */}
                <svg width="220" height="50" viewBox="0 0 220 50">
                  <rect x="10" y="5" width="2" height="35" fill="#0F172A" />
                  <rect x="14" y="5" width="1" height="35" fill="#0F172A" />
                  <rect x="18" y="5" width="3" height="35" fill="#0F172A" />
                  <rect x="24" y="5" width="1" height="35" fill="#0F172A" />
                  <rect x="28" y="5" width="2" height="35" fill="#0F172A" />
                  <rect x="34" y="5" width="4" height="35" fill="#0F172A" />
                  <rect x="42" y="5" width="1" height="35" fill="#0F172A" />
                  <rect x="46" y="5" width="3" height="35" fill="#0F172A" />
                  <rect x="52" y="5" width="2" height="35" fill="#0F172A" />
                  <rect x="58" y="5" width="1" height="35" fill="#0F172A" />
                  <rect x="64" y="5" width="3" height="35" fill="#0F172A" />
                  <rect x="70" y="5" width="2" height="35" fill="#0F172A" />
                  <rect x="76" y="5" width="1" height="35" fill="#0F172A" />
                  <rect x="82" y="5" width="4" height="35" fill="#0F172A" />
                  <rect x="90" y="5" width="2" height="35" fill="#0F172A" />
                  <rect x="96" y="5" width="1" height="35" fill="#0F172A" />
                  <rect x="102" y="5" width="3" height="35" fill="#0F172A" />
                  <rect x="108" y="5" width="2" height="35" fill="#0F172A" />
                  <rect x="114" y="5" width="1" height="35" fill="#0F172A" />
                  <rect x="120" y="5" width="3" height="35" fill="#0F172A" />
                  <rect x="128" y="5" width="2" height="35" fill="#0F172A" />
                  <rect x="134" y="5" width="4" height="35" fill="#0F172A" />
                  <rect x="142" y="5" width="1" height="35" fill="#0F172A" />
                  <rect x="148" y="5" width="2" height="35" fill="#0F172A" />
                  <rect x="154" y="5" width="3" height="35" fill="#0F172A" />
                  <rect x="162" y="5" width="1" height="35" fill="#0F172A" />
                  <rect x="168" y="5" width="2" height="35" fill="#0F172A" />
                  <rect x="174" y="5" width="3" height="35" fill="#0F172A" />
                  <rect x="182" y="5" width="1" height="35" fill="#0F172A" />
                  <rect x="188" y="5" width="2" height="35" fill="#0F172A" />
                  <rect x="194" y="5" width="3" height="35" fill="#0F172A" />
                  <text x="110" y="47" fontSize="9" fontFamily="monospace" textAnchor="middle" fill="#0F172A">{selectedProduct.gtin}</text>
                </svg>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                <Link
                  href="/dashboard/batches"
                  className="btn btn--secondary"
                  style={{ flex: 1 }}
                >
                  View Active Batches ({selectedProduct.activeBatches})
                </Link>
                <button
                  className="btn btn--primary"
                  style={{ flex: 1 }}
                  onClick={() => alert(`Downloaded GS1 Label Specs for ${selectedProduct.sku}`)}
                >
                  Download Label Spec
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
