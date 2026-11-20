import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, Search, Bell } from 'lucide-react';
import AppSidebar from './AppSidebar';
import DarkModeToggle from './DarkModeToggle';

const pageTitles = {
  '/dashboard': ['Overview', 'A clear view of your money movement.'],
  '/send': ['Send money', 'Move money across borders with clarity and confidence.'],
  '/receive': ['Receive money', 'Manage incoming transfers and payment details.'],
  '/wallet': ['My wallet', 'Your wallet activity and available funds.'],
  '/history': ['Transactions', 'Every transfer, in one place.'],
  '/track': ['Track a transfer', 'Follow your transfer from initiation to delivery.'],
  '/withdraw': ['Withdraw funds', 'Move available funds to your preferred destination.'],
  '/profile': ['Your profile', 'Manage your personal details and preferences.'],
  '/anchor-demo': ['Technology showcase', 'Explore how SwiftSend uses Stellar technology.'],
};

const AppShell = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [title, subtitle] = pageTitles[location.pathname] || ['Your account', 'Welcome back to SwiftSend.'];

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);

  return (
    <div className="ss-page min-h-[calc(100vh-76px)]" style={{ background: 'var(--page)' }}>
      <div className="mx-auto flex max-w-[1600px]">
        <AppSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <div className="min-w-0 flex-1">
          <div className="sticky top-[76px] z-30 flex items-center justify-between border-b px-4 py-3 backdrop-blur-xl sm:px-6 lg:hidden"
            style={{ background: 'color-mix(in srgb, var(--surface) 92%, transparent)', borderColor: 'var(--border)' }}>
            <button type="button" onClick={() => setMobileOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }} aria-label="Open app menu">
              <Menu size={18} /> Menu
            </button>
            <DarkModeToggle compact />
          </div>

          <div className="flex items-center justify-between gap-4 border-b px-5 py-5 sm:px-7 lg:px-10"
            style={{ borderColor: 'var(--border)' }}>
            <div className="min-w-0">
              <p className="mb-1 text-xs font-bold uppercase tracking-[.16em]" style={{ color: 'var(--accent)' }}>SwiftSend workspace</p>
              <h1 className="ss-title text-2xl font-extrabold sm:text-[28px]">{title}</h1>
              <p className="ss-copy mt-1 hidden text-sm sm:block">{subtitle}</p>
            </div>
            <div className="hidden items-center gap-2 lg:flex">
              <button type="button" className="grid h-10 w-10 place-items-center rounded-xl border"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'var(--surface)' }} aria-label="Search">
                <Search size={17} />
              </button>
              <button type="button" className="grid h-10 w-10 place-items-center rounded-xl border"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'var(--surface)' }} aria-label="Notifications">
                <Bell size={17} />
              </button>
              <DarkModeToggle compact />
            </div>
          </div>

          <main className="p-4 sm:p-6 lg:p-8 xl:px-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppShell;
