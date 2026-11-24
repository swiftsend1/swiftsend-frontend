import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { ArrowDownUp, ArrowRight, ArrowUpRight, Check, Globe2, Info, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const currencies = {
  USD: { flag: '🇺🇸', name: 'US Dollar', market: 'United States' },
  UG: { flag: '🇺🇬', name: 'Ugandan Shilling', market: 'East Africa' },
  KES: { flag: '🇰🇪', name: 'Kenyan Shilling', market: 'Kenya · East Africa' },
  NGN: { flag: '🇳🇬', name: 'Nigerian Naira', market: 'Nigeria' },
  GBP: { flag: '🇬🇧', name: 'British Pound', market: 'United Kingdom' },
};

const rates = {
  'USD-KES': 129.42,
  'USD-NGN': 1547.8,
  'GBP-KES': 167.45,
  'GBP-NGN': 2000.13,
};

const baseToUsd = { USD: 1, KES: 129.42, NGN: 1547.8, UG: 836, GBP: 0.7729 };
const marketPairs = [['USD', 'KES'], ['GBP', 'KES'], ['USD', 'NGN'], ['GBP', 'NGN'], ['USD', 'UG']];

const getRate = (from, to) => from === to ? 1 : rates[`${from}-${to}`] || (rates[`${to}-${from}`] ? 1 / rates[`${to}-${from}`] : baseToUsd[to] / baseToUsd[from]);
const formatRate = (value) => value.toLocaleString('en', { maximumFractionDigits: 4 });

export default function ExchangeRates() {
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('KES');
  const [amount, setAmount] = useState('100');
  const rate = getRate(from, to);
  const output = useMemo(() => Number(amount || 0) * rate, [amount, rate]);
  const swap = () => { setFrom(to); setTo(from); };
  const selectPair = (nextFrom, nextTo) => { setFrom(nextFrom); setTo(nextTo); };

  return (
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
      <section className="relative isolate overflow-hidden rounded-[28px] bg-[#151515] p-5 text-white shadow-[0_24px_60px_-34px_rgba(23,23,23,.7)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-80" aria-hidden="true">
          <div className="absolute inset-0 bg-cover bg-center mix-blend-screen" style={{ backgroundImage: "url('/swiftsend-hero.svg')" }} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#151515] via-[#151515]/90 to-[#151515]/35" />
        </div>
        <div className="relative grid gap-8 lg:grid-cols-[1fr_310px] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e4b638]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-[#f1cf72] ring-1 ring-[#e4b638]/30"><Globe2 size={13} /> Launch markets</span>
            <h1 className="mt-4 max-w-2xl text-3xl font-black leading-[1.02] tracking-[-.055em] sm:text-5xl">A clearer view of <span className="text-[#e4b638]">every route.</span></h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#c9c6bd] sm:text-base">Live rates across Kenya and East Africa, Nigeria, the US, and the UK before you start a transfer.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link to="/send" className="inline-flex items-center gap-2 rounded-xl bg-[#e4b638] px-4 py-3 text-sm font-black text-[#17140c] transition hover:-translate-y-0.5 hover:brightness-105">Start a transfer <ArrowUpRight size={16} /></Link>
              <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[.07] px-4 py-3 text-xs font-bold text-[#e7e2d5]"><ShieldCheck size={15} className="text-[#e4b638]" /> Clear before you confirm</span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/[.08] p-4 backdrop-blur-sm lg:p-5">
            <div className="flex items-center justify-between gap-3"><p className="text-xs font-black uppercase tracking-[.16em] text-[#f1cf72]">Rate board</p><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Indicative</span></div>
            <p className="mt-5 text-3xl font-black tracking-[-.05em]">04</p>
            <p className="mt-1 text-xs text-[#aaa69b]">launch corridors ready to explore</p>
            <div className="mt-5 grid grid-cols-2 gap-2 border-t border-white/10 pt-4 text-xs"><div><p className="text-[#aaa69b]">Direction</p><p className="mt-1 font-bold text-white">Both ways</p></div><div><p className="text-[#aaa69b]">Quote</p><p className="mt-1 font-bold text-white">Before send</p></div></div>
          </div>
        </div>
      </section>

      <section className="ss-surface overflow-hidden rounded-[26px]">
        <div className="flex flex-col justify-between gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:px-7" style={{ borderColor: 'var(--border)' }}>
          <div><p className="text-sm font-black">Live rates</p><p className="ss-copy mt-1 text-xs">Choose a direction and see the estimated recipient amount.</p></div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-extrabold" style={{ background: 'var(--surface-muted)', color: 'var(--muted)' }}><TrendingUp size={13} /> Live rates</span>
        </div>
        <div className="p-4 sm:p-7">
          <div className="mb-5 flex items-start gap-2 rounded-2xl p-3.5" style={{ background: 'var(--accent-soft)' }}>
            <Info size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--accent-strong)' }} />
            <p className="text-xs leading-5">Live rates are based on current market data and shown as indicators; your final rate and fees are confirmed in the transfer quote before you send.</p>
          </div>

          <div className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <RateInput id="rate-amount" label="You send" amount={amount} setAmount={setAmount} currency={from} setCurrency={setFrom} />
            <button type="button" onClick={swap} aria-label="Swap sending and receiving currencies" className="mx-auto grid h-11 w-11 place-items-center rounded-full border bg-[var(--surface)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]" style={{ borderColor: 'var(--border)', color: 'var(--accent-strong)' }}><ArrowDownUp size={17} /></button>
            <RateInput id="rate-output" label="Recipient gets" value={output.toLocaleString('en', { maximumFractionDigits: 2 })} currency={to} setCurrency={setTo} readOnly />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[10px] font-black uppercase tracking-[.16em]" style={{ color: 'var(--muted)' }}>Quick amount</span>
            {['50', '100', '500', '1000'].map((preset) => <button key={preset} type="button" onClick={() => setAmount(preset)} className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${amount === preset ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] hover:bg-[var(--surface-muted)]'}`} style={{ color: amount === preset ? 'var(--accent-strong)' : 'var(--muted)' }}>{from} {Number(preset).toLocaleString()}</button>)}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl p-4" style={{ background: 'var(--surface-muted)' }}><p className="ss-copy text-[10px] font-bold uppercase tracking-wider">Indicative rate</p><p className="mt-1 text-lg font-black">1 {from} = {formatRate(rate)} {to}</p></div>
            <div className="rounded-2xl p-4" style={{ background: 'var(--surface-muted)' }}><p className="ss-copy text-[10px] font-bold uppercase tracking-wider">Selected route</p><p className="mt-1 text-sm font-black">{currencies[from].market} <ArrowRight size={14} className="mx-1 inline" style={{ color: 'var(--accent-strong)' }} /> {currencies[to].market}</p></div>
          </div>
          <Link to="/send" className="ss-primary mt-4 min-h-12 w-full">Get an official transfer quote <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.18em]" style={{ color: 'var(--accent-strong)' }}>Starting corridors</p><h3 className="ss-title mt-1 text-xl font-black">Move money either way.</h3></div><span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Indicative only</span></div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {marketPairs.map(([a, b]) => {
            const active = from === a && to === b;
            return <button key={`${a}-${b}`} type="button" onClick={() => selectPair(a, b)} className={`ss-surface group flex w-full items-center justify-between gap-3 rounded-2xl p-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--accent)] ${active ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/15' : ''}`}><div className="min-w-0"><div className="flex items-center gap-2 text-sm font-black">{currencies[a].flag} {a} <ArrowRight size={14} style={{ color: 'var(--muted)' }} /> {currencies[b].flag} {b}</div><p className="ss-copy mt-1 text-[11px]">{active ? 'Selected in the calculator' : 'Use this route in the calculator'}</p></div><div className="flex shrink-0 items-center gap-2"><span className="text-sm font-black" style={{ color: 'var(--accent-strong)' }}>{formatRate(getRate(a, b))}</span><ArrowUpRight size={15} className="opacity-40 transition group-hover:opacity-100" style={{ color: 'var(--accent-strong)' }} /></div></button>;
          })}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <TrustNote icon={<Check size={16} />} title="Transparent examples" detail="See the indicative rate before you send." />
        <TrustNote icon={<Zap size={16} />} title="Fast route selection" detail="Tap a corridor to load it instantly." />
        <TrustNote icon={<Info size={16} />} title="Focused corridors" detail="Availability depends on enabled rails." />
      </section>
    </div>
  );
}

