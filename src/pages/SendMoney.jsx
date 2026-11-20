import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpDown, Check, CheckCircle2, CircleHelp, Globe2, LoaderCircle, LockKeyhole, ShieldCheck, Smartphone } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { apiUrl, getApiErrorMessage } from '../auth/api';

const sendCountries = [
  { code: 'GB', label: 'United Kingdom', currency: 'GBP', flag: '🇬🇧', corridor: 'UK-KE' },
  { code: 'US', label: 'United States', currency: 'USD', flag: '🇺🇸', corridor: 'US-KE' },
  { code: 'AE', label: 'United Arab Emirates', currency: 'AED', flag: '🇦🇪', corridor: 'AE-KE' },
];
const steps = ['Transfer', 'Recipient', 'Review'];
const inputClass = 'ss-input min-h-[50px] text-sm';
const fieldLabel = 'mb-2 block text-xs font-bold tracking-wide';

const SendMoney = () => {
  const { authFetch } = useAuth();
  const [senderCountry, setSenderCountry] = useState('US');
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState('');
  const [quoting, setQuoting] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    sender_name: '', sender_contact: '',
    recipient_name: '', recipient_contact: '', recipient_payout_method: 'mobile_money',
    send_amount: '100.00',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);

  const selected = useMemo(
    () => sendCountries.find((country) => country.code === senderCountry) || sendCountries[1],
    [senderCountry],
  );

  useEffect(() => {
    const amount = form.send_amount;
    if (!amount || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      setQuote(null);
      setQuoteError('');
      setQuoting(false);
      return undefined;
    }
    let cancelled = false;
    const controller = new AbortController();
    setQuoting(true);
    setQuote(null);
    setQuoteError('');
    fetch(apiUrl('/api/corridors/quote/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ corridor: selected.corridor, send_amount: amount }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(getApiErrorMessage(data, 'Unable to get a quote.'));
        if (!cancelled) setQuote(data);
      })
      .catch((err) => {
        if (!cancelled && err.name !== 'AbortError') {
          setQuote(null);
          setQuoteError(err.message || 'Unable to get a quote.');
        }
      })
      .finally(() => { if (!cancelled) setQuoting(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [form.send_amount, selected.corridor]);

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setError('');
  };
  const canContinue = step === 0
    ? Boolean(quote && !quoting && Number(form.send_amount) > 0)
    : step === 1
      ? Boolean(form.sender_name.trim() && form.recipient_name.trim() && form.recipient_contact.trim())
      : true;

  const submit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const response = await authFetch('/api/remittances/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      <div className="mx-auto max-w-2xl py-3 sm:py-8">
        <section className="ss-surface overflow-hidden rounded-[28px]">
          <div className="px-5 py-9 text-center sm:px-10" style={{ background: 'linear-gradient(135deg,#f1cf72,#e4b638)', color: '#17140c' }}>
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-black/10 bg-white/30"><CheckCircle2 size={32}/></span>
            <p className="mt-5 text-[10px] font-black uppercase tracking-[.2em]">SwiftSend transfer</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Transfer created</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm font-medium text-black/65">Your transfer request has been created. Follow its status using your reference.</p>
          </div>
          <div className="space-y-5 p-4 sm:p-7">
            <div className="rounded-2xl p-4" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Transfer reference</p>
              <p className="mt-1 break-all font-mono text-lg font-extrabold">{created.reference || 'Reference pending'}</p>
              <p className="mt-2 text-xs capitalize" style={{ color: 'var(--muted)' }}>Status: {(created.status || 'created').replace(/_/g, ' ')}</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-3"><span style={{ color: 'var(--muted)' }}>You send</span><b>{created.send_amount} {created.send_currency}</b></div>
              <div className="flex justify-between gap-3"><span style={{ color: 'var(--muted)' }}>Transfer fee</span><b>{created.fee_amount} {created.send_currency}</b></div>
              <div className="flex justify-between gap-3"><span style={{ color: 'var(--muted)' }}>Exchange rate</span><b className="text-right">1 {created.send_currency} = {created.exchange_rate} {created.receive_currency}</b></div>
              <div className="flex justify-between gap-3 border-t pt-3 text-base" style={{ borderColor: 'var(--border)' }}><b>Recipient gets</b><b style={{ color: 'var(--accent-strong)' }}>{created.receive_amount} {created.receive_currency}</b></div>
            </div>
            <Link to={created.reference ? `/track?ref=${encodeURIComponent(created.reference)}` : '/history'} className="ss-press ss-primary min-h-12 w-full">Track transfer <ArrowRight size={17}/></Link>
            <button type="button" onClick={() => { setCreated(null); setQuote(null); setStep(0); setForm((current) => ({ ...current, recipient_name: '', recipient_contact: '' })); }} className="ss-press w-full rounded-xl border px-4 py-3 text-sm font-bold transition active:scale-[.98]" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>Start another transfer</button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 sm:space-y-7">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.15em]" style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}><Globe2 size={13}/> Cross-border transfers</span>
          <h2 className="ss-title mt-3 text-2xl font-black tracking-tight sm:text-3xl">Send money, simply.</h2>
          <p className="ss-copy mt-1 max-w-xl text-sm">A few simple steps. Review the exchange rate and fees before creating your transfer.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--muted)' }}><ShieldCheck size={16} style={{ color: 'var(--accent-strong)' }}/> Secure transfer flow</div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <section key={step} className="ss-surface ss-enter overflow-hidden rounded-[24px]">
          <div className="px-4 pb-5 pt-5 sm:px-6" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-extrabold">Transfer setup</p>
              <p className="text-[11px] font-bold" style={{ color: 'var(--muted)' }}>STEP {step + 1} OF 3</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {steps.map((label, index) => (
                <button key={label} type="button" onClick={() => setStep(index)} className="ss-pill flex flex-col gap-2 rounded-xl px-1 py-2 transition active:scale-[.96]" aria-label={`Jump to step ${index + 1}: ${label}`} aria-current={step === index ? 'step' : undefined}>
                  <div className="h-1.5 overflow-hidden rounded-full" style={{ background: index <= step ? 'var(--accent)' : 'var(--surface-muted)' }} />
                  <p className="text-[10px] font-bold sm:text-xs" style={{ color: index === step ? 'var(--text)' : 'var(--muted)' }}>{index + 1}. {label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5 p-4 sm:p-6">
            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            {step === 0 && <>
              <div>
                <h3 className="text-lg font-black">Where are you sending from?</h3>
                <p className="ss-copy mt-1 text-xs">Choose one of the currently configured Kenya receiving corridors.</p>
              </div>
              <div>
                <label htmlFor="sender-country" className={fieldLabel}>Sending from</label>
                <select id="sender-country" value={senderCountry} onChange={(event) => setSenderCountry(event.target.value)} className={inputClass}>
                  {sendCountries.map((country) => <option key={country.code} value={country.code}>{country.flag} {country.label} ({country.currency})</option>)}
                </select>
              </div>
              <div className="rounded-2xl p-4" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between gap-3">
                  <div><p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Sending to</p><p className="mt-1 text-sm font-extrabold">🇰🇪 Kenya <span className="font-medium" style={{ color: 'var(--muted)' }}>· KES</span></p></div>
                  <ArrowUpDown size={18} style={{ color: 'var(--accent-strong)' }}/>
                  <div className="text-right"><p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Corridor</p><p className="mt-1 text-sm font-extrabold">{selected.corridor}</p></div>
                </div>
              </div>
              <div>
                <label htmlFor="send-amount" className={fieldLabel}>How much would you like to send?</label>
                <div className="flex items-center rounded-2xl border-2 px-4 py-2 transition focus-within:border-[var(--accent)]" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                  <span className="mr-3 text-xs font-black" style={{ color: 'var(--muted)' }}>{selected.currency}</span>
                  <input id="send-amount" type="number" min="0.01" step="0.01" inputMode="decimal" value={form.send_amount} onChange={update('send_amount')} className="w-full min-w-0 bg-transparent py-2 text-3xl font-black tracking-tight outline-none" style={{ color: 'var(--text)' }} required/>
                </div>
              </div>
              {quoteError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{quoteError}</p>}
              {quoting && <p className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--muted)' }}><LoaderCircle size={14} className="animate-spin"/> Getting your quote…</p>}
              {quote && <div className="ss-enter rounded-2xl p-4" style={{ background: 'var(--accent-soft)', border: '1px solid color-mix(in srgb,var(--accent) 45%,transparent)' }}>
                <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--accent-strong)' }}>Recipient receives</p>
                <p className="mt-1 text-2xl font-black tracking-tight">{quote.receive_amount} <span className="text-sm">{quote.receive_currency}</span></p>
                <p className="mt-1 text-[11px]" style={{ color: 'var(--muted)' }}>Quote from the SwiftSend transfer service</p>
              </div>}
            </>}

            {step === 1 && <>
              <div><h3 className="text-lg font-black">Who is sending and receiving?</h3><p className="ss-copy mt-1 text-xs">Enter the details needed to create this transfer.</p></div>
              <div className="space-y-3">
                <p className="text-[10px] font-extrabold uppercase tracking-[.16em]" style={{ color: 'var(--accent-strong)' }}>Your details</p>
                <div><label htmlFor="sender-name" className={fieldLabel}>Your full name</label><input id="sender-name" autoComplete="name" value={form.sender_name} onChange={update('sender_name')} className={inputClass} placeholder="Enter your full name" required/></div>
                <div><label htmlFor="sender-contact" className={fieldLabel}>Your email or phone <span className="font-normal" style={{ color: 'var(--muted)' }}>(optional)</span></label><input id="sender-contact" autoComplete="email" value={form.sender_contact} onChange={update('sender_contact')} className={inputClass} placeholder="Email address or phone number"/></div>
              </div>
              <div className="space-y-3 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                <p className="text-[10px] font-extrabold uppercase tracking-[.16em]" style={{ color: 'var(--accent-strong)' }}>Recipient in Kenya</p>
                <div><label htmlFor="recipient-name" className={fieldLabel}>Recipient full name</label><input id="recipient-name" autoComplete="name" value={form.recipient_name} onChange={update('recipient_name')} className={inputClass} placeholder="Name as registered with provider" required/></div>
                <div><label htmlFor="recipient-contact" className={fieldLabel}>Recipient phone number</label><input id="recipient-contact" autoComplete="tel" inputMode="tel" value={form.recipient_contact} onChange={update('recipient_contact')} className={inputClass} placeholder="+254 7XX XXX XXX" required/></div>
                <div><label htmlFor="payout-method" className={fieldLabel}>How should they receive the money?</label><select id="payout-method" value={form.recipient_payout_method} onChange={update('recipient_payout_method')} className={inputClass}><option value="mobile_money">Mobile Money (M-Pesa)</option><option value="bank">Bank transfer</option></select></div>
              </div>
            </>}

            {step === 2 && <>
              <div><h3 className="text-lg font-black">Review your transfer</h3><p className="ss-copy mt-1 text-xs">Check the details carefully before creating your transfer.</p></div>
              <div className="rounded-2xl p-4" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
                <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Transfer route</p>
                <div className="mt-3 flex items-center justify-between gap-3"><div><p className="text-sm font-black">{selected.flag} {selected.label}</p><p className="text-xs" style={{ color: 'var(--muted)' }}>{quote?.send_currency || selected.currency}</p></div><ArrowRight size={18} style={{ color: 'var(--accent-strong)' }}/><div className="text-right"><p className="text-sm font-black">🇰🇪 Kenya</p><p className="text-xs" style={{ color: 'var(--muted)' }}>{quote?.receive_currency || 'KES'}</p></div></div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between gap-3 text-sm"><span style={{ color: 'var(--muted)' }}>You send</span><b>{quote?.send_amount} {quote?.send_currency}</b></div>
                <div className="flex justify-between gap-3 text-sm"><span style={{ color: 'var(--muted)' }}>Transfer fee</span><b>{quote?.fee_amount} {quote?.fee_currency || quote?.send_currency}</b></div>
                <div className="flex justify-between gap-3 text-sm"><span style={{ color: 'var(--muted)' }}>Exchange rate</span><b className="text-right">1 {quote?.send_currency} = {quote?.exchange_rate} {quote?.receive_currency}</b></div>
                <div className="flex justify-between gap-3 border-t pt-3 text-base" style={{ borderColor: 'var(--border)' }}><b>Recipient gets</b><b style={{ color: 'var(--accent-strong)' }}>{quote?.receive_amount} {quote?.receive_currency}</b></div>
              </div>
              <div className="rounded-2xl p-4" style={{ background: 'var(--surface-muted)' }}>
                <div className="flex items-center gap-2"><Smartphone size={16} style={{ color: 'var(--accent-strong)' }}/><p className="text-sm font-extrabold">{form.recipient_name}</p></div>
                <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>{form.recipient_contact} · {form.recipient_payout_method === 'mobile_money' ? 'Mobile Money' : 'Bank transfer'}</p>
                <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>Sender: {form.sender_name}</p>
              </div>
              <p className="flex items-start gap-2 text-[11px] leading-5" style={{ color: 'var(--muted)' }}><LockKeyhole size={14} className="mt-0.5 shrink-0"/> Creating this request does not by itself confirm a payment or recipient payout. You can follow the recorded status from the tracking page.</p>
            </>}

            <div className="flex gap-2 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
              {step > 0 && <button type="button" onClick={() => { setError(''); setStep((current) => current - 1); }} className="ss-press inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition active:scale-[.98]" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}><ArrowLeft size={16}/> Back</button>}
              {step < 2 ? <button type="button" disabled={!canContinue} onClick={() => { setError(''); setStep((current) => current + 1); }} className="ss-press ss-primary min-h-12 flex-1 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45">Continue <ArrowRight size={17}/></button> : <button type="button" disabled={submitting || !quote} onClick={submit} className="ss-press ss-primary min-h-12 flex-1 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45">{submitting ? <><LoaderCircle size={17} className="animate-spin"/> Creating transfer…</> : <>Create transfer <Check size={17}/></>}</button>}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="ss-enter ss-surface rounded-[22px] p-4 sm:p-5">
            <div className="flex items-center justify-between"><h3 className="text-sm font-extrabold">Your quote</h3>{quoting&&<LoaderCircle size={15} className="animate-spin" style={{ color: 'var(--accent-strong)' }}/>}</div>
            {quote ? <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-3"><span className="text-xs" style={{ color: 'var(--muted)' }}>You send</span><b className="text-sm">{quote.send_amount} {quote.send_currency}</b></div>
              <div className="flex items-center justify-between gap-3"><span className="text-xs" style={{ color: 'var(--muted)' }}>Fee</span><b className="text-sm">{quote.fee_amount} {quote.fee_currency || quote.send_currency}</b></div>
              <div className="flex items-center justify-between gap-3"><span className="text-xs" style={{ color: 'var(--muted)' }}>Rate</span><b className="text-right text-xs">1 {quote.send_currency} = {quote.exchange_rate} {quote.receive_currency}</b></div>
              <div className="rounded-xl p-3" style={{ background: 'var(--accent-soft)' }}><p className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--accent-strong)' }}>Recipient gets</p><p className="mt-1 text-xl font-black">{quote.receive_amount} {quote.receive_currency}</p></div>
            </div> : <p className="ss-copy mt-3 text-xs leading-5">{quoteError || (quoting ? 'Calculating your quote…' : 'Enter an amount to see the transfer quote.')}</p>}
            <p className="ss-copy mt-3 text-[10px] leading-4">Amounts and fees are based on the quote returned by SwiftSend. Final transfer details are confirmed by the service.</p>
          </section>
          <section className="rounded-[22px] p-5 text-white" style={{ background: '#171717' }}>
            <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: '#e4b638', color: '#17140c' }}><ShieldCheck size={19}/></span>
            <h3 className="mt-4 text-base font-black">Know before you send</h3>
            <ul className="mt-3 space-y-3 text-xs leading-5 text-white/70">
              <li className="flex gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#e4b638]"/> Review fees and recipient amount before creating a transfer.</li>
              <li className="flex gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#e4b638]"/> Double-check the recipient&apos;s name and phone number.</li>
              <li className="flex gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#e4b638]"/> Use your transfer reference to check progress.</li>
            </ul>
          </section>
          <Link to="/help" className="flex items-center gap-2 rounded-xl border p-3 text-xs font-bold" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}><CircleHelp size={15}/> Need help with a transfer? <ArrowRight size={14} className="ml-auto"/></Link>
        </aside>
      </div>
    </div>
  );
};

export default SendMoney;
