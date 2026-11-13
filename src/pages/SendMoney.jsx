import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpDown, CheckCircle2, Globe2, Info, LoaderCircle, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { apiUrl, getApiErrorMessage } from '../auth/api';

const sendCountries = [
  { code: 'GB', label: 'United Kingdom', currency: 'GBP', flag: '🇬🇧', corridor: 'UK-KE' },
  { code: 'US', label: 'United States', currency: 'USD', flag: '🇺🇸', corridor: 'US-KE' },
  { code: 'AE', label: 'United Arab Emirates', currency: 'AED', flag: '🇦🇪', corridor: 'AE-KE' },
];

const SendMoney = () => {
  const { authFetch } = useAuth();
  const [senderCountry, setSenderCountry] = useState('US');
  const [corridors, setCorridors] = useState([]);
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState('');
  const [quoting, setQuoting] = useState(false);
  const [form, setForm] = useState({
    sender_name: '', sender_contact: '',
    recipient_name: '', recipient_contact: '', recipient_payout_method: 'mobile_money',
    send_amount: '100.00',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);

  const selected = useMemo(
    () => sendCountries.find((c) => c.code === senderCountry) || sendCountries[1],
    [senderCountry],
  );

  useEffect(() => {
    fetch(apiUrl('/api/corridors/?receive_country=KE'))
      .then((r) => r.json())
      .then((data) => setCorridors(Array.isArray(data) ? data : (data?.results || [])))
      .catch(() => setCorridors([]));
  }, []);

  useEffect(() => {
    const amount = form.send_amount;
    if (!amount || Number(amount) <= 0) { setQuote(null); return; }
    let cancelled = false;
    setQuoting(true);
    setQuoteError('');
    fetch(apiUrl('/api/corridors/quote/'), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ corridor: selected.corridor, send_amount: amount }),
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(getApiErrorMessage(data, 'Unable to get a quote.'));
        if (!cancelled) setQuote(data);
      })
      .catch((e) => { if (!cancelled) { setQuote(null); setQuoteError(e.message); } })
      .finally(() => { if (!cancelled) setQuoting(false); });
    return () => { cancelled = true; };
  }, [form.send_amount, selected.corridor]);

  const corridorInfo = corridors.find((c) => c.code === selected.corridor);
  const update = (key) => (e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setError(''); };

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setSubmitting(true);
    try {
      const response = await authFetch('/api/remittances/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          corridor: selected.corridor, channel: 'web',
          sender_name: form.sender_name, sender_contact: form.sender_contact, sender_country: senderCountry,
          recipient_name: form.recipient_name, recipient_contact: form.recipient_contact,
          recipient_country: 'KE', recipient_payout_method: form.recipient_payout_method,
          send_amount: form.send_amount,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(getApiErrorMessage(data, 'Unable to create the remittance.'));
      setCreated(data);
    } catch (err) {
      setError(err.message || 'Unable to create the remittance.');
    } finally {
      setSubmitting(false);
    }
  };

  if (created) {
    return (
      <div className="min-h-full rounded-2xl bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 border border-emerald-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#0f766e] to-[#22d3ee] p-8 text-white text-center">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-white/20 backdrop-blur"><CheckCircle2 size={32} /></div>
              <h2 className="text-3xl font-bold tracking-tight">Transfer Created Successfully</h2>
              <p className="mt-2 text-emerald-50">Your money is on its way to Kenya</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500 uppercase tracking-wide">Reference</p><p className="mt-1 font-mono font-bold text-slate-900">{created.reference}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500 uppercase tracking-wide">Status</p><p className="mt-1 font-semibold capitalize text-amber-700">{created.status.replace(/_/g, ' ')}</p></div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-6 space-y-3">
                <div className="flex justify-between"><span className="text-slate-600">You send</span><span className="font-semibold">{created.send_amount} {created.send_currency}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Fee</span><span className="font-semibold">{created.fee_amount} {created.send_currency}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Exchange rate</span><span className="font-semibold">1 {created.send_currency} = {created.exchange_rate} KES</span></div>
                <div className="border-t pt-3 flex justify-between text-lg"><span className="font-semibold">Recipient gets</span><span className="font-bold text-[#0f766e]">{created.receive_amount} {created.receive_currency}</span></div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to={`/track?ref=${encodeURIComponent(created.reference)}`} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0f766e] to-[#0b645e] px-6 py-3 text-white font-semibold shadow-lg shadow-teal-900/20 hover:shadow-xl transition"><ArrowRight size={18} /> Track & Validate</Link>
                <button onClick={() => { setCreated(null); setQuote(null); }} className="flex-1 rounded-xl border-2 border-slate-200 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition">Send Another</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full rounded-2xl bg-gradient-to-br from-slate-50 via-white to-cyan-50/20">
      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8 lg:py-16">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e7faf3] px-4 py-2 text-sm font-semibold text-[#087869] mb-4"><Zap size={16} /> Fast • Secure • Affordable</div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">Send Money to Kenya</h1>
          <p className="mt-3 text-lg text-slate-600">UK • USA • UAE → Kenya with live rates and instant tracking</p>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-8 items-start">
          <form onSubmit={submit} className="bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-[#0f766e] p-6 text-white">
              <h2 className="text-xl font-bold">Transfer Details</h2>
              <p className="text-sm text-slate-200 mt-1">Fill in the details below</p>
            </div>
            <div className="p-6 lg:p-8 space-y-6">
              {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">{error}</div>}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-700">Sending From</label>
                  <select value={senderCountry} onChange={(e) => setSenderCountry(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#0f766e] focus:ring-4 focus:ring-emerald-50 transition">
                    {sendCountries.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.label} ({c.currency})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-700">Receiving In</label>
                  <div className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-700 font-medium">🇰🇪 Kenya (KES)</div>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700">Amount to Send ({selected.currency})</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">{selected.currency}</span>
                  <input type="number" min="0.01" step="0.01" value={form.send_amount} onChange={update('send_amount')} className="w-full pl-12 pr-4 py-4 text-2xl font-bold rounded-xl border-2 border-slate-200 focus:border-[#0f766e] focus:ring-4 focus:ring-emerald-50 transition" required />
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-bold text-slate-900">Sender Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <input placeholder="Full Name" value={form.sender_name} onChange={update('sender_name')} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#0f766e] focus:ring-4 focus:ring-emerald-50 transition" required />
                  <input placeholder="Email or Phone" value={form.sender_contact} onChange={update('sender_contact')} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#0f766e] focus:ring-4 focus:ring-emerald-50 transition" />
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-bold text-slate-900">Recipient Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <input placeholder="Recipient Full Name" value={form.recipient_name} onChange={update('recipient_name')} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#0f766e] focus:ring-4 focus:ring-emerald-50 transition" required />
                  <input placeholder="+254 7XX XXX XXX" value={form.recipient_contact} onChange={update('recipient_contact')} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#0f766e] focus:ring-4 focus:ring-emerald-50 transition" required />
                </div>
                <select value={form.recipient_payout_method} onChange={update('recipient_payout_method')} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#0f766e] focus:ring-4 focus:ring-emerald-50 transition">
                  <option value="mobile_money">📱 Mobile Money (M-Pesa)</option>
                  <option value="bank">🏦 Bank Transfer</option>
                </select>
              </div>

              <button type="submit" disabled={submitting || !quote} className="w-full rounded-xl bg-gradient-to-r from-[#0f766e] to-[#0b645e] py-4 text-white font-bold text-lg shadow-xl shadow-teal-900/20 hover:shadow-2xl hover:scale-[1.01] transition disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2">
                {submitting ? <><LoaderCircle size={22} className="animate-spin" /> Processing...</> : <>Send Money Now <ArrowRight size={22} /></>}
              </button>
            </div>
          </form>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 p-6 border-b border-emerald-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Globe2 className="text-[#0f766e]" size={20} /> Live Exchange Rate</h3>
                  {quoting && <LoaderCircle size={18} className="animate-spin text-[#0f766e]" />}
                </div>
              </div>
              <div className="p-6">
                {quoteError && <p className="text-sm text-rose-700 mb-4">{quoteError}</p>}
                {quote ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <p className="text-2xl font-bold">{quote.send_amount}</p>
                        <p className="text-sm text-slate-500">{quote.send_currency}</p>
                      </div>
                      <ArrowUpDown className="text-[#0f766e]" />
                      <div className="text-center flex-1">
                        <p className="text-2xl font-bold text-[#0f766e]">{quote.receive_amount}</p>
                        <p className="text-sm text-slate-500">{quote.receive_currency}</p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-slate-600">Transfer fee</span><span className="font-semibold">{quote.fee_amount} {quote.fee_currency}</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">Exchange rate</span><span className="font-semibold">1 {quote.send_currency} = {quote.exchange_rate} KES</span></div>
                      <div className="flex justify-between pt-2 border-t"><span className="font-semibold">Total cost</span><span className="font-bold">{(Number(quote.send_amount) + Number(quote.fee_amount)).toFixed(2)} {quote.send_currency}</span></div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">Enter amount to see live quote</p>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#102522] to-[#0f766e] rounded-3xl p-6 text-white">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><ShieldCheck size={20} /> Why Send with SwiftSend</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3"><div className="grid h-8 w-8 place-items-center rounded-lg bg-white/10"><Zap size={16} /></div><div><p className="font-semibold">Fast Delivery</p><p className="text-white/70">Money arrives in minutes</p></div></div>
                <div className="flex items-start gap-3"><div className="grid h-8 w-8 place-items-center rounded-lg bg-white/10"><ShieldCheck size={16} /></div><div><p className="font-semibold">Secure & Trusted</p><p className="text-white/70">Bank-level encryption</p></div></div>
                <div className="flex items-start gap-3"><div className="grid h-8 w-8 place-items-center rounded-lg bg-white/10"><Info size={16} /></div><div><p className="font-semibold">No Hidden Fees</p><p className="text-white/70">See exact costs upfront</p></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendMoney;