function TrustNote({ icon, title, detail }) {
  return <div className="ss-surface rounded-2xl p-4"><span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}>{icon}</span><p className="mt-3 text-sm font-black">{title}</p><p className="ss-copy mt-1 text-xs leading-5">{detail}</p></div>;
}

TrustNote.propTypes = { icon: PropTypes.node.isRequired, title: PropTypes.string.isRequired, detail: PropTypes.string.isRequired };

function RateInput({ id, label, amount, value, setAmount, currency, setCurrency, readOnly = false }) {
  return <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border)', background: readOnly ? 'var(--accent-soft)' : 'var(--surface)' }}><label htmlFor={id} className="ss-copy text-xs font-bold">{label}</label><div className="mt-2 flex items-center gap-2"><input id={id} type={readOnly ? 'text' : 'number'} min="0" inputMode="decimal" readOnly={readOnly} value={readOnly ? value : amount} onChange={readOnly ? undefined : (event) => setAmount(event.target.value)} className="min-w-0 flex-1 bg-transparent text-2xl font-black outline-none" style={{ color: 'var(--text)' }} /><select aria-label={`${label} currency`} value={currency} onChange={(event) => setCurrency(event.target.value)} className="max-w-[105px] rounded-xl p-2 text-xs font-extrabold" style={{ background: readOnly ? 'var(--surface)' : 'var(--surface-muted)', color: 'var(--text)' }}>{Object.keys(currencies).map((code) => <option key={code} value={code}>{currencies[code].flag} {code}</option>)}</select></div><p className="ss-copy mt-2 text-[10px]">{currencies[currency].name}</p></div>;
}

RateInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  amount: PropTypes.string,
  value: PropTypes.string,
  setAmount: PropTypes.func,
  currency: PropTypes.string.isRequired,
  setCurrency: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
};
