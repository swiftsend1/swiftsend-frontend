import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Building2,
  CheckCircle2,
  ChevronDown,
  Globe2,
  Landmark,
  LockKeyhole,
  PhoneCall,
  ShieldCheck,
  Smartphone,
  Timer,
  Wallet,
} from 'lucide-react';

const corridors = [
  { from: 'USD', to: 'KES', flag: '🇰🇪', country: 'Kenya', rate: 129.42, fee: 3.99 },
  { from: 'USD', to: 'UGX', flag: '🇺🇬', country: 'Uganda', rate: 3785.1, fee: 4.25 },
  { from: 'GBP', to: 'KES', flag: '🇰🇪', country: 'Kenya', rate: 165.08, fee: 2.99 },
  { from: 'EUR', to: 'NGN', flag: '🇳🇬', country: 'Nigeria', rate: 1624.5, fee: 3.49 },
];

const partners = ['Safaricom', 'MTN MoMo', 'Equity Bank', 'KCB Group', 'Airtel Money', 'Flutterwave'];

const heroImage = 'https://images.pexels.com/photos/7534791/pexels-photo-7534791.jpeg?auto=compress&cs=tinysrgb&w=1600';
const featureImgA = 'https://images.pexels.com/photos/37594379/pexels-photo-37594379.jpeg?auto=compress&cs=tinysrgb&w=1200';
const featureImgB = 'https://images.pexels.com/photos/6969802/pexels-photo-6969802.jpeg?auto=compress&cs=tinysrgb&w=1200';

const formatMoney = (value, max = 2) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: max }).format(Number.isFinite(value) ? value : 0);

