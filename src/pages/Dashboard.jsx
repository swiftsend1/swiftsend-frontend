import { Link } from 'react-router-dom';
import {
  ArrowDownToLine,
  BarChart3,
  CircleHelp,
  History,
  LayoutDashboard,
  MapPin,
  Send,
  ShieldCheck,
  UserRound,
  WalletCards,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const features = [
  { to: '/send', title: 'Send Money', desc: 'Create a new cross-border transfer with transparent quotes.', icon: Send, color: 'bg-sky-100 text-[#0284c7]' },
  { to: '/receive', title: 'Receive Money', desc: 'View receive options and payout details.', icon: ArrowDownToLine, color: 'bg-emerald-100 text-emerald-700' },
  { to: '/wallet', title: 'Wallet', desc: 'Manage balances and wallet-related actions.', icon: WalletCards, color: 'bg-indigo-100 text-indigo-700' },
  { to: '/history', title: 'Transaction History', desc: 'Review your remittances and past activity.', icon: History, color: 'bg-amber-100 text-amber-700' },
  { to: '/track', title: 'Track Transfer', desc: 'Check transfer status, progress, and evidence.', icon: MapPin, color: 'bg-rose-100 text-rose-700' },
  { to: '/withdraw', title: 'Withdraw', desc: 'Request withdrawals and manage payout destinations.', icon: WalletCards, color: 'bg-teal-100 text-teal-700' },
  { to: '/rates', title: 'Exchange Rates', desc: 'Check corridor pricing and currency rates.', icon: BarChart3, color: 'bg-cyan-100 text-cyan-700' },
  { to: '/profile', title: 'Profile', desc: 'View and manage your account details.', icon: UserRound, color: 'bg-slate-100 text-slate-700' },
  { to: '/help', title: 'Help Centre', desc: 'Get support, guidance, and answers.', icon: CircleHelp, color: 'bg-violet-100 text-violet-700' },
];

const getDisplayName = (user) => user?.name || user?.full_name || user?.first_name || user?.email?.split('@')[0] || 'there';
const isUserAdmin = (user, roles = []) => {
  if (user?.is_staff || user?.is_superuser) return true;
  const allRoles = [...roles, ...(Array.isArray(user?.roles) ? user.roles : [])];
  return allRoles.some((r) => typeof r === 'string' && ['admin', 'staff', 'superuser', 'administrator'].includes(r.toLowerCase()));
};

const Dashboard = () => {
  const { user, roles } = useAuth();
  const name = getDisplayName(user);
  const admin = isUserAdmin(user, roles);
  const allFeatures = admin
    ? [{ to: '/admin', title: 'Admin Dashboard', desc: 'Monitor users, remittances, and platform activity.', icon: LayoutDashboard, color: 'bg-[#0b1f4b] text-white' }, ...features]
    : features;

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0284c7]">Central dashboard</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#0b1f4b] sm:text-3xl">Welcome, {name}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Access all SwiftSend features from one place — send and receive money, manage your wallet, track transfers, review history, and get support.
            </p>
          </div>
          <Link to="/send" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0284c7] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-700/20 hover:bg-[#0369a1] sm:w-auto">
            <Send size={16} /> New transfer
          </Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Quick access</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">All app features in one hub</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Navigation</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">Use sidebar (desktop) or app menu (mobile)</p>
          </div>
          <div className="rounded-2xl bg-sky-50 p-4">
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0369a1]"><ShieldCheck size={13} /> Secure</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">Authenticated session active</p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold tracking-tight text-[#0b1f4b] sm:text-xl">All features</h2>
          <p className="text-xs font-medium text-slate-500 sm:text-sm">{allFeatures.length} available</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {allFeatures.map(({ to, title, desc, icon: Icon, color }) => (
            <Link key={to} to={to} className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md sm:p-5">
              <div className="flex items-start gap-4">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${color}`}><Icon size={20} /></span>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0369a1]">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{desc}</p>
                  <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[#0284c7]">Open →</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
