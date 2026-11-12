import { useState } from 'react';
import { ArrowDownToLine, Banknote, CheckCircle2, CreditCard, LoaderCircle, Smartphone, Wallet } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const Withdraw = () => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank');
  const [accountDetails, setAccountDetails] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { authFetch } = useAuth();

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSuccess(false);

    try {
      const response = await authFetch('/api/withdrawals/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method, account_details: accountDetails }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        setMessage('Withdrawal request submitted successfully! We will process it within 24 hours.');
        setAmount('');
        setAccountDetails('');
      } else {
        setMessage(data.error || data.detail || 'Something went wrong.');
      }
    } catch {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/20">
      <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 mb-4"><ArrowDownToLine size={16} /> Withdraw Funds</div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">Cash Out Your Balance</h1>
          <p className="mt-3 text-lg text-slate-600">Transfer your funds to bank, mobile money, or crypto wallet</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_.9fr] gap-8">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-orange-600 p-6 text-white">
              <h2 className="text-xl font-bold">Withdrawal Request</h2>
              <p className="text-sm text-slate-200 mt-1">Complete the form below</p>
            </div>
            <form onSubmit={handleWithdraw} className="p-6 lg:p-8 space-y-6">
              {message && (
                <div className={`rounded-xl p-4 text-sm flex items-start gap-3 ${success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                  {success ? <CheckCircle2 size={20} className="shrink-0 mt-0.5" /> : <Banknote size={20} className="shrink-0 mt-0.5" />}
                  <span>{message}</span>
                </div>
              )}

              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700">Withdrawal Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">$</span>
                  <input type="number" className="w-full pl-10 pr-4 py-4 text-2xl font-bold rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" min="1" step="0.01" required />
                </div>
              </div>

              <div>
                <label className="block mb-3 text-sm font-semibold text-slate-700">Select Withdrawal Method</label>
                <div className="grid gap-3">
                  <button type="button" onClick={() => setMethod('bank')} className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition ${method === 'bank' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className={`grid h-10 w-10 place-items-center rounded-lg ${method === 'bank' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}><Banknote size={20} /></div>
                    <div className="flex-1"><p className="font-semibold text-slate-900">Bank Transfer</p><p className="text-xs text-slate-500">1-2 business days</p></div>
                    {method === 'bank' && <CheckCircle2 className="text-orange-600" size={20} />}
                  </button>
                  <button type="button" onClick={() => setMethod('mobile')} className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition ${method === 'mobile' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className={`grid h-10 w-10 place-items-center rounded-lg ${method === 'mobile' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}><Smartphone size={20} /></div>
                    <div className="flex-1"><p className="font-semibold text-slate-900">Mobile Money</p><p className="text-xs text-slate-500">Instant - 30 mins</p></div>
                    {method === 'mobile' && <CheckCircle2 className="text-orange-600" size={20} />}
                  </button>
                  <button type="button" onClick={() => setMethod('crypto')} className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition ${method === 'crypto' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className={`grid h-10 w-10 place-items-center rounded-lg ${method === 'crypto' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}><Wallet size={20} /></div>
                    <div className="flex-1"><p className="font-semibold text-slate-900">Cryptocurrency</p><p className="text-xs text-slate-500">10-30 minutes</p></div>
                    {method === 'crypto' && <CheckCircle2 className="text-orange-600" size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700">Account Details</label>
                <textarea className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition" rows="3" value={accountDetails} onChange={(e) => setAccountDetails(e.target.value)} placeholder={method === 'bank' ? 'Bank name, Account number, Routing/IBAN' : method === 'mobile' ? 'Mobile number (e.g., +254...)' : 'Wallet address (e.g., Stellar address)'} required />
              </div>

              <button type="submit" disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-orange-600 to-red-600 py-4 text-white font-bold text-lg shadow-xl shadow-orange-900/20 hover:shadow-2xl hover:scale-[1.01] transition disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><LoaderCircle size={22} className="animate-spin" /> Processing...</> : <>Request Withdrawal <ArrowDownToLine size={22} /></>}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-orange-700 rounded-3xl p-6 text-white">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><CreditCard size={20} /> Available Balance</h3>
              <p className="text-4xl font-bold">$2,840.50</p>
              <p className="text-sm text-white/70 mt-2">Ready to withdraw</p>
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6">
              <h3 className="font-bold text-lg text-slate-900 mb-4">Withdrawal Info</h3>
              <div className="space-y-3 text-sm text-slate-600">
                <p className="flex items-start gap-2"><CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" /> Minimum withdrawal: $10.00</p>
                <p className="flex items-start gap-2"><CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" /> Processing fees may apply</p>
                <p className="flex items-start gap-2"><CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" /> Requests processed Mon-Fri</p>
                <p className="flex items-start gap-2"><CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" /> ID verification may be required for large amounts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;
