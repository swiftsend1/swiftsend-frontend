import { Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const AdminLayout = () => {
  const { user, signOut } = useAuth();
  const name = user?.name || user?.email || 'Admin';

  return (
    <div className="min-h-screen bg-stellar-offwhite text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link to="/admin" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-stellar-black text-stellar-yellow shadow-sm"><LayoutDashboard size={18} /></span>
            <div className="leading-tight">
              <p className="text-sm font-extrabold tracking-tight text-stellar-black">SwiftSend Admin</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-stellar-teal">Operations Console</p>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-stellar-black">{name}</p>
              <p className="inline-flex items-center gap-1 text-xs text-slate-500"><ShieldCheck size={12} className="text-stellar-teal" /> Admin session</p>
            </div>
            <Link to="/dashboard" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">User app</Link>
            <button type="button" onClick={() => signOut()} className="inline-flex items-center gap-2 rounded-xl bg-stellar-black px-3 py-2 text-sm font-semibold text-white hover:bg-swift-navy">
              <LogOut size={15} /> <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
