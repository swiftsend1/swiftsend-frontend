import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, CircleHelp, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const Navbar = () => {
  const { isAuthenticated, signOut, user } = useAuth();
  const location = useLocation();
  const appPaths = ['/dashboard', '/send', '/receive', '/wallet', '/history', '/track', '/withdraw', '/profile', '/admin'];
  const inApp = isAuthenticated && appPaths.some((p) => location.pathname === p || location.pathname.startsWith(`${p}/`));

  return (
    <header className="sticky top-0 z-[70] border-b border-white/40 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 dark:border-slate-800/70 dark:bg-slate-950/80">
      <nav className="mx-auto flex h-[76px] max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Primary navigation">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="group flex shrink-0 items-center gap-2.5" aria-label="SwiftSend home">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#0b1f4b] to-[#0284c7] shadow-lg shadow-sky-900/20 transition group-hover:scale-105">
            <span className="relative block h-4 w-5">
              <i aria-hidden="true" className="absolute left-0 top-1 block h-1.5 w-4 rounded-full bg-white" />
              <i aria-hidden="true" className="absolute right-0 top-4 block h-1.5 w-5 rounded-full bg-[#7dd3fc]" />
            </span>
          </span>
          <span className="text-xl font-bold tracking-[-0.04em] text-[#0b1f4b] dark:text-white">SwiftSend</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {!inApp && (
            <>
              <Link to="/rates" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:text-[#0b1f4b] sm:inline-flex dark:text-slate-200 dark:hover:text-white">Pricing</Link>
              <Link to="/help" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:text-[#0b1f4b] dark:text-slate-200 dark:hover:text-white">
                <CircleHelp size={16} className="hidden sm:block" /> Help
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <>
              {!inApp && (
                <Link to="/dashboard" className="hidden items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:inline-flex dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
              )}
              <span className="hidden max-w-[160px] truncate text-sm font-semibold text-slate-700 lg:block dark:text-slate-200">{user?.name || user?.email || 'Account'}</span>
              <button type="button" onClick={() => signOut()} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="Log out">
                <LogOut size={16} /> <span className="hidden sm:inline">Log out</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">Log in</Link>
              <Link to="/register" className="inline-flex items-center gap-1.5 rounded-xl bg-[#0284c7] px-3.5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-700/20 transition hover:bg-[#0369a1] sm:px-4">
                Get Started <ArrowUpRight size={15} className="hidden sm:block" />
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
