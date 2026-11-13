import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import {
  ArrowDownToLine,
  BarChart3,
  CircleHelp,
  History,
  Home,
  LayoutDashboard,
  LogOut,
  MapPin,
  Send,
  ShieldCheck,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Home, end: true },
  { to: '/send', label: 'Send Money', icon: Send },
  { to: '/receive', label: 'Receive Money', icon: ArrowDownToLine },
  { to: '/wallet', label: 'Wallet', icon: WalletCards },
  { to: '/history', label: 'History', icon: History },
  { to: '/track', label: 'Track Transfer', icon: MapPin },
  { to: '/withdraw', label: 'Withdraw', icon: WalletCards },
  { to: '/rates', label: 'Exchange Rates', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/help', label: 'Help Centre', icon: CircleHelp },
];

const adminItem = { to: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard };

const getDisplayName = (user) => user?.name || user?.full_name || user?.first_name || user?.email?.split('@')[0] || 'Account';
const isUserAdmin = (user, roles = []) => {
  if (user?.is_staff || user?.is_superuser) return true;
  const allRoles = [...roles, ...(Array.isArray(user?.roles) ? user.roles : [])];
  return allRoles.some((r) => typeof r === 'string' && ['admin', 'staff', 'superuser', 'administrator'].includes(r.toLowerCase()));
};

const SidebarContent = ({ onNavigate, showClose = false, onClose }) => {
  const { user, roles, signOut } = useAuth();
  const items = isUserAdmin(user, roles) ? [...navItems, adminItem] : navItems;

  return (
    <div className="flex h-full flex-col bg-stellar-black text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
        <div>
          <p className="text-sm font-bold tracking-tight">SwiftSend App</p>
          <p className="mt-0.5 text-xs text-stellar-gray">Powered by Stellar-inspired flows</p>
        </div>
        {showClose && (
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-slate-200 hover:bg-white/10" aria-label="Close menu">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-sky-200"><UserRound size={18} /></span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{getDisplayName(user)}</p>
            <p className="truncate text-xs text-slate-300">{user?.email || 'Signed in'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="App navigation">
        <ul className="space-y-1">
          {items.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-stellar-yellow text-stellar-black shadow-lg shadow-yellow-900/20' : 'text-slate-200 hover:bg-white/10 hover:text-white'}`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="mb-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
          <p className="inline-flex items-center gap-1.5 font-semibold text-stellar-yellow"><ShieldCheck size={13} /> Secure session</p>
          <p className="mt-1">Manage transfers, wallet, tracking, and account from one place.</p>
        </div>
        <button type="button" onClick={async () => { await signOut(); onNavigate?.(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white">
          <LogOut size={18} /> Log out
        </button>
      </div>
    </div>
  );
};

SidebarContent.propTypes = {
  onNavigate: PropTypes.func,
  showClose: PropTypes.bool,
  onClose: PropTypes.func,
};

const AppSidebar = ({ mobileOpen, onMobileClose }) => (
  <>
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-stellar-black lg:sticky lg:top-[76px] lg:block lg:h-[calc(100vh-76px)]">
      <SidebarContent />
    </aside>

    {mobileOpen && (
      <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label="App menu">
        <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]" onClick={onMobileClose} aria-label="Close app menu overlay" />
        <div className="absolute inset-y-0 left-0 w-[86%] max-w-[320px] shadow-2xl">
          <SidebarContent showClose onClose={onMobileClose} onNavigate={onMobileClose} />
        </div>
      </div>
    )}
  </>
);

AppSidebar.propTypes = {
  mobileOpen: PropTypes.bool,
  onMobileClose: PropTypes.func,
};

export default AppSidebar;
