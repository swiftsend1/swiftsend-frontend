import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleDollarSign,
  Clock3,
  Globe2,
  LockKeyhole,
  Send,
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
  return (
    <div className="bg-[#f5f5f2] text-[#161616]">
      <section className="relative overflow-hidden px-3 pb-10 pt-6 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8">
        <div className="pointer-events-none absolute inset-0 block w-full overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-[.2] sm:opacity-[.3] lg:opacity-[.64]" style={{ backgroundImage: "url('https://images.pexels.com/photos/6969933/pexels-photo-6969933.jpeg?auto=compress&cs=tinysrgb&w=1600'), url('/swiftsend-hero.svg')" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#f5f5f2]/90 via-[#f5f5f2]/45 to-[#f5f5f2]/15 lg:bg-gradient-to-r lg:from-[#f5f5f2]/55 lg:via-[#f5f5f2]/20 lg:to-transparent" />
        </div>
        <div className="relative z-10 mx-auto max-w-[1320px]">
          <div className="grid min-w-0 items-center gap-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
            <div className="hidden min-w-0 max-w-xl lg:block">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#deded8] bg-white/90 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-[#74746e] shadow-sm backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c59620]" /> SwiftSend
              </span>
              <h1 className="mt-6 text-[clamp(2.8rem,11vw,5rem)] font-black leading-[.92] tracking-[-.07em] text-[#161616]">Send and receive money <span className="text-[#b28214]">seamlessly.</span></h1>
              <p className="mt-5 max-w-sm text-base leading-7 text-[#6f6f68] sm:text-lg">Simple transfers across Africa and the world. Know the cost. Track the journey.</p>
              <div className="mt-7 grid w-full gap-3 sm:flex sm:w-auto">
                <Link to="/send" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#161616] px-5 py-3.5 text-sm font-black text-white shadow-xl shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#302f2b] sm:w-auto">Send money <ArrowUpRight size={16} className="text-[#e3bb49]" /></Link>
                <Link to="/track" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[#d8d8d2] bg-white/90 px-5 py-3.5 text-sm font-black text-[#161616] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white sm:w-auto">Track transfer <ArrowRight size={16} /></Link>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-[#888881]"><span className="inline-flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#e7f1e6] text-[#498b50]"><Check size={12} /></span>Transparent fees</span><span className="inline-flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#e7f1e6] text-[#498b50]"><Check size={12} /></span>Trackable transfers</span></div>
            </div>
            <HeroPhoneMockup />
          </div>
          <HeroCTAGrid />
          <HeroRatesTicker />
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

const HeroPhoneMockup = () => {
  const [typedAmount, setTypedAmount] = useState('');
  const [pulse, setPulse] = useState(false);
  const [flash, setFlash] = useState(false);
  const [corridorIdx, setCorridorIdx] = useState(0);
  const corridor = corridors[corridorIdx];
  const amountNumber = Number(typedAmount.replace(/[^0-9.]/g, '')) || 0;
  const received = formatMoney(amountNumber * corridor.rate);
  const total = formatMoney(amountNumber + (amountNumber ? corridor.fee : 0));

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setTypedAmount('1,000');
      return undefined;
    }
    const timers = [];
    const typing = ['1', '10', '100', '1,000'];
    typing.forEach((value, i) => timers.push(setTimeout(() => setTypedAmount(value), 400 + i * 900)));
    const tapAt = 400 + typing.length * 900 + 700;
    timers.push(setTimeout(() => { setPulse(true); setCorridorIdx((i) => (i + 1) % corridors.length); }, tapAt + 200));
    timers.push(setTimeout(() => setFlash(true), tapAt + 300));
    timers.push(setTimeout(() => setPulse(false), tapAt + 1300));
    timers.push(setTimeout(() => setFlash(false), tapAt + 1800));
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  return (
    <div className="mx-auto mt-2 w-full max-w-[300px] sm:mt-8 lg:mt-10 lg:max-w-[360px]" aria-label="Interactive SwiftSend product preview">
      <div className="rounded-[1.5rem] border-[5px] border-[#e3bb49] bg-[#161616] p-0.5 shadow-2xl shadow-black/20">
        <div className="rounded-[1.6rem] bg-[#11100e] p-0.5">
          <div className="rounded-[1.4rem] bg-black p-3 pb-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black tracking-[0.16em] text-[#e3bb49]">SwiftSend</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#e3bb49]/30" />
            </div>
            <h2 className="mt-4 text-[1.35rem] font-black leading-tight tracking-tight text-[#f6f3eb]"><span className="lg:hidden">Cross-border transfers, <span className="text-[#e3bb49]">made simple.</span></span><span className="hidden lg:inline">Send and receive <span className="text-[#e3bb49]">money seamlessly.</span></span></h2>
            <p className="mt-1.5 text-[10px] leading-4 text-[#8a857d]"><span className="lg:hidden">Send and receive money seamlessly.</span><span className="hidden lg:inline">Quote it. Confirm it. Track it.</span></p>
            <div className="mt-3.5 grid grid-cols-2 gap-1.5">
              <Link to="/send" className="rounded-xl bg-[#e3bb49] px-3.5 py-2.5 text-center text-sm font-black text-[#161616] shadow-lg shadow-black/20">Send money</Link>
              <Link to="/track" className="rounded-xl border border-[#2a261c] bg-black px-3.5 py-2.5 text-center text-sm font-bold text-[#e6e3d8]">Track a transfer</Link>
            </div>
            <p className="mt-2 text-[10px] font-bold text-[#8a857d]">Secure by design · Clear by default</p>
            <div className="mt-3 rounded-2xl bg-[#161616] p-2.5 ring-1 ring-[#e3bb49]/30">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9a9688]">Quick quote</p>
                <CircleDollarSign size={15} className="text-[#e3bb49]" />
              </div>
              <div className="mt-2.5 grid gap-2 sm:grid-cols-[1fr_1fr]">
                <div className="rounded-xl bg-[#11100e] p-2 ring-1 ring-[#302c22]">
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#7a766c]">You send</p>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="text-xl font-black tabular-nums text-[#f6f3eb]">{typedAmount || '0'}</span>
                    <span className="text-xl font-black text-[#e3bb49] ss-blink">▌</span>
                    <span className="rounded-full bg-[#2a261c] px-2 py-0.5 text-[10px] font-black text-[#e3bb49]">{corridor.from}</span>
                  </div>
                </div>
                <div className="rounded-xl bg-[#11100e] p-2 ring-1 ring-[#302c22]">
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#7a766c]">Recipient gets</p>
                  <span className={`mt-1.5 block text-base font-black tabular-nums text-[#e3bb49] ${flash ? 'phone-flash' : ''}`}>{received} <span className="text-[11px] text-[#7a766c]">{corridor.to}</span></span>
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-2 rounded-2xl bg-[#11100e] p-2 ring-1 ring-[#302c22]">
                <span className={`h-1.5 w-1.5 rounded-full bg-[#e3bb49] ${pulse ? 'phone-dot-pulse' : ''}`} />
                <span className="text-xs font-black text-[#f6f3eb]">{corridor.flag}</span>
                <span className="text-xs font-bold text-[#9a9688]">{corridor.from} → {corridor.to}</span>
              </div>
              <Link to="/send" className="mt-2.5 block w-full rounded-2xl bg-[#e3bb49] px-4 py-2.5 text-center text-sm font-black text-[#161616] shadow-lg shadow-black/20">Continue</Link>
              <p className="mt-2 text-[10px] text-[#7a766c]">Total: {formatMoney(total)} {corridor.from}</p>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              {[
                { icon: <Send size={13} />, label: 'Send', to: '/send' },
                { icon: <ArrowDownLeft size={13} />, label: 'Receive', to: '/receive' },
                { icon: <Clock3 size={13} />, label: 'Track', to: '/track' },
                { icon: <Wallet size={13} />, label: 'Wallet', to: '/wallet' },
              ].map((item) => (
                <Link key={item.label} to={item.to} className="flex flex-col items-center gap-1 rounded-xl border border-[#2a261c] bg-black px-1 py-2.5 text-[#8a857d]">
                  <span className="grid h-5 w-5 place-items-center rounded-lg bg-[#2a261c] text-[#e3bb49]">{item.icon}</span>
                  <span className="text-[8px] font-black uppercase tracking-wide">{item.label}</span>
                </Link>
              ))}
            </div>
            <div className="mt-3 rounded-xl border border-[#2a261c] lg:hidden">
              <div className="ss-rate-viewport">
                <div className="ss-rate-track flex w-max">
                  {[...rates, ...rates].map((rate, i) => (
                    <div key={`${rate.pair}-${i}`} className="flex min-w-[170px] items-center gap-2 border-r border-[#2a261c] px-4 py-2.5">
                      <span className="text-[9px] font-black text-[#7a766c]">{rate.pair}</span>
                      <span className="text-sm font-black text-[#e3bb49]">{rate.value}</span>
                      <span className={`text-[9px] font-bold ${rate.up ? 'text-[#4e9b59]' : 'text-[#bd6c55]'}`}>{rate.change}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HeroCTAGrid = () => {
  const actions = [
    { icon: <ArrowDownLeft size={15} />, label: 'Receive money', to: '/receive' },
    { icon: <Wallet size={15} />, label: 'Wallet', to: '/wallet' },
    { icon: <Globe2 size={15} />, label: 'Exchange rates', to: '/rates' },
  ];
  return (
    <div className="mx-auto mt-7 hidden max-w-[760px] flex-wrap justify-center gap-2 sm:mt-9 lg:flex">
      {actions.map((action) => (
        <Link key={action.to} to={action.to} className="group inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d8d8d2] bg-white/80 px-3.5 py-2 text-xs font-black text-[#6f6f68] backdrop-blur transition hover:-translate-y-0.5 hover:border-[#c9a73b] hover:bg-white hover:text-[#161616]">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#f5edcf] text-[#ae7d0d] transition group-hover:bg-[#e9d994]">{action.icon}</span>
          <span className="whitespace-nowrap">{action.label}</span>
        </Link>
      ))}
    </div>
  );
};

const SolutionCard = ({ icon, label, detail, to, dark = false }) => <Link to={to} className={`group rounded-[1.5rem] border p-5 transition hover:-translate-y-1 hover:shadow-xl ${dark ? 'border-[#161616] bg-[#161616] text-white' : 'border-[#e1e1dc] bg-[#f9f9f7]'}`}><div className="flex items-start justify-between"><span className={`grid h-10 w-10 place-items-center rounded-xl ${dark ? 'bg-[#e3bb49] text-[#161616]' : 'bg-[#f5edcf] text-[#ae7d0d]'}`}>{icon}</span><ArrowUpRight size={17} className={dark ? 'text-white/40' : 'text-[#aaa9a1]'} /></div><p className="mt-9 text-base font-black">{label}</p><p className={`mt-1 text-xs font-semibold ${dark ? 'text-white/45' : 'text-[#898981]'}`}>{detail}</p></Link>;

const StatusRow = ({ title, time, done = false, active = false }) => <div className="flex items-center gap-3"><span className={`grid h-7 w-7 place-items-center rounded-full ${done ? 'bg-[#e7f1e6] text-[#498b50]' : active ? 'bg-[#f5edcf] text-[#ae7d0d]' : 'bg-[#f5f5f2] text-[#b0b0a8]'}`}>{done ? <Check size={13} /> : active ? <Clock3 size={13} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}</span><span className={`text-sm font-bold ${done || active ? 'text-[#34342f]' : 'text-[#aaa9a1]'}`}>{title}</span><span className="ml-auto text-xs font-semibold text-[#aaa9a1]">{time}</span></div>;

const HeroRatesTicker = () => (
  <div className="mx-auto mt-8 hidden max-w-[1320px] overflow-hidden rounded-2xl border border-[#d8d8d2] bg-white/80 shadow-sm backdrop-blur lg:block">
    <div className="flex items-center gap-3 border-b border-[#ededeb] px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#999991]">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4e9b59]" /> Indicative exchange rates
      <span className="font-semibold normal-case tracking-normal text-[#b3b3ab]">moving with the market</span>
    </div>
    <div className="ss-rate-viewport">
      <div className="ss-rate-track flex w-max">
        {[...rates, ...rates].map((rate, index) => (
          <div key={rate.pair + index} className="flex min-w-[220px] items-center gap-4 border-r border-[#ededeb] px-6 py-4">
            <span className="text-xs font-black text-[#44443e]">{rate.pair}</span>
            <span className="text-base font-black text-[#161616]">{rate.value}</span>
            <span className={rate.up ? 'text-xs font-bold text-[#4e9b59]' : 'text-xs font-bold text-[#bd6c55]'}>{rate.change}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

SolutionCard.propTypes = { icon: PropTypes.node.isRequired, label: PropTypes.string.isRequired, detail: PropTypes.string.isRequired, to: PropTypes.string.isRequired, dark: PropTypes.bool };
StatusRow.propTypes = { title: PropTypes.string.isRequired, time: PropTypes.string.isRequired, done: PropTypes.bool, active: PropTypes.bool };

export default Home;
