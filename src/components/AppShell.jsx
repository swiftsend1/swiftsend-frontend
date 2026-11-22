import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import AppSidebar from './AppSidebar';

const titles = {
  '/dashboard': ['Home', 'Your money, made simpler.'],
  '/send': ['Send money', 'Send across borders with confidence.'],
  '/receive': ['Receive money', 'Manage incoming transfers.'],
  '/wallet': ['Wallet', 'Your funds and wallet activity.'],
  '/history': ['Activity', 'Your recent money movement.'],
  '/track': ['Track transfer', 'Follow your transfer to delivery.'],
  '/withdraw': ['Withdraw', 'Move funds to your preferred destination.'],
  '/profile': ['Profile', 'Manage your account and preferences.'],
  '/anchor-demo': ['Technology showcase', 'Explore the technology behind SwiftSend.'],
  '/rates': ['Exchange rates', 'Explore indicative currency conversions.'],
  '/help': ['Help & support', 'Find answers about SwiftSend transfers.'],
};

export default function AppShell() {
  const { signOut } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [title, subtitle] = titles[location.pathname] || ['Your account', 'Welcome back to SwiftSend.'];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => { if (event.key === 'Escape') setMenuOpen(false); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className="ss-page min-h-screen" style={{ background: 'var(--page)' }}>
      <a href="#main-content" className="ss-skip-link">Skip to main content</a>

      <header className="glass-nav sticky top-0 z-40 flex h-16 items-center justify-between gap-3 px-4 shadow-sm sm:px-6 lg:px-8" aria-label="Dashboard navigation">
        <Link to="/dashboard" className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--surface-muted)]" aria-label="Go to dashboard home">
          <Home size={17} /> <span>Home</span>
        </Link>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setMenuOpen(true)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition hover:border-[var(--accent)] lg:hidden" aria-label="Open dashboard menu" aria-expanded={menuOpen} aria-controls="dashboard-mobile-menu">
            <Menu size={18} />
          </button>
          <button type="button" onClick={signOut} className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text)]" aria-label="Log out">
            <LogOut size={16} /> <span>Log out</span>
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        <AppSidebar />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-4 border-b px-4 py-5 sm:px-7 lg:px-10" style={{ borderColor: 'var(--border)' }}>
            <div className="min-w-0">
              <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[.18em]" style={{ color: 'var(--accent-strong)' }}>SWIFTSEND</p>
              <h1 className="ss-title text-2xl font-extrabold sm:text-[28px]">{title}</h1>
              <p className="ss-copy mt-1 hidden text-sm sm:block">{subtitle}</p>
            </div>
          </div>
          <main id="main-content" className="p-3.5 sm:p-6 lg:p-8 xl:px-10"><Outlet /></main>
        </div>
      </div>

      {menuOpen && <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true" aria-label="Dashboard menu">
        <button type="button" className="absolute inset-0 h-full w-full cursor-default bg-black/45" aria-label="Close dashboard menu" onClick={() => setMenuOpen(false)} />
        <div id="dashboard-mobile-menu" className="relative h-full max-w-[340px] shadow-2xl">
          <button type="button" onClick={() => setMenuOpen(false)} className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]" aria-label="Close dashboard menu"><X size={18} /></button>
          <AppSidebar mobile onClose={() => setMenuOpen(false)} />
        </div>
      </div>}
    </div>
  );
}
