import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, Eye, EyeOff, Plus, Send, ShieldCheck, WalletCards } from 'lucide-react';

const Wallet = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [balance] = useState(420.5); // In USD (demo)
  const [transactions] = useState([
    { id: 'TXN1001', type: 'Credit', title: 'Wallet funded', amount: 150, date: '2025-05-06', status: 'Success' },
    { id: 'TXN1000', type: 'Debit', title: 'Sent to Kenya', amount: 80, date: '2025-05-04', status: 'Success' },
    { id: 'TXN0999', type: 'Debit', title: 'Withdrawal request', amount: 50, date: '2025-05-03', status: 'Pending' },
  ]);

  const statusStyles = {
    Success: 'bg-emerald-100 text-emerald-700',
    Pending: 'bg-stellar-yellow/20 text-stellar-black ring-1 ring-stellar-yellow/60',
    Failed: 'bg-red-100 text-red-700',
  };

  const totals = useMemo(() => {
    const incoming = transactions.filter((t) => t.type === 'Credit').reduce((sum, t) => sum + t.amount, 0);
    const outgoing = transactions.filter((t) => t.type === 'Debit').reduce((sum, t) => sum + t.amount, 0);
    return { incoming, outgoing };
  }, [transactions]);

  return (
    <div className="min-h-full space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-stellar-black via-swift-navy to-stellar-teal p-5 text-white shadow-lg sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-stellar-yellow"><WalletCards size={14} /> SwiftSend Wallet</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Manage your balance</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-200 sm:text-base">Hold funds, fund transfers, and move money out with a Stellar-inspired, SwiftSend-simple experience.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowBalance((v) => !v)}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
            aria-label={showBalance ? 'Hide balance' : 'Show balance'}
          >
            {showBalance ? <EyeOff size={16} /> : <Eye size={16} />} {showBalance ? 'Hide' : 'Show'} balance
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur sm:p-5">
            <p className="text-sm text-slate-200">Available balance</p>
            <p className="mt-1 text-4xl font-extrabold tracking-tight">{showBalance ? `$${balance.toFixed(2)}` : '••••••'}</p>
            <p className="mt-1 text-xs text-slate-300">USD • Demo wallet view</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/send" className="inline-flex items-center gap-2 rounded-xl bg-stellar-yellow px-4 py-2.5 text-sm font-bold text-stellar-black hover:bg-yellow-300"><Send size={15} /> Send</Link>
              <Link to="/withdraw" className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20"><ArrowUpRight size={15} /> Withdraw</Link>
              <Link to="/receive" className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20"><ArrowDownLeft size={15} /> Receive</Link>
            </div>
          </div>
          <div className="grid gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">Money in</p>
              <p className="mt-1 text-xl font-extrabold text-stellar-yellow">+${totals.incoming.toFixed(2)}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">Money out</p>
              <p className="mt-1 text-xl font-extrabold text-white">-${totals.outgoing.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold tracking-tight text-stellar-black sm:text-xl">Recent activity</h2>
            <Link to="/history" className="text-sm font-semibold text-swift-blue hover:text-stellar-teal">View all</Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {transactions.map((txn) => (
              <li key={txn.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${txn.type === 'Credit' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-stellar-black'}`}>
                    {txn.type === 'Credit' ? <Plus size={16} /> : <ArrowUpRight size={16} />}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{txn.title}</p>
                    <p className="text-xs text-slate-500">{txn.date} • {txn.id}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-extrabold ${txn.type === 'Credit' ? 'text-emerald-700' : 'text-slate-900'}`}>{txn.type === 'Credit' ? '+' : '-'}${txn.amount.toFixed(2)}</p>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusStyles[txn.status] || 'bg-slate-100 text-slate-700'}`}>{txn.status}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-extrabold text-stellar-black">Quick actions</h2>
            <div className="mt-4 grid grid-cols-1 gap-2">
              <Link to="/send" className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 hover:border-stellar-teal/40 hover:bg-stellar-offwhite"><span className="inline-flex items-center gap-2"><Send size={16} className="text-swift-blue" /> Start a transfer</span><span>→</span></Link>
              <Link to="/receive" className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 hover:border-stellar-teal/40 hover:bg-stellar-offwhite"><span className="inline-flex items-center gap-2"><ArrowDownLeft size={16} className="text-stellar-teal" /> Receive money</span><span>→</span></Link>
              <Link to="/withdraw" className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 hover:border-stellar-teal/40 hover:bg-stellar-offwhite"><span className="inline-flex items-center gap-2"><ArrowUpRight size={16} className="text-stellar-black" /> Withdraw funds</span><span>→</span></Link>
            </div>
          </div>
          <div className="rounded-2xl border border-stellar-yellow/40 bg-stellar-offwhite p-5 shadow-sm">
            <p className="inline-flex items-center gap-2 text-sm font-bold text-stellar-black"><ShieldCheck size={16} className="text-stellar-teal" /> Wallet notes</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>• Balances and activity shown here are a demo view in this build.</li>
              <li>• Use Send, Receive, and Withdraw to access live transfer flows.</li>
              <li>• Blended with Stellar’s high-contrast, trust-first visual language.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Wallet;