const Home = () => {
  const [amount, setAmount] = useState('1000');
  const [corridorIndex, setCorridorIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStatsVisible(true), 150);
    return () => clearTimeout(t);
  }, []);

  const corridor = corridors[corridorIndex];
  const amountNumber = Number(String(amount).replace(/,/g, '')) || 0;
  const received = useMemo(() => amountNumber * corridor.rate, [amountNumber, corridor.rate]);
  const totalCost = useMemo(() => amountNumber + (amountNumber > 0 ? corridor.fee : 0), [amountNumber, corridor.fee]);

  return (
    <div className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* (1) Hero */}
      <section className="relative overflow-hidden border-b border-slate-200/70">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="h-full w-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-slate-950/55" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1f4b]/90 via-[#0b1f4b]/70 to-slate-900/40" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:px-8 lg:pb-20 lg:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-12">
            <div className="text-center lg:text-left">
              <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-sky-100 shadow-sm backdrop-blur sm:text-xs">
                <BadgeCheck size={14} className="shrink-0 text-sky-300" /> <span className="truncate sm:whitespace-normal">SwiftSend — Connecting Africa to the World</span>
              </div>
              <h1 className="mt-5 text-[2rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-white sm:mt-6 sm:text-5xl lg:text-6xl">
                Connecting Africa to the world, one transfer at a time.
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-200 sm:mt-5 sm:text-lg sm:leading-8 lg:mx-0">
                SwiftSend is a global remittance platform built to connect Africa with the world — starting in Kenya, expanding across East Africa, and ultimately reaching the rest of the world. We make sending and receiving money across borders faster, simpler, more affordable, and more transparent through modern payment technologies, Stellar blockchain infrastructure, and accessible channels like web and USSD.
              </p>
              <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:mt-8 sm:flex-row lg:justify-start">
                <Link to="/register" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0284c7] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-900/30 transition hover:-translate-y-0.5 hover:bg-[#0369a1] sm:w-auto">
                  Get Started <ArrowUpRight size={17} />
                </Link>
                <Link to="/help" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 sm:w-auto">
                  Learn more <ArrowRight size={17} />
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-slate-200 lg:justify-start">
                <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-sky-300" /> Fast & transparent transfers</span>
                <span className="inline-flex items-center gap-1.5"><Timer size={14} className="text-sky-300" /> Web & USSD access</span>
                <span className="inline-flex items-center gap-1.5"><Globe2 size={14} className="text-sky-300" /> Kenya to the world</span>
              </div>
            </div>

            {/* Live remittance exchange rate calculator widget */}
            <div className="w-full">
              <div className="rounded-3xl border border-white/20 bg-white/95 p-4 shadow-[0_30px_80px_-30px_rgba(2,6,23,.6)] backdrop-blur sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                <div className="flex-1">
                  <label htmlFor="hero-send-amount" className="block text-xs font-bold uppercase tracking-wider text-slate-500">You send</label>
                  <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[#0284c7] focus-within:bg-white focus-within:ring-4 focus-within:ring-sky-100">
                    <span className="mr-2 text-sm font-bold text-slate-500">{corridor.from}</span>
                    <input
                      id="hero-send-amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                      inputMode="decimal"
                      className="w-full min-w-0 bg-transparent text-xl font-extrabold tracking-tight text-[#0b1f4b] outline-none sm:text-2xl"
                      aria-label="Amount to send"
                    />
                  </div>
                </div>
                <div className="relative flex-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Recipient gets</label>
                  <div className="mt-2 rounded-2xl border border-sky-200 bg-sky-50/70 px-4 py-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="break-words text-xl font-extrabold tracking-tight text-[#0b1f4b] sm:text-2xl">{formatMoney(received)} <span className="text-base font-bold text-slate-600">{corridor.to}</span></p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">Live rate: 1 {corridor.from} = {formatMoney(corridor.rate, 4)} {corridor.to}</p>
                      </div>
                      <button type="button" onClick={() => setOpen((v) => !v)} className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-white px-3 py-2.5 text-sm font-semibold text-[#0b1f4b] shadow-sm hover:bg-sky-50 sm:w-auto sm:shrink-0" aria-expanded={open} aria-label="Select corridor">
                        <span>{corridor.flag}</span> <span className="truncate">{corridor.country}</span> <ChevronDown size={15} className="shrink-0" />
                      </button>
                    </div>
                    {open && (
                      <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl sm:left-auto sm:min-w-[240px]">
                        {corridors.map((c, i) => (
                          <button key={`${c.from}-${c.to}-${i}`} type="button" onClick={() => { setCorridorIndex(i); setOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-slate-50">
                            <span>{c.flag}</span>
                            <span className="font-semibold text-slate-800">{c.country}</span>
                            <span className="ml-auto text-xs text-slate-500">{c.from}→{c.to}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="lg:w-56">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold text-slate-500">Estimated total</p>
                    <p className="mt-1 text-xl font-extrabold text-[#0b1f4b]">{formatMoney(totalCost)} {corridor.from}</p>
                    <p className="text-xs text-slate-500">Includes fee {formatMoney(corridor.fee)} {corridor.from}</p>
                  </div>
                  <Link to="/send" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0284c7] px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-sky-700/20 hover:bg-[#0369a1]">
                    Send now <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2 text-xs font-medium text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
                <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#0284c7]" /> Bank-grade encryption</span>
                <span className="inline-flex items-center gap-1.5"><Timer size={14} className="text-[#0284c7]" /> Real-time status tracking</span>
                <span className="inline-flex items-center gap-1.5"><BadgeCheck size={14} className="text-[#0284c7]" /> No hidden FX markups shown upfront</span>
              </div>
            </div>
          </div>
        </div>

          {/* Monochrome partner logo strip */}
          <div className="mt-10 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur sm:mt-12 sm:p-5">
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.16em] text-slate-200 sm:text-xs sm:tracking-[0.2em]">Powering payouts with trusted partners</p>
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
              {partners.map((p) => (
                <div key={p} className="flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/10 px-2 text-center text-xs font-bold tracking-wide text-slate-200 transition hover:bg-white/20 sm:h-14 sm:px-3 sm:text-sm">
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* (3) 3-column card grid for core features */}
      <section className="bg-slate-50 py-14 sm:py-20 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#0284c7]">Core rails</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#0b1f4b] sm:text-4xl dark:text-white">Accessible channels for everyone</h2>
            <p className="mt-4 text-base text-slate-600 sm:text-lg dark:text-slate-300">Bridging people, families, and businesses with reliable payout options across web, mobile money, bank rails, and USSD.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:mt-12 sm:gap-6 md:grid-cols-3">
            <FeatureCard
              icon={<PhoneCall className="h-6 w-6" />}
              title="USSD Offline Transfers"
              text="Enable send, confirm, and track flows on feature phones via USSD sessions — no smartphone or data required."
              bullets={['Session-based secure menus', 'Low-bandwidth reach', 'Agent & consumer friendly']}
            />
            <FeatureCard
              icon={<Smartphone className="h-6 w-6" />}
              title="Mobile Money"
              text="Instant collections and disbursements to leading mobile money wallets with real-time status and reconciliation hooks."
              bullets={['Popular wallet networks', 'Fast settlement visibility', 'Transparent fees & FX']}
            />
            <FeatureCard
              icon={<Landmark className="h-6 w-6" />}
              title="Bank Payouts"
              text="Direct-to-bank transfers for businesses and recipients, with compliance checks and auditable transaction trails."
              bullets={['Local & regional banks', 'Reference-rich payouts', 'Operational controls']}
            />
          </div>
        </div>
      </section>

      {/* (4) Animated statistics strip */}
      <section className="border-y border-slate-200 bg-white py-10 sm:py-12 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 sm:gap-6 sm:px-6 md:grid-cols-4 lg:px-8">
          <Stat value="35+" label="Supported countries" sub="and growing corridors" visible={statsVisible} delay="0ms" />
          <Stat value="< 5 min" label="Typical transaction speed" sub="for wallet payouts" visible={statsVisible} delay="100ms" />
          <Stat value="99.95%" label="Platform reliability" sub="resilient infrastructure" visible={statsVisible} delay="200ms" />
          <Stat value="24/7" label="Tracking & support" sub="end-to-end visibility" visible={statsVisible} delay="300ms" />
        </div>
      </section>

      {/* (5) Alternating 2-column feature sections with UI illustrations */}
      <section className="overflow-x-clip bg-white py-14 sm:py-20 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl space-y-14 px-4 sm:space-y-20 sm:px-6 lg:space-y-28 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#0284c7]">For people, families & businesses</p>
              <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-[#0b1f4b] sm:text-4xl dark:text-white">A world where sending money across borders feels as easy as sending a message.</h3>
              <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8 dark:text-slate-300">Starting in Kenya and expanding across East Africa to the rest of the world, SwiftSend makes cross-border transfers faster, simpler, more affordable, and more transparent — from app to USSD.</p>
              <ul className="mt-6 space-y-3 text-slate-700 dark:text-slate-200">
                {['Live FX quotes and upfront pricing', 'Accessible web and USSD journeys', 'Simple, transparent tracking from start to finish'].map((t) => (
                  <li key={t} className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0284c7]" /> <span className="text-sm sm:text-base">{t}</span></li>
                ))}
              </ul>
              <Link to="/send" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#0284c7] hover:text-[#0369a1] sm:mt-8">Explore send flow <ArrowRight size={16} /></Link>
            </div>
            <div className="relative">
              <div className="absolute -inset-2 rounded-[2rem] bg-sky-100/60 blur-2xl sm:-inset-4 dark:bg-sky-900/20" />
              <img src={featureImgA} alt="Customer completing a secure digital payment experience" className="relative aspect-[4/3] w-full rounded-3xl border border-slate-200 object-cover shadow-2xl shadow-slate-900/10" loading="lazy" />
              <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:absolute sm:-bottom-5 sm:-left-4 sm:mt-0 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-xs font-semibold text-slate-500">Live transfer status</p>
                <p className="mt-1 text-sm font-bold text-[#0b1f4b] dark:text-white">Payout pending → Completed</p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-green-600"><BadgeCheck size={14} /> Evidence trail recorded</p>
              </div>
            </div>
          </div>

          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute -inset-2 rounded-[2rem] bg-indigo-100/60 blur-2xl sm:-inset-4 dark:bg-indigo-900/20" />
              <img src={featureImgB} alt="Business user managing cross-border payments securely" className="relative aspect-[4/3] w-full rounded-3xl border border-slate-200 object-cover shadow-2xl shadow-slate-900/10" loading="lazy" />
              <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:absolute sm:-right-3 sm:-top-4 sm:mt-0 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-xs font-semibold text-slate-500">Business controls</p>
                <p className="mt-1 text-sm font-bold text-[#0b1f4b] dark:text-white">Corridors, fees & reconciliation</p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold">
                  <span className="rounded-full bg-sky-50 px-2 py-1 text-[#0369a1]">FX rules</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-200">Audit logs</span>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#0284c7]">Our mission</p>
              <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-[#0b1f4b] sm:text-4xl dark:text-white">Making global money transfers accessible to everyone, starting with Africa.</h3>
              <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8 dark:text-slate-300">By combining modern payment technologies, Stellar blockchain infrastructure, and accessible channels such as web and USSD, SwiftSend bridges the gap between people, families, and businesses regardless of where they are in the world.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4">
                {[
                  { icon: <Building2 className="h-5 w-5" />, title: 'B2B collections & payouts', desc: 'Support partners, merchants, and enterprise disbursements.' },
                  { icon: <Wallet className="h-5 w-5" />, title: 'Multi-rail orchestration', desc: 'Route across wallet and bank channels by corridor.' },
                  { icon: <Banknote className="h-5 w-5" />, title: 'Transparent pricing', desc: 'Quote-driven fees and FX visibility for users.' },
                  { icon: <ShieldCheck className="h-5 w-5" />, title: 'Operational safeguards', desc: 'Controls, evidence hooks, and status integrity.' },
                ].map((f) => (
                  <div key={f.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-[#0284c7]">{f.icon}<span className="text-sm font-bold text-[#0b1f4b] dark:text-white">{f.title}</span></div>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* (6) Dark-themed security and compliance banner */}
      <section className="bg-[#0b1f4b] py-12 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:gap-10">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-sky-200"><ShieldCheck size={14} /> Security & compliance</p>
              <h3 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-4xl">Built with trust, controls, and auditability at the core</h3>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200/90 sm:text-lg sm:leading-8">Protect customer funds and data with layered safeguards, monitored workflows, and compliance-aware processes across every transfer stage.</p>
              <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4">
                {[
                  { icon: <LockKeyhole className="h-5 w-5" />, title: 'Encryption & access controls', desc: 'Secure data handling, authenticated APIs, and least-privilege operations.' },
                  { icon: <CheckCircle2 className="h-5 w-5" />, title: 'KYC/AML-ready workflows', desc: 'Designed to integrate verification and screening controls by corridor.' },
                  { icon: <Globe2 className="h-5 w-5" />, title: 'Regulatory-aware corridors', desc: 'Configurable rules and partner integrations for local requirements.' },
                  { icon: <BadgeCheck className="h-5 w-5" />, title: 'Audit trails & evidence', desc: 'Traceable events, references, and status changes for oversight.' },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur">
                    <div className="flex items-center gap-2 text-sky-300">{item.icon}<span className="font-bold text-white">{item.title}</span></div>
                    <p className="mt-2 text-sm leading-6 text-slate-200/85">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 p-6 sm:p-8">
              <h4 className="text-xl font-bold">Compliance posture</h4>
              <p className="mt-2 text-sm text-slate-200/85">Operational transparency for partners, auditors, and customers.</p>
              <div className="mt-6 space-y-3">
                {['End-to-end transaction lifecycle monitoring', 'Role-based access for admin operations', 'Idempotent flows and reconciliation-ready references', 'Configurable webhook and integration safeguards'].map((row) => (
                  <div key={row} className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#0a1a3d] px-4 py-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-sky-300" />
                    <span className="text-sm text-slate-100">{row}</span>
                  </div>
                ))}
              </div>
              <Link to="/register" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0284c7] px-5 py-3 text-sm font-bold text-white hover:bg-[#0369a1]">
                Start building with SwiftSend <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-12 sm:py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-sky-50 via-white to-indigo-50 px-5 py-8 text-center sm:px-10 sm:py-10 lg:px-16">
            <h3 className="text-2xl font-extrabold tracking-tight text-[#0b1f4b] sm:text-3xl dark:text-[#0b1f4b]">Join us in connecting Africa to the world.</h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">Our vision: a world where sending money across borders feels as easy as sending a message. Start with SwiftSend today.</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/register" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0284c7] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-700/20 hover:bg-[#0369a1] sm:w-auto">Get Started <ArrowUpRight size={16} /></Link>
              <Link to="/rates" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-[#0b1f4b] hover:bg-slate-50 sm:w-auto">View pricing <ArrowRight size={16} /></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, text, bullets }) => (
  <article className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900">
    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-[#0284c7] dark:bg-slate-800 dark:text-sky-300">{icon}</div>
    <h3 className="mt-5 text-xl font-bold tracking-tight text-[#0b1f4b] dark:text-white">{title}</h3>
    <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">{text}</p>
    <ul className="mt-4 space-y-2">
      {bullets.map((b) => (
        <li key={b} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[#0284c7]" /> {b}</li>
      ))}
    </ul>
  </article>
);

const Stat = ({ value, label, sub, visible, delay }) => (
  <div className={`rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-center sm:p-5 dark:border-slate-800 dark:bg-slate-900/60 ${visible ? 'animate-count' : 'opacity-0'}`} style={{ animationDelay: delay }}>
    <p className="text-2xl font-extrabold tracking-tight text-[#0b1f4b] sm:text-3xl dark:text-sky-300">{value}</p>
    <p className="mt-1 text-xs font-bold leading-5 text-slate-800 sm:text-sm dark:text-slate-100">{label}</p>
    <p className="mt-1 text-[11px] leading-4 text-slate-500 sm:text-xs dark:text-slate-400">{sub}</p>
  </div>
);

export default Home;
