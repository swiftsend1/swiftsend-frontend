import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { ArrowDownUp, ArrowRight, Globe2, Info, ShieldCheck, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const currencies = {
  USD: { flag: '🇺🇸', name: 'US Dollar', market: 'United States' },
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

const baseToUsd = { USD: 1, KES: 129.42, NGN: 1547.8, GBP: 0.7729 };
const marketPairs = [['USD', 'KES'], ['GBP', 'KES'], ['USD', 'NGN'], ['GBP', 'NGN']];

const getRate = (from, to) => from === to ? 1 : rates[`${from}-${to}`] || (rates[`${to}-${from}`] ? 1 / rates[`${to}-${from}`] : baseToUsd[to] / baseToUsd[from]);
const formatRate = (value) => value.toLocaleString('en', { maximumFractionDigits: 4 });

export default function ExchangeRates() {
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('KES');
  const [amount, setAmount] = useState('100');
  const rate = getRate(from, to);
  const output = useMemo(() => Number(amount || 0) * rate, [amount, rate]);
  const swap = () => { setFrom(to); setTo(from); };

  return (
    <div className="mx-auto max-w-5xl space-y-6 sm:space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.15em]" style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}><Globe2 size={13} /> Launch markets</span>
          <h2 className="ss-title mt-3 text-2xl font-black tracking-tight sm:text-4xl">Compare the route before you send.</h2>
          <p className="ss-copy mt-2 max-w-2xl text-sm leading-6">Explore indicative rates across Kenya and East Africa, Nigeria, the US, and the UK. SwiftSend is designed for transfers in either direction between enabled markets.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--muted)' }}><ShieldCheck size={16} style={{ color: 'var(--accent-strong)' }} /> Clear before you confirm</div>
      </header>

      <section className="ss-surface overflow-hidden rounded-[26px]">
        <div className="flex flex-col justify-between gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:px-7" style={{ borderColor: 'var(--border)' }}>
          <div><p className="text-sm font-black">Indicative rate calculator</p><p className="ss-copy mt-1 text-xs">Choose a direction and see the estimated recipient amount.</p></div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-extrabold" style={{ background: 'var(--surface-muted)', color: 'var(--muted)' }}><TrendingUp size={13} /> Example rates</span>
        </div>
        <div className="p-4 sm:p-7">
          <div className="mb-5 flex items-start gap-2 rounded-2xl p-3.5" style={{ background: 'var(--accent-soft)' }}>
            <Info size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--accent-strong)' }} />
            <p className="text-xs leading-5">These are illustrative examples, not live market rates or a guaranteed SwiftSend offer. Your final rate and fees are shown in the transfer quote before confirmation.</p>
          </div>

          <div className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <RateInput id="rate-amount" label="You send" amount={amount} setAmount={setAmount} currency={from} setCurrency={setFrom} />
            <button type="button" onClick={swap} aria-label="Swap sending and receiving currencies" className="mx-auto grid h-11 w-11 place-items-center rounded-full border bg-[var(--surface)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]" style={{ borderColor: 'var(--border)', color: 'var(--accent-strong)' }}><ArrowDownUp size={17} /></button>
            <RateInput id="rate-output" label="Recipient gets" value={output.toLocaleString('en', { maximumFractionDigits: 2 })} currency={to} setCurrency={setTo} readOnly />
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
          {marketPairs.map(([a, b]) => <div key={`${a}-${b}`} className="ss-surface flex items-center justify-between gap-3 rounded-2xl p-4"><div className="min-w-0"><div className="flex items-center gap-2 text-sm font-black">{currencies[a].flag} {a} <ArrowRight size={14} style={{ color: 'var(--muted)' }} /> {currencies[b].flag} {b}</div><p className="ss-copy mt-1 text-[11px]">Swap the direction in the calculator</p></div><span className="shrink-0 text-sm font-black" style={{ color: 'var(--accent-strong)' }}>{formatRate(getRate(a, b))}</span></div>)}
        </div>
      </section>

      <section className="rounded-2xl border p-4 sm:flex sm:items-center sm:gap-4" style={{ borderColor: 'var(--border)', background: 'var(--surface-muted)' }}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: 'var(--surface)', color: 'var(--accent-strong)' }}><Info size={18} /></span><div><p className="text-sm font-extrabold">Launching with focused corridors</p><p className="ss-copy mt-1 text-xs leading-5">SwiftSend starts with Kenya and East Africa, Nigeria, the United States, and the United Kingdom. Availability depends on the sending and receiving rails enabled for each route.</p></div></section>
    </div>
  );
}

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
