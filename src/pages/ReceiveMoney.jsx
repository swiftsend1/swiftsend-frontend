import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowRight, BadgeCheck, Building2, CheckCircle2, Copy, Download, Globe2, Smartphone, WalletCards } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const options = [
  { id: 'mobile', icon: <Smartphone size={22} />, title: 'Mobile Money (M-Pesa)', detail: 'Receive directly to your Safaricom M-Pesa wallet', time: 'Instant • Most popular', fee: 'Free' },
  { id: 'bank', icon: <Building2 size={22} />, title: 'Bank Account', detail: 'Deposit to any Kenyan bank account', time: '1-2 hours', fee: 'Free' },
  { id: 'wallet', icon: <WalletCards size={22} />, title: 'SwiftSend Wallet', detail: 'Hold funds in your SwiftSend wallet for easy transfers', time: 'Instant', fee: 'Free' },
];

const ReceiveMoney = () => {
  const { user } = useAuth();
  const [selected, setSelected] = useState('mobile');
  const [copied, setCopied] = useState(false);
  const receiveId = user?.email ? `SS-${user.email.slice(0,3).toUpperCase()}-${Math.floor(Math.random()*900)+100}-KE` : 'SS-994-218-KE';
  const copy = () => { navigator.clipboard?.writeText(receiveId); setCopied(true); setTimeout(() => setCopied(false), 1600); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/20">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e7faf3] px-4 py-2 text-sm font-semibold text-[#087869] mb-6"><ArrowDownLeft size={16} /> Receive Money</div>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-slate-950">Get paid from anywhere in the world</h1>
          <p className="mt-6 text-xl leading-9 text-slate-600">Share your details with senders abroad. We'll handle the conversion to KES and deliver it how you want.</p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-900/5 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-[#0f766e] p-6 lg:p-8 text-white">
              <h2 className="text-2xl font-bold">Choose How You Want To Receive</h2>
              <p className="mt-2 text-slate-200">Select your preferred payout method for incoming transfers</p>
            </div>
            <div className="p-6 lg:p-8 space-y-3">
              {options.map((option) => (
                <button key={option.id} onClick={() => setSelected(option.id)} className={`w-full flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all ${selected === option.id ? 'border-[#0f766e] bg-gradient-to-r from-emerald-50 to-cyan-50 shadow-lg shadow-emerald-900/5' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${selected === option.id ? 'bg-gradient-to-br from-[#0f766e] to-[#22d3ee] text-white' : 'bg-slate-100 text-slate-600'}`}>{option.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-bold text-slate-900">{option.title}</span>
                    <span className="mt-1 block text-sm text-slate-600">{option.detail}</span>
                  </span>
                  <div className="text-right hidden sm:block">
                    <span className="block text-xs font-semibold text-[#087869]">{option.time}</span>
                    <span className="mt-1 block text-xs text-slate-500">{option.fee}</span>
                  </div>
                  {selected === option.id && <CheckCircle2 className="text-[#0f766e] shrink-0" size={24} />}
                </button>
              ))}
              <div className="pt-4">
                <Link to="/send" className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0f766e] to-[#0b645e] py-4 text-white font-bold shadow-xl shadow-teal-900/20 hover:shadow-2xl hover:scale-[1.01] transition">
                  <Download size={20} /> Request Payment <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#102522] to-[#0f766e] rounded-3xl p-6 lg:p-8 text-white shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 text-[#83e5c8]"><BadgeCheck size={24} /></span>
                <Globe2 className="text-white/40" size={32} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Your Receive Details</h2>
              <p className="mt-3 leading-7 text-white/80">Share this ID with anyone sending you money via SwiftSend</p>
              <div className="mt-6 rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-[#8be3c9] mb-2">SwiftSend Receive ID</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xl lg:text-2xl font-bold tracking-wider">{receiveId}</span>
                  <button onClick={copy} className="rounded-xl bg-white/10 p-3 text-white hover:bg-white/20 transition" aria-label="Copy">{copied ? <CheckCircle2 size={20} className="text-[#83e5c8]" /> : <Copy size={20} />}</button>
                </div>
                {copied && <p className="mt-2 text-sm text-[#83e5c8]">Copied to clipboard!</p>}
              </div>
              <div className="mt-6 space-y-3 text-sm">
                <p className="flex items-center gap-2"><CheckCircle2 size={18} className="text-[#83e5c8] shrink-0" /> Zero fees to receive</p>
                <p className="flex items-center gap-2"><CheckCircle2 size={18} className="text-[#83e5c8] shrink-0" /> Real-time notifications</p>
                <p className="flex items-center gap-2"><CheckCircle2 size={18} className="text-[#83e5c8] shrink-0" /> Secure and encrypted</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-900/5 p-6">
              <h3 className="font-bold text-lg text-slate-900 mb-4">How It Works</h3>
              <div className="space-y-4">
                <div className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e7faf3] text-[#087869] font-bold text-sm">1</span><div><p className="font-semibold text-slate-900">Share your ID</p><p className="text-sm text-slate-600">Send your receive details to the sender</p></div></div>
                <div className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e7faf3] text-[#087869] font-bold text-sm">2</span><div><p className="font-semibold text-slate-900">They send money</p><p className="text-sm text-slate-600">From UK, US, or UAE to your ID</p></div></div>
                <div className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e7faf3] text-[#087869] font-bold text-sm">3</span><div><p className="font-semibold text-slate-900">Get paid</p><p className="text-sm text-slate-600">Money arrives in your chosen method</p></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiveMoney;
