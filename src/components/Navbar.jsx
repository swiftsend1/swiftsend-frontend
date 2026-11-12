import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  ArrowDownToLine,
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  History,
  Home as HomeIcon,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Send,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const publicItems = [
  { to: '/', label: 'Home', description: 'A simpler way to move money', icon: HomeIcon, end: true },
  { to: '/send', label: 'Send money', description: 'Start a secure transfer', icon: Send },
  { to: '/receive', label: 'Receive money', description: 'Choose where it arrives', icon: ArrowDownToLine },
  { to: '/rates', label: 'Exchange rates', description: 'Check today’s rate', icon: BarChart3 },
  { to: '/track', label: 'Track a transfer', description: 'Follow your money', icon: MapPin },
  { to: '/help', label: 'Help centre', description: 'Find answers quickly', icon: CircleHelp },
];

const authenticatedItems = [
  { to: '/dashboard', label: 'Overview', description: 'Your SwiftSend dashboard', icon: HomeIcon, end: true },
  { to: '/send', label: 'Send money', description: 'Start a secure transfer', icon: Send },
  { to: '/receive', label: 'Receive money', description: 'Choose where it arrives', icon: ArrowDownToLine },
  { to: '/wallet', label: 'Wallet', description: 'Manage your balance', icon: WalletCards },
  { to: '/history', label: 'History', description: 'Review past transfers', icon: History },
  { to: '/track', label: 'Track a transfer', description: 'Follow your money', icon: MapPin },
  { to: '/withdraw', label: 'Withdraw', description: 'Cash out your balance', icon: WalletCards },
];

const adminItem = { to: '/admin', label: 'Admin Dashboard', description: 'Monitor users & transactions', icon: LayoutDashboard };

const getDisplayName = (user) => {
  const name = user?.name || user?.full_name || user?.first_name || user?.email?.split('@')[0];
  return name || 'your account';
};

const isUserAdmin = (user, roles = []) => {
  if (!user && roles.length === 0) return false;
  if (user?.is_staff || user?.is_superuser) return true;
  const allRoles = [...roles, ...(Array.isArray(user?.roles) ? user.roles : [])];
  return allRoles.some((r) => typeof r === 'string' && ['admin', 'staff', 'superuser', 'administrator'].includes(r.toLowerCase()));
};

