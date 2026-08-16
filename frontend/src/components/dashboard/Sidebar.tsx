import Link from 'next/link';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div style={{width: 24, height: 24, borderRadius: '50%', backgroundColor: 'var(--color-grass-200)'}}></div>
        Food Traze
      </div>
      <nav className={styles.nav}>
        <Link href="/dashboard" className={styles.navItem}>
          Dashboard
        </Link>
        <Link href="/dashboard/products" className={styles.navItem}>
          Products
        </Link>
        <Link href="/dashboard/batches" className={styles.navItem}>
          Batches
        </Link>
        <Link href="/dashboard/units" className={styles.navItem}>
          Units
        </Link>
        <Link href="/dashboard/incidents" className={styles.navItem}>
          Incidents
        </Link>
        <Link href="/dashboard/recall" className={styles.navItem}>
          Risk & Recalls
        </Link>
        <Link href="/dashboard/regulator" className={styles.navItem}>
          Regulator
        </Link>
        <Link href="/dashboard/admin" className={styles.navItem}>
          Admin Panel
        </Link>
      </nav>
    </aside>
  );
}
