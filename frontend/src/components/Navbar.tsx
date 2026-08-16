'use client';
import { useEffect, useState } from 'react';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { label: 'Ecosystem',     href: '#mission' },
  { label: 'Solutions',     href: '#solutions' },
  { label: 'Stakeholders',  href: '#stakeholders' },
  { label: 'Knowledge',     href: '#knowledge' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchResult(`Found verified on-chain record for "${searchQuery}" committed to Nashik & Pune Hubs.`);
  };

  const handleQuickTag = (tag: string) => {
    setSearchQuery(tag);
    setSearchResult(`Found verified batch "${tag}" with 6 cryptographic custody checkpoint commits.`);
  };

  return (
    <>
      <header className={`${styles.siteHeader} ${scrolled ? styles.scrolled : ''}`}>
        <div className={`container ${styles.inner}`}>
          {/* ── Brand ── */}
          <a href="#" className={styles.brand} aria-label="FoodTrace Home">
            <span className={styles.brandIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </span>
            <span className={styles.brandName}>
              FoodTrace<span className={styles.brandDot}>.</span>
            </span>
          </a>

          {/* ── Center Navigation ── */}
          <nav className={styles.centerNav} aria-label="Primary">
            <div className={styles.navPill}>
              {NAV_LINKS.map((link) => (
                <a key={link.label} href={link.href} className={styles.navLink}>
                  {link.label}
                </a>
              ))}
            </div>
          </nav>

          {/* ── Right Actions ── */}
          <div className={styles.actions}>
            <button
              className={styles.searchTrigger}
              type="button"
              aria-label="Search batch provenance"
              onClick={() => setSearchOpen(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span className={styles.searchLabel}>Search</span>
            </button>

            <a href="#solutions" className={styles.ctaBtn}>
              Launch Platform
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>

            {/* Mobile Toggle */}
            <button
              className={styles.mobileToggle}
              type="button"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <span className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ''}`}>
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Search Modal ── */}
      {searchOpen && (
        <div className={styles.searchBackdrop} onClick={() => setSearchOpen(false)}>
          <div className={styles.searchDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.searchDialogHead}>
              <h3 className={styles.searchDialogTitle}>Trace a Batch or Asset</h3>
              <button
                className={styles.closeBtn}
                type="button"
                onClick={() => { setSearchOpen(false); setSearchResult(null); }}
                aria-label="Close search"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSearch}>
              <div className={styles.searchInputWrap}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7E8A7F" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Enter Batch ID (e.g. WF-2026-0815) or Crop..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button type="submit" className={styles.verifyBtn}>
                  Verify
                </button>
              </div>
            </form>

            <div className={styles.quickTags}>
              <span className={styles.quickTagLabel}>Try quick samples:</span>
              {[
                { id: 'WF-2026-0815', label: 'WF-2026-0815 (Sharbati Wheat)' },
                { id: 'LOT-MH-402', label: 'LOT-MH-402 (Nashik Organic)' },
                { id: 'CHANA-2026-PUNE', label: 'CHANA-2026-PUNE' },
              ].map((tag) => (
                <button key={tag.id} className={styles.quickTagBtn} onClick={() => handleQuickTag(tag.id)}>
                  {tag.label}
                </button>
              ))}
            </div>

            {searchResult && (
              <div className={styles.searchResultCard}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>{searchResult}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobileOpen(false)}>
          <div className={styles.mobileDrawer} onClick={(e) => e.stopPropagation()}>
            <nav className={styles.mobileNav}>
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={styles.mobileNavLink}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <a
              href="#solutions"
              className={styles.ctaBtn}
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setMobileOpen(false)}
            >
              Launch Platform →
            </a>
          </div>
        </div>
      )}
    </>
  );
}
    </>
  );
}
