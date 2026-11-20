import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Globe2,
  LockKeyhole,
  Send,
  ShieldCheck,
  Wallet,
} from 'lucide-react';

const corridors = [
  { from: 'USD', to: 'KES', flag: '🇰🇪', country: 'Kenya', rate: 129.42, fee: 3.99 },
  { from: 'USD', to: 'UGX', flag: '🇺🇬', country: 'Uganda', rate: 3785.1, fee: 4.25 },
  { from: 'GBP', to: 'KES', flag: '🇰🇪', country: 'Kenya', rate: 165.08, fee: 2.99 },
  { from: 'EUR', to: 'NGN', flag: '🇳🇬', country: 'Nigeria', rate: 1624.5, fee: 3.49 },
];

const rates = [
  { pair: 'USD / KES', value: '129.42', change: '+0.18%', up: true },
  { pair: 'USD / UGX', value: '3,785.10', change: '+0.06%', up: true },
  { pair: 'GBP / KES', value: '165.08', change: '-0.12%', up: false },
  { pair: 'EUR / NGN', value: '1,624.50', change: '+0.21%', up: true },
];

const formatMoney = (value, max = 2) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: max }).format(Number.isFinite(value) ? value : 0);

const Home = () => {
  const [amount, setAmount] = useState('1000');
  const [corridorIndex, setCorridorIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const corridor = corridors[corridorIndex];
  const amountNumber = Number(String(amount).replace(/,/g, '')) || 0;
  const received = useMemo(() => amountNumber * corridor.rate, [amountNumber, corridor.rate]);
  const total = useMemo(() => amountNumber + (amountNumber ? corridor.fee : 0), [amountNumber, corridor.fee]);

  return (
    <div className="bg-[#f5f5f2] text-[#161616]">
      <section className="relative overflow-hidden px-3 pb-10 pt-6 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8">
        <div className="pointer-events-none absolute inset-y-0 right-0 block w-full overflow-hidden lg:w-[58%]">
          <div className="absolute inset-0 bg-cover bg-center opacity-[.48] sm:opacity-[.54]" style={{ backgroundImage: "url('https://images.pexels.com/photos/6969933/pexels-photo-6969933.jpeg?auto=compress&cs=tinysrgb&w=1600'), url('/swiftsend-hero.svg')" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#f5f5f2]/90 via-[#f5f5f2]/45 to-[#f5f5f2]/15 lg:bg-gradient-to-r lg:from-[#f5f5f2] lg:via-[#f5f5f2]/45 lg:to-transparent" />
        </div>
        <div className="relative z-10 mx-auto max-w-[1320px]">
          <div className="grid min-w-0 items-center gap-9 lg:grid-cols-[.82fr_1.18fr] lg:gap-20">
            <div className="min-w-0 max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#deded8] bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#74746e] shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c59620]" /> SwiftSend
              </span>
              <h1 className="mt-6 text-[clamp(2.75rem,13vw,4.5rem)] font-black leading-[.92] tracking-[-.07em]">Money, <span className="text-[#b28214]">moving.</span></h1>
              <p className="mt-5 max-w-sm text-base leading-7 text-[#75756f]">Fast, simple transfers across Africa and the world.</p>
              <div className="mt-7 grid w-full gap-3 sm:flex sm:w-auto">
                <Link to="/send" className="inline-flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-[#161616] px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#302f2b] sm:w-auto">Send money <ArrowUpRight size={16} className="text-[#e3bb49]" /></Link>
                <Link to="/track" className="inline-flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-[#d8d8d2] bg-white px-5 py-3.5 text-sm font-bold text-[#161616] transition hover:-translate-y-0.5 hover:bg-[#fbfbf9] sm:w-auto">Track a transfer <ArrowRight size={16} /></Link>
              </div>
              <div className="mt-8 flex items-center gap-3 text-xs font-semibold text-[#888881]"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#e7f1e6] text-[#498b50]"><ShieldCheck size={14} /></span>Secure by design <span className="text-[#c9c9c3]">·</span> Clear by default</div>
            </div>

            <QuoteCard
              amount={amount}
              setAmount={setAmount}
              corridor={corridor}
              setCorridorIndex={setCorridorIndex}
              open={open}
              setOpen={setOpen}
              received={received}
              total={total}
            />
          </div>

          <div className="mt-10 grid grid-cols-2 gap-2 sm:mt-14 sm:grid-cols-4 lg:mt-20">
            <QuickAction icon={<Send />} label="Send" to="/send" />
            <QuickAction icon={<ArrowDownLeft />} label="Receive" to="/receive" />
            <QuickAction icon={<Clock3 />} label="Track" to="/track" />
            <QuickAction icon={<Wallet />} label="Wallet" to="/wallet" />
          </div>
          <RatesTicker />
        </div>
      </section>

      <section className="hidden border-y border-[#e1e1dc] bg-white px-4 py-14 sm:block sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex items-end justify-between gap-6">
            <div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#b28214]">What you can do</p><h2 className="mt-2 text-3xl font-black tracking-[-.055em] sm:text-5xl">Your money, in motion.</h2></div>
            <span className="hidden rounded-full bg-[#f5f5f2] px-3 py-1.5 text-xs font-bold text-[#8b8b84] sm:inline-flex">Built for everyday transfers</span>
          </div>
          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SolutionCard icon={<Send />} label="Send money" detail="To wallets and banks" to="/send" />
            <SolutionCard icon={<ArrowDownLeft />} label="Receive money" detail="Share your details" to="/receive" />
            <SolutionCard icon={<Globe2 />} label="Exchange rates" detail="See the real numbers" to="/rates" />
            <SolutionCard icon={<LockKeyhole />} label="Stay protected" detail="Secure every step" to="/help" dark />
          </div>
        </div>
      </section>

      <section className="hidden px-4 py-14 sm:block sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-[1320px] gap-4 lg:grid-cols-[.8fr_1.2fr]">
          <div className="rounded-[1.75rem] bg-[#161616] p-6 text-white sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#e3bb49]">Transfer status</p>
            <h2 className="mt-3 max-w-sm text-3xl font-black leading-tight tracking-[-.055em] sm:text-4xl">Know where your money is.</h2>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/50">Every transfer has a clear next step.</p>
            <Link to="/track" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#161616] transition hover:bg-[#f0eee7]">Track transfer <ArrowRight size={15} /></Link>
            <div className="mt-12 flex items-center gap-3 text-xs font-semibold text-white/50"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-[#e3bb49]"><Clock3 size={15} /></span> Live updates</div>
          </div>

          <div className="rounded-[1.75rem] border border-[#dfdfda] bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-[#ededeb] pb-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#999991]">Recent transfer</p><p className="mt-1 font-black text-[#161616]">USD → KES</p></div><span className="rounded-full bg-[#e7f1e6] px-3 py-1.5 text-xs font-bold text-[#498b50]">On track</span></div>
            <div className="grid gap-8 pt-6 md:grid-cols-[.8fr_1.2fr] md:items-center">
              <div><p className="text-4xl font-black tracking-[-.06em] text-[#161616]">$1,000</p><p className="mt-1 text-sm text-[#85857e]">To Kenya · #SS-2048</p><div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#498b50]"><Check size={14} /> Recipient gets {formatMoney(129420)} KES</div></div>
              <div className="space-y-4">
                <StatusRow title="Transfer created" time="10:42 AM" done />
                <StatusRow title="Funds secured" time="10:43 AM" done />
                <StatusRow title="Payout to Kenya" time="In progress" active />
                <StatusRow title="Recipient paid" time="Next" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="hidden px-4 pb-14 sm:block sm:px-6 sm:pb-20 lg:px-8">
        <div className="mx-auto flex max-w-[1320px] flex-col items-start justify-between gap-6 rounded-[1.75rem] bg-[#e9e3ce] px-6 py-8 sm:flex-row sm:items-center sm:px-10 sm:py-10">
          <div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#a47712]">Ready when you are</p><h2 className="mt-2 text-2xl font-black tracking-[-.045em] sm:text-3xl">Make your next move.</h2></div>
          <Link to="/register" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#161616] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#302f2b] sm:w-auto">Get started <ArrowUpRight size={16} className="text-[#e3bb49]" /></Link>
        </div>
      </section>
    </div>
  );
};

const QuoteCard = ({ amount, setAmount, corridor, setCorridorIndex, open, setOpen, received, total }) => (
  <div className="relative mx-auto min-w-0 w-full max-w-[570px] lg:mr-0">
    <div className="absolute -inset-4 rounded-[2.5rem] bg-[#e6d8a7]/35 blur-2xl" />
    <div className="relative min-w-0 rounded-[1.5rem] border border-[#deded8] bg-white p-3 shadow-[0_25px_70px_-30px_rgba(22,22,22,.3)] sm:rounded-[1.75rem] sm:p-6">
      <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#999991]">Quick quote</p><h2 className="mt-1 text-xl font-black tracking-[-.03em]">Send money</h2></div><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f5edcf] text-[#ae7d0d]"><CircleDollarSign size={19} /></span></div>
      <div className="mt-5 grid min-w-0 gap-3 sm:mt-6 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-end">
        <MoneyField label="You send" value={amount} currency={corridor.from} onChange={(value) => setAmount(value.replace(/[^0-9.]/g, ''))} inputId="hero-send-amount" />
        <div className="hidden h-10 w-10 place-items-center rounded-full bg-[#f5f5f2] text-[#9a9a92] sm:grid"><ArrowRight size={16} /></div>
        <div className="rounded-2xl border border-[#e8d799] bg-[#fff9e7] p-4"><p className="text-xs font-bold text-[#999991]">Recipient gets</p><p className="mt-2 text-2xl font-black tracking-[-.05em]">{formatMoney(received)} <span className="text-sm tracking-normal text-[#77776f]">{corridor.to}</span></p><p className="mt-1 text-[11px] text-[#888880]">1 {corridor.from} = {formatMoney(corridor.rate, 4)} {corridor.to}</p></div>
      </div>
      <div className="relative mt-3 flex items-center justify-between rounded-2xl bg-[#f5f5f2] px-4 py-3"><span className="text-xs font-bold text-[#85857e]">Payout country</span><button type="button" onClick={() => setOpen((value) => !value)} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-black shadow-sm" aria-expanded={open}><span>{corridor.flag}</span>{corridor.country}<ChevronDown size={13} /></button>{open && <div className="absolute left-3 right-3 top-[calc(100%+6px)] z-20 rounded-2xl border border-[#dfdfda] bg-white p-1.5 shadow-xl">{corridors.map((item, index) => <button key={`${item.from}-${item.to}-${index}`} type="button" onClick={() => { setCorridorIndex(index); setOpen(false); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm hover:bg-[#f5f5f2]"><span>{item.flag}</span><span className="font-bold">{item.country}</span><span className="ml-auto text-xs text-[#999991]">{item.from} → {item.to}</span></button>)}</div>}</div>
      <div className="mt-3 flex items-center justify-between border-t border-[#ededeb] pt-4"><span className="text-xs font-bold text-[#999991]">Total including fee</span><span className="text-sm font-black">{formatMoney(total)} {corridor.from}</span></div>
      <Link to="/send" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#161616] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#302f2b]">Continue <ArrowRight size={16} className="text-[#e3bb49]" /></Link>
      <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-bold text-[#999991]"><ShieldCheck size={14} className="text-[#ae7d0d]" /> Rate shown before you send</div>
    </div>
  </div>
);

const MoneyField = ({ label, value, currency, onChange, inputId }) => <div className="min-w-0 rounded-2xl border border-[#dfdfda] bg-[#fbfbf9] p-3 focus-within:border-[#c79b2b] focus-within:ring-4 focus-within:ring-[#e9c65f]/20 sm:p-4"><label htmlFor={inputId} className="block text-xs font-bold text-[#999991]">{label}</label><div className="mt-2 flex min-w-0 items-center gap-2 sm:gap-3"><input id={inputId} value={value} onChange={(event) => onChange(event.target.value)} inputMode="decimal" className="min-w-0 flex-1 bg-transparent text-2xl font-black tracking-[-.05em] outline-none" aria-label={label} /><span className="shrink-0 rounded-full bg-white px-2.5 py-1.5 text-xs font-black shadow-sm sm:px-3">{currency}</span></div></div>;

const QuickAction = ({ icon, label, to }) => <Link to={to} className="group flex items-center gap-3 rounded-2xl border border-[#deded8] bg-white px-4 py-4 transition hover:-translate-y-0.5 hover:border-[#d4c37e] hover:shadow-lg"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f5edcf] text-[#ae7d0d] transition group-hover:bg-[#e9d994]">{icon}</span><span className="text-sm font-black">{label}</span><ArrowRight size={15} className="ml-auto text-[#aaa9a1] transition group-hover:translate-x-0.5 group-hover:text-[#161616]" /></Link>;

const RatesTicker = () => (
  <div className="mt-4 overflow-hidden rounded-2xl border border-[#deded8] bg-white" aria-label="Indicative exchange rates">
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[#ededeb] px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#999991]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4e9b59]" /> Indicative rates <span className="hidden font-semibold normal-case tracking-normal text-[#b3b3ab] sm:inline">moving with the market</span></div>
    <div className="ss-rate-viewport">
      <div className="ss-rate-track flex w-max">
        {[...rates, ...rates].map((rate, index) => (
          <div key={`${rate.pair}-${index}`} className="flex min-w-[190px] items-center gap-3 border-r border-[#ededeb] px-5 py-3.5">
            <span className="text-xs font-black text-[#44443e]">{rate.pair}</span>
            <span className="text-sm font-black text-[#161616]">{rate.value}</span>
            <span className={`text-[11px] font-bold ${rate.up ? 'text-[#4e9b59]' : 'text-[#bd6c55]'}`}>{rate.change}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SolutionCard = ({ icon, label, detail, to, dark = false }) => <Link to={to} className={`group rounded-[1.5rem] border p-5 transition hover:-translate-y-1 hover:shadow-xl ${dark ? 'border-[#161616] bg-[#161616] text-white' : 'border-[#e1e1dc] bg-[#f9f9f7]'}`}><div className="flex items-start justify-between"><span className={`grid h-10 w-10 place-items-center rounded-xl ${dark ? 'bg-[#e3bb49] text-[#161616]' : 'bg-[#f5edcf] text-[#ae7d0d]'}`}>{icon}</span><ArrowUpRight size={17} className={dark ? 'text-white/40' : 'text-[#aaa9a1]'} /></div><p className="mt-9 text-base font-black">{label}</p><p className={`mt-1 text-xs font-semibold ${dark ? 'text-white/45' : 'text-[#898981]'}`}>{detail}</p></Link>;

const StatusRow = ({ title, time, done = false, active = false }) => <div className="flex items-center gap-3"><span className={`grid h-7 w-7 place-items-center rounded-full ${done ? 'bg-[#e7f1e6] text-[#498b50]' : active ? 'bg-[#f5edcf] text-[#ae7d0d]' : 'bg-[#f5f5f2] text-[#b0b0a8]'}`}>{done ? <Check size={13} /> : active ? <Clock3 size={13} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}</span><span className={`text-sm font-bold ${done || active ? 'text-[#34342f]' : 'text-[#aaa9a1]'}`}>{title}</span><span className="ml-auto text-xs font-semibold text-[#aaa9a1]">{time}</span></div>;

QuoteCard.propTypes = { amount: PropTypes.string.isRequired, setAmount: PropTypes.func.isRequired, corridor: PropTypes.shape({ from: PropTypes.string, to: PropTypes.string, flag: PropTypes.string, country: PropTypes.string, rate: PropTypes.number, fee: PropTypes.number }).isRequired, setCorridorIndex: PropTypes.func.isRequired, open: PropTypes.bool.isRequired, setOpen: PropTypes.func.isRequired, received: PropTypes.number.isRequired, total: PropTypes.number.isRequired };
MoneyField.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.string.isRequired, currency: PropTypes.string.isRequired, onChange: PropTypes.func.isRequired, inputId: PropTypes.string.isRequired };
QuickAction.propTypes = { icon: PropTypes.node.isRequired, label: PropTypes.string.isRequired, to: PropTypes.string.isRequired };
SolutionCard.propTypes = { icon: PropTypes.node.isRequired, label: PropTypes.string.isRequired, detail: PropTypes.string.isRequired, to: PropTypes.string.isRequired, dark: PropTypes.bool };
StatusRow.propTypes = { title: PropTypes.string.isRequired, time: PropTypes.string.isRequired, done: PropTypes.bool, active: PropTypes.bool };

export default Home;
