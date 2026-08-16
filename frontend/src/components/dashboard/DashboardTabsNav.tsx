'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './DashboardTabsNav.module.css';

const TABS = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'Products', href: '/dashboard/products' },
  { label: 'Batches', href: '/dashboard/batches' },
  { label: 'Units & QRs', href: '/dashboard/units' },
  { label: 'Recalls', href: '/dashboard/recall' },
  { label: 'Incidents', href: '/dashboard/incidents' },
  { label: 'Regulator', href: '/dashboard/regulator' },
  { label: 'Admin', href: '/dashboard/admin' },
];

export default function DashboardTabsNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.tabsContainer}>
      {TABS.map((tab) => {
        const isActive = tab.href === '/dashboard' 
          ? pathname === '/dashboard'
          : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
