import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, CircleHelp, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import DarkModeToggle from './DarkModeToggle';

const Navbar = () => {
  const { isAuthenticated, signOut, user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const appPaths = ['/dashboard', '/send', '/receive', '/wallet', '/history', '/track', '/withdraw', '/profile', '/admin'];
  const inApp = isAuthenticated && appPaths.some((p) => location.pathname === p || location.pathname.startsWith(`${p}/`));

  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [open]);

  const publicLinks = [
    { to: '/send', label: 'Send money' },
    { to: '/receive', label: 'Receive money' },
    { to: '/rates', label: 'Exchange rates' },
    { to: '/help', label: 'Help' },
  ];

  return (
    <header className="sticky top-0 z-[70] border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-[76px] max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8" aria-label="Primary navigation">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="group flex min-w-0 shrink-0 items-center gap-2.5" aria-label="SwiftSend home">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#171717] shadow-lg shadow-slate-900/30 transition group-hover:scale-105">
            <span className="relative block h-4 w-5">
              <i aria-hidden="true" className="absolute left-0 top-1 block h-1.5 w-4 rounded-full bg-white" />
              <i aria-hidden="true" className="absolute right-0 top-4 block h-1.5 w-5 rounded-full bg-stellar-yellow" />
            </span>
          </span>
          <span className="truncate text-xl font-bold tracking-[-0.04em] text-[var(--text)]">SwiftSend</span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <DarkModeToggle compact />
          {!inApp && (
            <>
              <div className="hidden items-center gap-1 sm:flex">
                {publicLinks.map((l) => (
                  <Link key={l.to} to={l.to} className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--text)]">{l.label}</Link>
                ))}
                {isAuthenticated && (
                  <>
                    <Link to="/dashboard" className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)]"><LayoutDashboard size={15} /> Overview</Link>
                    <Link to="/wallet" className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--text)]">Wallet</Link>
                  </>
                )}
              </div>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 sm:hidden dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                aria-controls="navbar-mobile-menu"
              >
                {open ? <X size={18} /> : <Menu size={18} />}
              </button>
            </>
          )}

          {isAuthenticated ? (
            <>
              <span className="hidden max-w-[140px] truncate text-sm font-semibold text-slate-700 lg:block dark:text-slate-200">{user?.name || user?.email || 'Account'}</span>
              <button type="button" onClick={() => signOut()} className="inline-flex h-10 items-center gap-2 rounded-xl px-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 sm:px-3 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="Log out">
                <LogOut size={16} /> <span className="hidden sm:inline">Log out</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-xl px-2.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:px-3 dark:text-slate-200 dark:hover:bg-slate-800">Log in</Link>
              <Link to="/register" className="inline-flex items-center gap-1.5 rounded-xl bg-[#171717] px-3 py-2.5 text-sm font-semibold text-white shadow-lg ring-1 ring-[#e4b638]/50 transition hover:bg-[#29251a] sm:px-4">
                <span className="hidden xs:inline sm:inline">Get started</span>
                <span className="sm:hidden">Start</span>
                <ArrowUpRight size={15} className="hidden text-[#e4b638] sm:block" />
              </Link>
            </>
          )}
        </div>
      </nav>

      {!inApp && open && (
        <div id="navbar-mobile-menu" className="border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:hidden dark:border-slate-800 dark:bg-slate-950/95">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-1">
            {publicLinks.map((l) => (
              <Link key={l.to} to={l.to} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link to="/dashboard" className="mt-1 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" onClick={() => setOpen(false)}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
            )}
            <Link to="/help" className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800" onClick={() => setOpen(false)}>
              <CircleHelp size={16} /> Support
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
