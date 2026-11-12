import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <main className={`min-h-0 flex-1 ${isLanding ? '' : 'p-4 sm:p-6'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
