import { Link } from 'react-router-dom';

const Footer = () => {
  const links = [
    { to: '/send', label: 'Send money' },
    { to: '/receive', label: 'Receive money' },
    { to: '/rates', label: 'Exchange rates' },
    { to: '/track', label: 'Track a transfer' },
    { to: '/help', label: 'Help centre' },
    { to: '/login', label: 'Log in' },
    { to: '/register', label: 'Create account' },
  ];

  return (
    <footer className="border-t border-[#e1e1dc] bg-[#f5f5f2] px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-6 sm:gap-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="inline-flex items-center gap-2.5" aria-label="SwiftSend home">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#161616]">
              <span className="relative block h-3.5 w-4">
                <i aria-hidden="true" className="absolute left-0 top-1 block h-1.5 w-3 rounded-full bg-white" />
                <i aria-hidden="true" className="absolute right-0 top-3 block h-1.5 w-4 rounded-full bg-[#e3bb49]" />
              </span>
            </span>
            <span className="text-base font-black tracking-[-0.04em] text-[#161616]">SwiftSend</span>
          </Link>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-[#77776f]" aria-label="Footer navigation">
            {links.map((link) => <Link key={link.to} to={link.to} className="transition hover:text-[#161616]">{link.label}</Link>)}
          </nav>
        </div>
        <div className="flex flex-col gap-2 border-t border-[#e1e1dc] pt-5 text-[11px] font-semibold text-[#999991] sm:flex-row sm:items-center sm:justify-between">
          <p>Move money simply.</p>
          <p>&copy; {new Date().getFullYear()} SwiftSend</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
