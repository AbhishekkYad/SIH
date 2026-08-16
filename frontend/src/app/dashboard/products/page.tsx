'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { fetchProducts } from '@/lib/api';

const INITIAL_PRODUCTS = [
  { id: 'PROD-8801', name: 'Organic Sharbati Wheat Flour 5KG', category: 'Packaged Goods', gtin: '8901234567890', manufacturer: 'Sahyadri Agro Processing', date: '10 Aug 2026' },
  { id: 'PROD-8802', name: 'Cold Pressed Mustard Oil 1L', category: 'Edible Oils', gtin: '8901234567891', manufacturer: 'Sahyadri Agro Processing', date: '12 Aug 2026' },
  { id: 'PROD-8803', name: 'Pure Himalayan Honey 500g', category: 'Natural Sweeteners', gtin: '8901234567892', manufacturer: 'Himalayan Apiaries Cluster', date: '14 Aug 2026' },
];

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await fetchProducts();
      if (data && data.length > 0) {
        const formatted = data.map((p: any) => ({
          id: p.id || `PROD-${p.gtin.slice(-4)}`,
          name: p.name,
          category: p.category || 'Packaged Goods',
          gtin: p.gtin || '8901234567890',
          manufacturer: p.manufacturer || 'Sahyadri Agro',
          date: '16 Aug 2026'
        }));
        setProducts(formatted);
      }
    }
    loadData();
  }, []);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Packaged Goods',
    gtin: '890' + Math.floor(1000000000 + Math.random() * 9000000000),
    manufacturer: 'Sahyadri Agro Processing',
    shelfLife: '180',
    storage: 'Cool & Dry Place'
  });

  const handleRegisterProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newProd = {
      id: `PROD-${Math.floor(8804 + products.length)}`,
      name: formData.name,
      category: formData.category,
      gtin: formData.gtin,
      manufacturer: formData.manufacturer,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    setProducts([newProd, ...products]);
    setIsModalOpen(false);
    setFormData({
      name: '',
      category: 'Packaged Goods',
      gtin: '890' + Math.floor(1000000000 + Math.random() * 9000000000),
      manufacturer: 'Sahyadri Agro Processing',
      shelfLife: '180',
      storage: 'Cool & Dry Place'
    });
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.title}>Admin / Registered Product Master List</div>
      </div>

      <div className={styles.controls}>
        <input type="text" placeholder="Search registered products or GTIN..." className={styles.search} />
        <div className={styles.actions}>
          <button className="btn btn--grass" onClick={() => setIsModalOpen(true)} style={{ height: '40px' }}>
            + Register New Product
          </button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>GTIN / Barcode</th>
              <th>Manufacturer</th>
              <th>Date Registered</th>
              <th>Quick Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td style={{fontWeight: 600}}>{product.id}</td>
                <td style={{fontWeight: 700, color: 'var(--color-bean-400)'}}>{product.name}</td>
                <td><span className={styles.category}>{product.category}</span></td>
                <td><code style={{fontFamily: 'var(--font-mono)'}}>{product.gtin}</code></td>
                <td>{product.manufacturer}</td>
                <td>{product.date}</td>
                <td>
                  <button 
                    className="btn btn--outline" 
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => router.push('/dashboard/units')}
                  >
                    🖨️ Provision & Print Sheet
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Register Product Modal */}
      {isModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Register New Packaged Food SKU</h2>
              <button className={styles.modalClose} onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleRegisterProduct}>
              <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
                <label className={styles.formLabel}>Product / Commodity Name</label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  placeholder="e.g. Premium Cold Pressed Mustard Oil 1L"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required 
                />
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Category</label>
                  <select 
                    className={styles.formSelect}
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Packaged Goods">Packaged Goods / Flour</option>
                    <option value="Edible Oils">Edible Oils & Fats</option>
                    <option value="Dairy & Milk">Dairy & Milk Products</option>
                    <option value="Natural Sweeteners">Honey & Sweeteners</option>
                    <option value="Spices & Seasoning">Spices & Seasonings</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>GTIN / Barcode Number</label>
                  <input 
                    type="text" 
                    className={styles.formInput} 
                    value={formData.gtin}
                    onChange={e => setFormData({...formData, gtin: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Manufacturer / Brand</label>
                  <input 
                    type="text" 
                    className={styles.formInput} 
                    value={formData.manufacturer}
                    onChange={e => setFormData({...formData, manufacturer: e.target.value})}
                    required 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Shelf Life (Days)</label>
                  <input 
                    type="number" 
                    className={styles.formInput} 
                    value={formData.shelfLife}
                    onChange={e => setFormData({...formData, shelfLife: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className="btn btn--outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn--grass">+ Complete Registration</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
