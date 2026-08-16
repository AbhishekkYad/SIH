'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'manufacturer' | 'retailer' | 'distributor' | 'admin'>('manufacturer');
  const [email, setEmail] = useState('admin@foodtrace.com');
  const [password, setPassword] = useState('••••••••');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to stakeholder dashboard
    router.push('/dashboard');
  };

  return (
    <div className={styles.pageWrap}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.loginCard}>
          <div className={styles.header}>
            <span className={styles.badge}>Stakeholder Identity Portal</span>
            <h1 className={styles.title}>FoodTrace Login</h1>
            <p className={styles.subtitle}>Sign in to access your organization's supply chain network node.</p>
          </div>

          <div className={styles.roleSelector}>
            <button 
              type="button" 
              className={`${styles.roleBtn} ${role === 'manufacturer' ? styles.roleBtnActive : ''}`}
              onClick={() => setRole('manufacturer')}
            >
              Producer
            </button>
            <button 
              type="button" 
              className={`${styles.roleBtn} ${role === 'distributor' ? styles.roleBtnActive : ''}`}
              onClick={() => setRole('distributor')}
            >
              Distributor
            </button>
            <button 
              type="button" 
              className={`${styles.roleBtn} ${role === 'retailer' ? styles.roleBtnActive : ''}`}
              onClick={() => setRole('retailer')}
            >
              Retailer
            </button>
            <button 
              type="button" 
              className={`${styles.roleBtn} ${role === 'admin' ? styles.roleBtnActive : ''}`}
              onClick={() => setRole('admin')}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Organization Email</label>
              <input 
                type="email" 
                className={styles.input}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Access Key / Password</label>
              <input 
                type="password" 
                className={styles.input}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required 
              />
            </div>

            <button type="submit" className={styles.submitBtn}>
              Authenticate & Launch Dashboard →
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
