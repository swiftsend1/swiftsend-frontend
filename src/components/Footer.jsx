import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#161616] px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-5">
        <div className="flex items-center justify-between gap-5">
          <Link to="/" className="inline-flex items-center gap-2.5" aria-label="SwiftSend home">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#e3bb49]">
              <span className="relative block h-3.5 w-4">
                <i aria-hidden="true" className="absolute left-0 top-1 block h-1.5 w-3 rounded-full bg-[#161616]" />
                <i aria-hidden="true" className="absolute right-0 top-3 block h-1.5 w-4 rounded-full bg-[#161616]" />
              </span>
            </span>
            <span className="text-base font-black tracking-[-0.04em] text-white">SwiftSend</span>
          </Link>
          <Link to="/help" className="text-xs font-bold text-white/60 transition hover:text-[#e3bb49]">Help centre</Link>
        </div>
        <div className="flex flex-col gap-2 border-t border-white/10 pt-5 text-[11px] font-semibold text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>Move money simply.</p>
          <p>&copy; {new Date().getFullYear()} SwiftSend</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