const dropdowns = [
  {
    key: 'products',
    label: 'Products',
    items: [
      { to: '/send', label: 'Cross-border Transfers', desc: 'Fast payouts across corridors' },
      { to: '/receive', label: 'Collections', desc: 'Receive via mobile money & bank' },
      { to: '/rates', label: 'FX & Pricing', desc: 'Transparent live exchange rates' },
    ],
  },
  {
    key: 'solutions',
    label: 'Solutions',
    items: [
      { to: '/help', label: 'USSD & Offline', desc: 'Reach customers without smartphones' },
      { to: '/track', label: 'Tracking & Status', desc: 'End-to-end transfer visibility' },
      { to: '/dashboard', label: 'Business Tools', desc: 'Dashboards for operations teams' },
    ],
  },
  {
    key: 'company',
    label: 'Company',
    items: [
      { to: '/help', label: 'Help Centre', desc: 'Support and documentation' },
      { to: '/', label: 'About SwiftSend', desc: 'Trusted remittance infrastructure' },
    ],
  },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const { isAuthenticated, signOut, user, roles } = useAuth();
  const location = useLocation();
  const menuButtonRef = useRef(null);
  const panelRef = useRef(null);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setOpenDropdown(null);
  }, []);

  useEffect(() => {
    closeMenu();
  }, [closeMenu, location.pathname]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => { if (event.key === 'Escape') closeMenu(); };
    const closeOnDesktop = () => { if (window.innerWidth >= 1024) closeMenu(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', closeOnDesktop);
    panelRef.current?.querySelector('a, button')?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', closeOnDesktop);
    };
  }, [closeMenu, isOpen]);

  const handleSignOut = async () => {
    await signOut();
    closeMenu();
    menuButtonRef.current?.focus();
  };

  const baseItems = isAuthenticated ? authenticatedItems : publicItems;
  const items = isAuthenticated && isUserAdmin(user, roles) ? [...baseItems, adminItem] : baseItems;
  const displayName = getDisplayName(user);

  return (
    <header className="sticky top-0 z-[70] border-b border-white/40 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:border-slate-800/70 dark:bg-slate-950/70">
      <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Primary navigation">
        <Link to="/" className="group flex shrink-0 items-center gap-2.5" onClick={closeMenu} aria-label="SwiftSend home">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#0b1f4b] to-[#0284c7] shadow-lg shadow-sky-900/20 transition group-hover:scale-105">
            <span className="relative block h-4 w-5">
              <i aria-hidden="true" className="absolute left-0 top-1 block h-1.5 w-4 rounded-full bg-white" />
              <i aria-hidden="true" className="absolute right-0 top-4 block h-1.5 w-5 rounded-full bg-[#7dd3fc]" />
            </span>
          </span>
          <span className="text-xl font-bold tracking-[-0.04em] text-[#0b1f4b] dark:text-white">SwiftSend</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {dropdowns.map((dd) => (
            <div key={dd.key} className="relative" onMouseEnter={() => setOpenDropdown(dd.key)} onMouseLeave={() => setOpenDropdown(null)}>
              <button
                type="button"
                className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${openDropdown === dd.key ? 'text-[#0284c7]' : 'text-slate-700 hover:text-[#0b1f4b] dark:text-slate-200 dark:hover:text-white'}`}
                onClick={() => setOpenDropdown(openDropdown === dd.key ? null : dd.key)}
                aria-expanded={openDropdown === dd.key}
              >
                {dd.label} <ChevronDown size={15} className={`transition ${openDropdown === dd.key ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown === dd.key && (
                <div className="absolute left-0 top-full w-72 pt-2">
                  <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-2 shadow-xl shadow-slate-900/10 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
                    {dd.items.map((item) => (
                      <Link key={item.label} to={item.to} className="block rounded-xl px-3 py-2.5 transition hover:bg-sky-50 dark:hover:bg-slate-800" onClick={closeMenu}>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <Link to="/rates" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:text-[#0b1f4b] dark:text-slate-200 dark:hover:text-white">Pricing</Link>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">Dashboard</Link>
              <button type="button" onClick={handleSignOut} className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
                <LogOut size={16} /> <span className="hidden xl:inline">Log out</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">Log in</Link>
          )}
          <Link to="/register" className="inline-flex items-center gap-1.5 rounded-xl bg-[#0284c7] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-700/20 transition hover:-translate-y-0.5 hover:bg-[#0369a1]">
            Get Started <ArrowUpRight size={15} />
          </Link>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200/80 bg-white/70 px-3 text-sm font-semibold text-slate-800 transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 lg:hidden"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
        >
          <span className="hidden sm:inline">Menu</span>
          {isOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </nav>

      {isOpen && (
        <div id="mobile-navigation" className="fixed inset-x-0 bottom-0 top-[76px] z-[60] lg:hidden" role="dialog" aria-modal="true" aria-labelledby="mobile-navigation-title">
          <button type="button" className="absolute inset-0 cursor-default bg-slate-900/30 backdrop-blur-[2px]" onClick={closeMenu} aria-label="Close navigation menu" />
          <div ref={panelRef} className="absolute inset-x-3 top-3 max-h-[calc(100vh-100px)] overflow-y-auto rounded-3xl border border-slate-200 bg-white/95 p-3 shadow-[0_24px_70px_-18px_rgba(15,35,31,.35)] backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 sm:left-auto sm:right-5 sm:w-[420px]">
            <div className="flex items-center justify-between px-2 pb-3 pt-1">
              <div>
                <p id="mobile-navigation-title" className="text-base font-bold text-slate-950 dark:text-white">SwiftSend</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">B2B & B2C remittance infrastructure</p>
              </div>
              <button type="button" onClick={closeMenu} className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="Close navigation menu">
                <X size={19} />
              </button>
            </div>

            <div className="space-y-3 border-y border-slate-100 py-3 dark:border-slate-800">
              {dropdowns.map((dd) => (
                <div key={dd.key}>
                  <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{dd.label}</p>
                  <div className="mt-1 space-y-1">
                    {dd.items.map((item) => (
                      <Link key={item.label} to={item.to} onClick={closeMenu} className="block rounded-xl px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <nav className="space-y-1 pt-1" aria-label="Mobile navigation links">
                {items.slice(0, 6).map(({ to, label, description, icon: Icon, end }) => (
                  <MobileNavItem key={`${to}-${label}`} to={to} label={label} description={description} icon={<Icon size={18} />} end={end} onClick={closeMenu} />
                ))}
              </nav>
            </div>

            {isAuthenticated ? (
              <div className="mt-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/70">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0b1f4b] to-[#0284c7] text-white"><UserRound size={18} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{displayName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Signed in</p>
                  </div>
                  <button type="button" onClick={handleSignOut} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-white dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700" aria-label="Log out">
                    <LogOut size={17} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Link to="/login" onClick={closeMenu} className="rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Log in</Link>
                <Link to="/register" onClick={closeMenu} className="rounded-xl bg-[#0284c7] py-3 text-center text-sm font-semibold text-white shadow-lg shadow-sky-700/20 transition hover:bg-[#0369a1]">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

const MobileNavItem = ({ to, label, description, icon, end, onClick }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    className={({ isActive }) => `group flex items-center gap-3 rounded-2xl px-3 py-3 transition ${isActive ? 'bg-sky-50 text-[#0369a1] dark:bg-slate-800 dark:text-sky-300' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'}`}
  >
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-sky-100 group-hover:text-[#0369a1] dark:bg-slate-800 dark:text-slate-300">{icon}</span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-bold">{label}</span>
      <span className="mt-0.5 block text-xs font-medium text-slate-500 dark:text-slate-400">{description}</span>
    </span>
    <ChevronRight size={17} className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#0369a1] dark:text-slate-600" />
  </NavLink>
);

MobileNavItem.propTypes = {
  to: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  end: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

export default Navbar;
