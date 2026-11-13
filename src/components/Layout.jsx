import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  const location = useLocation();
  const path = location.pathname;
  const isLanding = path === '/';
  const appPaths = ['/dashboard', '/send', '/receive', '/wallet', '/history', '/track', '/withdraw', '/profile', '/admin'];
  const inAppShell = appPaths.some((p) => path === p || path.startsWith(`${p}/`));
  const isAuthPage = path === '/login' || path === '/register';

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <main className={`min-h-0 flex-1 ${isLanding || inAppShell || isAuthPage ? '' : 'p-4 sm:p-6'}`}>
        <Outlet />
      </main>
      {!inAppShell && <Footer />}
    </div>
  );
};

export default Layout;
