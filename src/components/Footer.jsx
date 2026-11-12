import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Globe2, ShieldCheck } from 'lucide-react';

const countries = [
  { flag: '🇰🇪', name: 'Kenya', currency: 'KES' },
  { flag: '🇺🇬', name: 'Uganda', currency: 'UGX' },
  { flag: '🇳🇬', name: 'Nigeria', currency: 'NGN' },
  { flag: '🇬🇭', name: 'Ghana', currency: 'GHS' },
  { flag: '🇺🇸', name: 'United States', currency: 'USD' },
  { flag: '🇬🇧', name: 'United Kingdom', currency: 'GBP' },
];

const Footer = () => {
  const [selected, setSelected] = useState(countries[0]);

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5" aria-label="SwiftSend home">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#0b1f4b] to-[#0284c7]">
                <span className="relative block h-4 w-5">
                  <i aria-hidden="true" className="absolute left-0 top-1 block h-1.5 w-4 rounded-full bg-white" />
                  <i aria-hidden="true" className="absolute right-0 top-4 block h-1.5 w-5 rounded-full bg-[#7dd3fc]" />
                </span>
              </span>
              <span className="text-lg font-bold tracking-[-0.04em] text-[#0b1f4b] dark:text-white">SwiftSend</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-400">
              Modern B2B/B2C remittance infrastructure for fast, compliant, and transparent cross-border payments.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1.5 text-[#0369a1] dark:bg-slate-800 dark:text-sky-300"><ShieldCheck size={13} /> Secure by design</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1.5 dark:bg-slate-800"><Globe2 size={13} /> Built for borders</span>
            </div>
            <div className="mt-6">
              <label htmlFor="country-currency" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Country & currency</label>
              <div className="mt-2 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <span className="text-lg" aria-hidden="true">{selected.flag}</span>
                <select
                  id="country-currency"
                  value={selected.currency}
                  onChange={(e) => setSelected(countries.find((c) => c.currency === e.target.value) || countries[0])}
                  className="bg-transparent text-sm font-semibold text-slate-800 outline-none dark:text-slate-100"
                >
                  {countries.map((c) => (
                    <option key={c.currency} value={c.currency} className="text-slate-900">{c.name} ({c.currency})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-[#0b1f4b] dark:text-white">Products</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li><Link className="transition hover:text-[#0284c7]" to="/send">Cross-border transfers</Link></li>
              <li><Link className="transition hover:text-[#0284c7]" to="/receive">Collections & payouts</Link></li>
              <li><Link className="transition hover:text-[#0284c7]" to="/rates">FX & pricing</Link></li>
              <li><Link className="transition hover:text-[#0284c7]" to="/track">Transfer tracking</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold text-[#0b1f4b] dark:text-white">Solutions</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li><Link className="transition hover:text-[#0284c7]" to="/help">USSD & offline access</Link></li>
              <li><Link className="transition hover:text-[#0284c7]" to="/wallet">Mobile money</Link></li>
              <li><Link className="transition hover:text-[#0284c7]" to="/withdraw">Bank payouts</Link></li>
              <li><Link className="transition hover:text-[#0284c7]" to="/dashboard">Business dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold text-[#0b1f4b] dark:text-white">Company & Support</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li><Link className="transition hover:text-[#0284c7]" to="/">About</Link></li>
              <li><Link className="transition hover:text-[#0284c7]" to="/help">Help centre</Link></li>
              <li><Link className="transition hover:text-[#0284c7]" to="/login">Log in</Link></li>
              <li><Link className="transition hover:text-[#0284c7]" to="/register">Get started</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-100 pt-6 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} SwiftSend. All rights reserved. Trusted payments for people and businesses.</p>
          <Link to="/help" className="inline-flex items-center gap-1 font-semibold text-[#0284c7] transition hover:text-[#0369a1]">Security & compliance <ArrowUpRight size={13} /></Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
