import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import {
  ArrowDownToLine, BarChart3, CircleHelp, History, Home, LayoutDashboard,
  Link2, LogOut, MapPin, Send, ShieldCheck, UserRound, WalletCards, X,
  Settings2,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import DarkModeToggle from './DarkModeToggle';

const sections = [
  { title: 'Workspace', items: [
    { to: '/dashboard', label: 'Overview', icon: Home, end: true },
    { to: '/send', label: 'Send money', icon: Send },
    { to: '/wallet', label: 'My wallet', icon: WalletCards },
    { to: '/history', label: 'Transactions', icon: History },
    { to: '/track', label: 'Track transfer', icon: MapPin },
  ]},
  { title: 'Manage', items: [
    { to: '/receive', label: 'Receive money', icon: ArrowDownToLine },
    { to: '/withdraw', label: 'Withdraw funds', icon: WalletCards },
    { to: '/rates', label: 'Exchange rates', icon: BarChart3 },
    { to: '/profile', label: 'Profile & settings', icon: Settings2 },
    { to: '/help', label: 'Help & support', icon: CircleHelp },
  ]},
  { title: 'Explore', items: [
    { to: '/anchor-demo', label: 'Stellar showcase', icon: Link2 },
  ]},
];

const adminItem = { to: '/admin', label: 'Admin dashboard', icon: LayoutDashboard };
const getDisplayName = (user) => user?.name || user?.full_name || user?.first_name || user?.email?.split('@')[0] || 'Account';
const isUserAdmin = (user, roles = []) => {
  if (user?.is_staff || user?.is_superuser) return true;
  const allRoles = [...roles, ...(Array.isArray(user?.roles) ? user.roles : [])];
  return allRoles.some((r) => typeof r === 'string' && ['admin', 'staff', 'superuser', 'administrator'].includes(r.toLowerCase()));
};

const SidebarContent = ({ onNavigate, showClose = false, onClose }) => {
  const { user, roles, signOut } = useAuth();
  const groups = isUserAdmin(user, roles)
    ? [...sections, { title: 'Administration', items: [adminItem] }]
    : sections;

  return (
    <div className="flex h-full flex-col" style={{ background: 'var(--surface)', color: 'var(--text)' }}>
      <div className="flex items-center justify-between border-b px-5 py-5" style={{ borderColor: 'var(--border)' }}>
        <a href="/dashboard" className="flex items-center gap-3" onClick={onNavigate}>
          <span className="grid h-10 w-10 place-items-center rounded-[14px] text-white shadow-lg" style={{ background: 'linear-gradient(145deg,#101d36,#0e9f91)' }}>
            <span className="relative block h-4 w-5"><i className="absolute left-0 top-1 block h-1.5 w-4 rounded-full bg-white" /><i className="absolute right-0 top-4 block h-1.5 w-5 rounded-full" style={{ background: '#efc45b' }} /></span>
          </span>
          <span><span className="block text-[17px] font-extrabold tracking-[-.04em]">SwiftSend</span><span className="block text-[10px] font-bold uppercase tracking-[.17em]" style={{ color: 'var(--muted)' }}>Money without borders</span></span>
        </a>
        {showClose && <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg" style={{ color: 'var(--muted)' }} aria-label="Close menu"><X size={18} /></button>}
      </div>

      <div className="mx-4 mt-5 rounded-2xl p-3.5" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full text-sm font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}>
            {getDisplayName(user).slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0"><p className="truncate text-sm font-bold">{getDisplayName(user)}</p><p className="truncate text-xs" style={{ color: 'var(--muted)' }}>{user?.email || 'Personal account'}</p></div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-5" aria-label="App navigation">
        {groups.map((group) => (
          <div key={group.title} className="mb-6">
            <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[.18em]" style={{ color: 'var(--muted)' }}>{group.title}</p>
            <ul className="space-y-1">
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink to={to} end={end} onClick={onNavigate}
                    className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all ${isActive ? 'shadow-sm' : 'hover:translate-x-[2px]'}`}
                    style={({ isActive }) => isActive
                      ? { background: 'var(--accent-soft)', color: 'var(--accent-strong)', boxShadow: 'inset 3px 0 0 var(--accent)' }
                      : { color: 'var(--muted)' }}>
                    <Icon size={17} strokeWidth={2.1} /><span>{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t px-4 py-4" style={{ borderColor: 'var(--border)' }}>
        <div className="mb-3 flex items-center justify-between rounded-xl px-2 py-2">
          <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Appearance</span>
          <DarkModeToggle compact />
        </div>
        <div className="mb-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs" style={{ background: 'var(--surface-muted)', color: 'var(--muted)' }}>
          <ShieldCheck size={15} style={{ color: 'var(--accent)' }} /><span>Secure account session</span>
        </div>
        <button type="button" onClick={async () => { await signOut(); onNavigate?.(); }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30">
          <LogOut size={17} /> Sign out
        </button>
      </div>
    </div>
  );
};

SidebarContent.propTypes = { onNavigate: PropTypes.func, showClose: PropTypes.bool, onClose: PropTypes.func };
const AppSidebar = ({ mobileOpen, onMobileClose }) => (
  <>
    <aside className="hidden w-[264px] shrink-0 border-r lg:sticky lg:top-[76px] lg:block lg:h-[calc(100vh-76px)]"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <SidebarContent />
    </aside>
    {mobileOpen && (
      <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label="App menu">
        <button type="button" className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={onMobileClose} aria-label="Close app menu overlay" />
        <div className="absolute inset-y-0 left-0 w-[86%] max-w-[320px] shadow-2xl"><SidebarContent showClose onClose={onMobileClose} onNavigate={onMobileClose} /></div>
      </div>
    )}
  </>
);
AppSidebar.propTypes = { mobileOpen: PropTypes.bool, onMobileClose: PropTypes.func };
export default AppSidebar;
