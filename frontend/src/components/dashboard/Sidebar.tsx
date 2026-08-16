'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import {
  BrandLogo,
  IconOverview,
  IconProducts,
  IconBatches,
  IconUnitsQR,
  IconIncidents,
  IconRecalls,
  IconRegulator,
  IconAdmin,
} from '@/components/icons/Icons';

export default function Sidebar() {
  const pathname = usePathname();
  const [activeRole, setActiveRole] = useState<string>('producer');

  useEffect(() => {
    const updateRole = () => {
      const stored = localStorage.getItem('foodtrace_active_role');
      if (stored) setActiveRole(stored);
    };

    updateRole();
    window.addEventListener('foodtrace_role_changed', updateRole);
    return () => window.removeEventListener('foodtrace_role_changed', updateRole);
  }, []);

  const isRouteActive = (route: string) => {
    if (route === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(route);
  };

  // Determine visible menu options based on active persona
  const showOperations = activeRole === 'admin' || activeRole === 'producer' || activeRole === 'retailer' || activeRole === 'logistics';
  const showProducts = activeRole === 'admin' || activeRole === 'producer';
  const showBatches = activeRole === 'admin' || activeRole === 'producer' || activeRole === 'retailer' || activeRole === 'logistics' || activeRole === 'qa';
  const showUnits = activeRole === 'admin' || activeRole === 'producer' || activeRole === 'retailer' || activeRole === 'logistics';

  const showRiskQuality = activeRole === 'admin' || activeRole === 'qa' || activeRole === 'retailer' || activeRole === 'regulator';
  const showIncidents = activeRole === 'admin' || activeRole === 'qa' || activeRole === 'retailer' || activeRole === 'regulator';
  const showRecalls = activeRole === 'admin' || activeRole === 'qa' || activeRole === 'regulator';

  const showGovernance = activeRole === 'admin' || activeRole === 'regulator';
  const showRegulator = activeRole === 'admin' || activeRole === 'regulator';
  const showAdmin = activeRole === 'admin';

  return (
    <aside className={styles.sidebar}>
      {/* Brand Header */}
      <Link href="/dashboard" className={styles.brandHeader}>
        <div className={styles.brandLogoBox}>
          <BrandLogo size={16} color="#FFFFFF" />
        </div>
        <div className={styles.brandTextGroup}>
          <span className={styles.brandTitle}>FoodTrace</span>
          <span className={styles.brandSub} style={{ textTransform: 'capitalize' }}>
            {activeRole} Workspace
          </span>
        </div>
      </Link>

      {/* Navigation Sections */}
      <nav className={styles.navContainer}>
        {/* OVERVIEW Link (Available to all personas) */}
        <div className={styles.navSection}>
          <div className={styles.sectionHeader}>Console</div>
          <Link
            href="/dashboard"
            className={`${styles.navItem} ${isRouteActive('/dashboard') ? styles.navItemActive : ''}`}
          >
            <span className={styles.navIcon}><IconOverview size={15} /></span>
            <span>Overview</span>
          </Link>
        </div>

        {/* OPERATIONS Group */}
        {showOperations && (
          <div className={styles.navSection}>
            <div className={styles.sectionHeader}>Operations</div>

            {showProducts && (
              <Link
                href="/dashboard/products"
                className={`${styles.navItem} ${isRouteActive('/dashboard/products') ? styles.navItemActive : ''}`}
              >
                <span className={styles.navIcon}><IconProducts size={15} /></span>
                <span>Products</span>
              </Link>
            )}

            {showBatches && (
              <Link
                href="/dashboard/batches"
                className={`${styles.navItem} ${isRouteActive('/dashboard/batches') ? styles.navItemActive : ''}`}
              >
                <span className={styles.navIcon}><IconBatches size={15} /></span>
                <span>Batches</span>
              </Link>
            )}

            {showUnits && (
              <Link
                href="/dashboard/units"
                className={`${styles.navItem} ${isRouteActive('/dashboard/units') ? styles.navItemActive : ''}`}
              >
                <span className={styles.navIcon}><IconUnitsQR size={15} /></span>
                <span>Units & QRs</span>
              </Link>
            )}
          </div>
        )}

        {/* RISK & QUALITY Group */}
        {showRiskQuality && (
          <div className={styles.navSection}>
            <div className={styles.sectionHeader}>Risk & Quality</div>

            {showIncidents && (
              <Link
                href="/dashboard/incidents"
                className={`${styles.navItem} ${isRouteActive('/dashboard/incidents') ? styles.navItemActive : ''}`}
              >
                <span className={styles.navIcon}><IconIncidents size={15} /></span>
                <span>Incidents</span>
                <span className={styles.navBadge}>2</span>
              </Link>
            )}

            {showRecalls && (
              <Link
                href="/dashboard/recall"
                className={`${styles.navItem} ${isRouteActive('/dashboard/recall') ? styles.navItemActive : ''}`}
              >
                <span className={styles.navIcon}><IconRecalls size={15} /></span>
                <span>Recalls</span>
              </Link>
            )}
          </div>
        )}

        {/* GOVERNANCE Group */}
        {showGovernance && (
          <div className={styles.navSection}>
            <div className={styles.sectionHeader}>Governance</div>

            {showRegulator && (
              <Link
                href="/dashboard/regulator"
                className={`${styles.navItem} ${isRouteActive('/dashboard/regulator') ? styles.navItemActive : ''}`}
              >
                <span className={styles.navIcon}><IconRegulator size={15} /></span>
                <span>Regulator</span>
              </Link>
            )}

            {showAdmin && (
              <Link
                href="/dashboard/admin"
                className={`${styles.navItem} ${isRouteActive('/dashboard/admin') ? styles.navItemActive : ''}`}
              >
                <span className={styles.navIcon}><IconAdmin size={15} /></span>
                <span>Admin</span>
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Footer Node Monitor */}
      <div className={styles.sidebarFooter}>
        <div className={styles.nodeStatusRow}>
          <span className={styles.statusDotGreen}></span>
          <span style={{ fontWeight: 600, color: '#0F172A' }}>Fabric Peer0</span>
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>3ms</span>
        </div>
      </div>
    </aside>
  );
}
