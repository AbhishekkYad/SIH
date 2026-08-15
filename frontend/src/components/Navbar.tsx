'use client';
import { useEffect, useState } from 'react';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { label: 'Ecosystem',        href: '/#mission' },
  { label: 'Live Workflow',    href: '/#workflow' },
  { label: 'How We Do It',     href: '/#how-it-works' },
  { label: 'Why FoodTrace',    href: '/#why' },
  { label: 'Feedback Loop',    href: '/#feedback' },
  { label: 'We Track',         href: '/wetrack' },
  { label: 'Batch Explorer',   href: '/one-food' },
  { label: 'Knowledge & FAQ',  href: '/#knowledge' },
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
    setSearchResult(`Found verified on-chain batch record for "${searchQuery}" with 8 verified custody checkpoints.`);
  };

  const handleQuickTag = (tag: string) => {
    setSearchQuery(tag);
    setSearchResult(`Found verified batch "${tag}" with 8 cryptographic custody checkpoint commits.`);
  };

  return (
    <>
      <header className={`${styles.siteHeader} ${scrolled ? styles.scrolled : ''}`}>
        <div className={`container ${styles.inner}`}>
          {/* ── Brand ── */}
          <a href="/" className={styles.brand} aria-label="FoodTrace Home">
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

          {/* ── Center Navigation Links ── */}
          <nav className={styles.centerNav} aria-label="Primary">
            <div className={styles.navPill}>
              {NAV_LINKS.slice(0, 6).map((link) => (
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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span className={styles.searchLabel}>Verify Batch</span>
            </button>

            <a href="/one-food" className={styles.ctaBtn}>
              Explore Demo →
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

      {/* ── Search / Batch Verification Modal ── */}
      {searchOpen && (
        <div className={styles.searchBackdrop} onClick={() => setSearchOpen(false)}>
          <div className={styles.searchDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.searchDialogHead}>
              <div>
                <span className="eyebrow" style={{ margin: 0 }}>GS1 DIGITAL LINK RESOLVER</span>
                <h3 className={styles.searchDialogTitle}>Verify Food Batch Authenticity</h3>
              </div>
              <button
                className={styles.closeBtn}
                type="button"
                onClick={() => { setSearchOpen(false); setSearchResult(null); }}
                aria-label="Close search"
              >
                ✕
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
                  placeholder="Enter Batch ID (e.g. WF-2026-0815) or scan QR URI..."
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
              <span className={styles.quickTagLabel}>Verified on-chain samples:</span>
              {[
                { id: 'WF-2026-0815', label: 'WF-2026-0815 (Sharbati Wheat)' },
                { id: 'OAT-2026-NSK', label: 'OAT-2026-NSK (Organic Oats)' },
                { id: 'CHANA-MH-402', label: 'CHANA-MH-402 (Chickpeas)' },
              ].map((tag) => (
                <button key={tag.id} className={styles.quickTagBtn} onClick={() => handleQuickTag(tag.id)}>
                  {tag.label}
                </button>
              ))}
            </div>

            {searchResult && (
              <div className={styles.searchResultCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>✓</span>
                  <span>{searchResult}</span>
                </div>
                <a href="/one-food" className="btn btn--grass" style={{ marginTop: '12px', fontSize: '12px', padding: '6px 14px' }}>
                  Open Batch in Provenance Explorer →
                </a>
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
              href="/one-food"
              className={styles.ctaBtn}
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setMobileOpen(false)}
            >
              Explore Batch Demo →
            </a>
          </div>
        </div>
      )}
    </>
  );
}
