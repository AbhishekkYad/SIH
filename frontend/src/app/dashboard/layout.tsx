import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import DashboardTabsNav from '@/components/dashboard/DashboardTabsNav';
import styles from './layout.module.css';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <Header />
        <main className={styles.content}>
          <DashboardTabsNav />
          {children}
        </main>
      </div>
    </div>
  );
}
