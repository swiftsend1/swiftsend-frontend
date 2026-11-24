import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpDown, Check, CheckCircle2, CircleHelp, Globe2, LoaderCircle, LockKeyhole, Play, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { apiUrl, getApiErrorMessage } from '../auth/api';
import { getCurrentUserEmail, getDemoUsers, formatWalletAmount, isVerified, runDemoTransfer } from '../lib/wallet';

const transferCountries = [
  { code: 'KE', label: 'Kenya', currency: 'KES', flag: '🇰🇪' },
  { code: 'NG', label: 'Nigeria', currency: 'NGN', flag: '🇳🇬' },
  { code: 'US', label: 'United States', currency: 'USD', flag: '🇺🇸' },
  { code: 'UG', label: 'Uganda', currency: 'UGX', flag: '🇺🇬' },
  { code: 'GB', label: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
];
const steps = ['Transfer', 'Recipient', 'Review'];
const inputClass = 'ss-input min-h-[50px] text-sm';
const fieldLabel = 'mb-2 block text-xs font-bold tracking-wide';
const recipientMethods = [
  { value: 'mobile_money', label: 'Mobile money', summary: 'Recipient registered name, provider, and phone number' },
  { value: 'bank_account', label: 'Bank account', summary: 'Account holder name, bank name, and account number or IBAN' },
  { value: 'digital_wallet', label: 'Digital wallet', summary: 'Wallet address, network, asset, and memo when required' },
];
const providerOptions = ['MTN Mobile Money', 'Airtel Money', 'Orange Money', 'Safaricom'];
const requiredRecipientFields = {
  mobile_money: ['recipient_name', 'recipient_phone'],
  bank_account: ['recipient_name', 'recipient_account_number'],
  digital_wallet: ['recipient_wallet_address'],
};

const SendMoney = () => {
  const { user, authFetch } = useAuth();
  const verified = isVerified();
  const senderName = user?.name || user?.full_name || user?.email || '';
  const senderEmail = user?.email || '';
  const [testStatus, setTestStatus] = useState('');
  const [testRecipient, setTestRecipient] = useState(() => getDemoUsers().find((email) => email !== getCurrentUserEmail()) || getDemoUsers()[0] || '');
  const [senderCountry, setSenderCountry] = useState('US');
  const [recipientCountry, setRecipientCountry] = useState('KE');
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState('');
  const [quoting, setQuoting] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    recipient_method: 'mobile_money',
    recipient_name: '', recipient_provider: 'MTN Mobile Money', recipient_phone: '',
    recipient_bank_name: '', recipient_account_number: '', recipient_branch_swift: '',
    recipient_wallet_address: '', recipient_network: '', recipient_asset: '', recipient_memo: '',
    recipient_payout_method: 'mobile_money',
    send_amount: '100.00',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);

  const selected = useMemo(() => transferCountries.find((country) => country.code === senderCountry) || transferCountries[2], [senderCountry]);
  const recipient = useMemo(() => transferCountries.find((country) => country.code === recipientCountry) || transferCountries[0], [recipientCountry]);
  const corridor = `${senderCountry}-${recipientCountry}`;

  useEffect(() => {
    const amount = form.send_amount;
    if (senderCountry === recipientCountry) {
      setQuote(null);
      setQuoteError('Choose two different markets for a cross-border transfer.');
      setQuoting(false);
      return undefined;
    }
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
      body: JSON.stringify({ corridor, send_amount: amount }),
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
  }, [corridor, form.send_amount, recipientCountry, senderCountry]);

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setError('');
  };

  const runTestTransaction = () => {
    const amount = Number(form.send_amount) || 0;
    const recipientEmail = testRecipient.trim().toLowerCase();
    const senderEmail = getCurrentUserEmail();
    if (!senderEmail) { setTestStatus('Sign in to run a test transaction.'); return; }
    if (!recipientEmail) { setTestStatus('Select a recipient user to send test funds to.'); return; }
    if (recipientEmail === senderEmail) { setTestStatus('Choose a different user as the recipient.'); return; }
    if (!(amount > 0)) { setTestStatus('Enter a positive test amount.'); return; }
    const { senderBalance, recipientBalance, reference } = runDemoTransfer({ from: senderEmail, to: recipientEmail, amount });
    setTestStatus(`Test transaction completed — ${formatWalletAmount(amount)} transferred from ${senderEmail} to ${recipientEmail}. Your balance: ${formatWalletAmount(senderBalance)}, ${recipientEmail} balance: ${formatWalletAmount(recipientBalance)}. Reference: ${reference || 'demo'}`);
  };
  const canContinue = step === 0
    ? Boolean(quote && !quoting && Number(form.send_amount) > 0 && senderCountry !== recipientCountry)
    : step === 1
      ? (requiredRecipientFields[form.recipient_method] || []).every((key) => (form[key] || '').trim())
      : true;

  const submit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const response = await authFetch('/api/remittances/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          corridor, channel: 'web',
          sender_name: senderName, sender_contact: senderEmail, sender_country: senderCountry,
          recipient_method: form.recipient_method,
          recipient_name: form.recipient_name, recipient_provider: form.recipient_provider, recipient_phone: form.recipient_phone,
          recipient_bank_name: form.recipient_bank_name, recipient_account_number: form.recipient_account_number, recipient_branch_swift: form.recipient_branch_swift,
          recipient_wallet_address: form.recipient_wallet_address, recipient_network: form.recipient_network, recipient_asset: form.recipient_asset, recipient_memo: form.recipient_memo,
          recipient_country: recipientCountry, recipient_payout_method: form.recipient_payout_method,
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
            <button type="button" onClick={() => { setCreated(null); setQuote(null); setStep(0); setForm((current) => ({ ...current, recipient_name: '', recipient_phone: '', recipient_bank_name: '', recipient_account_number: '', recipient_branch_swift: '', recipient_wallet_address: '', recipient_network: '', recipient_asset: '', recipient_memo: '' })); }} className="ss-press w-full rounded-xl border px-4 py-3 text-sm font-bold transition active:scale-[.98]" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>Start another transfer</button>
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
          <p className="ss-copy mt-1 max-w-xl text-sm">Choose a launch market in either direction, then review the exchange rate and fees before creating your transfer.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--muted)' }}><ShieldCheck size={16} style={{ color: 'var(--accent-strong)' }}/> Secure transfer flow</div>
      </header>

      <section className="ss-surface rounded-[24px] p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold" style={{ color: 'var(--muted)' }}>Test transactions</p>
            <p className="mt-1 text-sm font-bold">Send test funds from one user who uses SwiftSend to another</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <select id="test-recipient" aria-label="Recipient user" value={testRecipient} onChange={(event) => setTestRecipient(event.target.value)} className="w-full rounded-xl border px-3 py-2.5 text-sm font-bold" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            {getDemoUsers().map((email) => <option key={email} value={email}>{email}</option>)}
          </select>
          <input id="test-amount" type="number" min="1" inputMode="decimal" value={form.send_amount} aria-label="Test amount" onChange={update('send_amount')} className="w-full rounded-xl border px-3 py-2.5 text-sm font-bold" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }} />
        </div>
        <button type="button" onClick={runTestTransaction} className="ss-press mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-extrabold transition active:scale-[.98]" style={{ borderColor: 'var(--accent)', background: 'var(--accent)', color: '#17140c' }}><Play size={13}/> Run test transaction</button>
        {testStatus && <p role="status" className="mt-3 inline-flex items-center gap-2 text-xs font-extrabold" style={{ color: 'var(--accent-strong)' }}><Check size={14}/> {testStatus}</p>}
      </section>

      {!verified && (
        <section className="ss-surface rounded-[24px] p-4 sm:p-6" aria-labelledby="send-verification-heading">
          <p className="text-xs font-extrabold" id="send-verification-heading">Account verification needed</p>
          <p className="ss-copy mt-2 text-sm">You need to be a verified user to send money. Verification is handled by the Kotani Pay integration when you connect your wallet.</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Link to="/wallet" className="ss-press inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[#17140c] transition hover:-translate-y-0.5">Connect wallet (Kotani)</Link>
            <Link to="/anchor-demo" className="ss-press inline-flex min-h-12 items-center gap-2 rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-bold transition hover:border-[var(--accent)]" style={{ color: 'var(--muted)' }}>Try the anchor demo flow</Link>
          </div>
        </section>
      )}

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
                <h3 className="text-lg font-black">Choose your transfer route</h3>
                <p className="ss-copy mt-1 text-xs">SwiftSend is starting with Kenya and East Africa, Nigeria, the US, and UK. Transfers can move in either direction between enabled markets.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><label htmlFor="sender-country" className={fieldLabel}>Sending from</label><select id="sender-country" value={senderCountry} onChange={(event) => setSenderCountry(event.target.value)} className={inputClass}>{transferCountries.map((country) => <option key={country.code} value={country.code}>{country.flag} {country.label} ({country.currency})</option>)}</select></div>
                <div><label htmlFor="recipient-country" className={fieldLabel}>Sending to</label><select id="recipient-country" value={recipientCountry} onChange={(event) => setRecipientCountry(event.target.value)} className={inputClass}>{transferCountries.map((country) => <option key={country.code} value={country.code}>{country.flag} {country.label} ({country.currency})</option>)}</select></div>
              </div>
              <div className="rounded-2xl p-4" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between gap-3">
                  <div><p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Route</p><p className="mt-1 text-sm font-extrabold">{selected.flag} {selected.label} <span className="font-medium" style={{ color: 'var(--muted)' }}>· {selected.currency}</span></p></div>
                  <ArrowUpDown size={18} style={{ color: 'var(--accent-strong)' }}/>
                  <div className="text-right"><p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Receiving in</p><p className="mt-1 text-sm font-extrabold">{recipient.flag} {recipient.label} <span className="font-medium" style={{ color: 'var(--muted)' }}>· {recipient.currency}</span></p></div>
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
              <div><h3 className="text-lg font-black">Recipient details</h3><p className="ss-copy mt-1 text-xs">We already have your details — just add the recipient details to create this transfer.</p></div>
              <div className="space-y-3">
                <p className="text-[10px] font-extrabold uppercase tracking-[.16em]" style={{ color: 'var(--accent-strong)' }}>Sending as</p>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
                  <p className="text-sm font-bold">{senderName}</p>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>{senderEmail}</p>
                </div>
              </div>
              <div className="space-y-3 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                <p className="text-[10px] font-extrabold uppercase tracking-[.16em]" style={{ color: 'var(--accent-strong)' }}>Recipient in {recipient.label}</p>
                <div><label htmlFor="recipient-method" className={fieldLabel}>Receiving method</label><select id="recipient-method" value={form.recipient_method} onChange={update('recipient_method')} className={inputClass}>{recipientMethods.map((method) => <option key={method.value} value={method.value}>{method.label} — {method.summary}</option>)}</select></div>

                {form.recipient_method === 'mobile_money' && <>
                  <div><label htmlFor="recipient-name" className={fieldLabel}>Recipient registered name</label><input id="recipient-name" autoComplete="name" value={form.recipient_name} onChange={update('recipient_name')} className={inputClass} placeholder="Full name" required/></div>
                  <div><label htmlFor="recipient-provider" className={fieldLabel}>Mobile money provider</label><select id="recipient-provider" value={form.recipient_provider} onChange={update('recipient_provider')} className={inputClass}>{providerOptions.map((provider) => <option key={provider} value={provider}>{provider}</option>)}</select></div>
                  <div><label htmlFor="recipient-phone" className={fieldLabel}>Phone number (with country code)</label><input id="recipient-phone" autoComplete="tel" inputMode="tel" value={form.recipient_phone} onChange={update('recipient_phone')} className={inputClass} placeholder="Enter phone number with country code" required/></div>
                </>}

                {form.recipient_method === 'bank_account' && <>
                  <div><label htmlFor="recipient-name" className={fieldLabel}>Account holder&apos;s name</label><input id="recipient-name" autoComplete="name" value={form.recipient_name} onChange={update('recipient_name')} className={inputClass} placeholder="Full name" required/></div>
                  <div><label htmlFor="recipient-bank" className={fieldLabel}>Bank name</label><input id="recipient-bank" autoComplete="off" value={form.recipient_bank_name} onChange={update('recipient_bank_name')} className={inputClass} placeholder="Bank or institution name" required/></div>
                  <div><label htmlFor="recipient-account" className={fieldLabel}>Account number or IBAN</label><input id="recipient-account" autoComplete="off" value={form.recipient_account_number} onChange={update('recipient_account_number')} className={inputClass} placeholder="Account number or IBAN" required/></div>
                  <div><label htmlFor="recipient-branch" className={fieldLabel}>Bank branch or SWIFT/BIC (where required)</label><input id="recipient-branch" autoComplete="off" value={form.recipient_branch_swift} onChange={update('recipient_branch_swift')} className={inputClass} placeholder="Branch or SWIFT/BIC"/></div>
                </>}

                {form.recipient_method === 'digital_wallet' && <>
                  <div><label htmlFor="recipient-address" className={fieldLabel}>Recipient wallet address</label><input id="recipient-address" autoComplete="off" value={form.recipient_wallet_address} onChange={update('recipient_wallet_address')} className={inputClass} placeholder="Wallet address" required/></div>
                  <div><label htmlFor="recipient-network" className={fieldLabel}>Blockchain / network</label><input id="recipient-network" autoComplete="off" value={form.recipient_network} onChange={update('recipient_network')} className={inputClass} placeholder="e.g. Stellar, Ethereum"/></div>
                  <div><label htmlFor="recipient-asset" className={fieldLabel}>Asset (e.g. USDC)</label><input id="recipient-asset" autoComplete="off" value={form.recipient_asset} onChange={update('recipient_asset')} className={inputClass} placeholder="e.g. USDC"/></div>
                  <div><label htmlFor="recipient-memo" className={fieldLabel}>Memo or destination tag (if required)</label><input id="recipient-memo" autoComplete="off" value={form.recipient_memo} onChange={update('recipient_memo')} className={inputClass} placeholder="Optional memo or destination tag"/></div>
                </>}

                <div><label htmlFor="payout-method" className={fieldLabel}>How should they receive the money?</label><select id="payout-method" value={form.recipient_payout_method} onChange={update('recipient_payout_method')} className={inputClass}><option value="mobile_money">Mobile Money (M-Pesa)</option><option value="bank">Bank transfer</option></select></div>
              </div>
            </>}

            {step === 2 && <>
              <div><h3 className="text-lg font-black">Review your transfer</h3><p className="ss-copy mt-1 text-xs">Check the details carefully before creating your transfer.</p></div>
              <div className="rounded-2xl p-4" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
                <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Transfer route</p>
                <div className="mt-3 flex items-center justify-between gap-3"><div><p className="text-sm font-black">{selected.flag} {selected.label}</p><p className="text-xs" style={{ color: 'var(--muted)' }}>{quote?.send_currency || selected.currency}</p></div><ArrowRight size={18} style={{ color: 'var(--accent-strong)' }}/><div className="text-right"><p className="text-sm font-black">{recipient.flag} {recipient.label}</p><p className="text-xs" style={{ color: 'var(--muted)' }}>{quote?.receive_currency || recipient.currency}</p></div></div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between gap-3 text-sm"><span style={{ color: 'var(--muted)' }}>You send</span><b>{quote?.send_amount} {quote?.send_currency}</b></div>
                <div className="flex justify-between gap-3 text-sm"><span style={{ color: 'var(--muted)' }}>Transfer fee</span><b>{quote?.fee_amount} {quote?.fee_currency || quote?.send_currency}</b></div>
                <div className="flex justify-between gap-3 text-sm"><span style={{ color: 'var(--muted)' }}>Exchange rate</span><b className="text-right">1 {quote?.send_currency} = {quote?.exchange_rate} {quote?.receive_currency}</b></div>
                <div className="flex justify-between gap-3 border-t pt-3 text-base" style={{ borderColor: 'var(--border)' }}><b>Recipient gets</b><b style={{ color: 'var(--accent-strong)' }}>{quote?.receive_amount} {quote?.receive_currency}</b></div>
              </div>
              <div className="rounded-2xl p-4" style={{ background: 'var(--surface-muted)' }}>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Recipient</p>
                <p className="mt-1 text-sm font-bold">{form.recipient_name || form.recipient_wallet_address || form.recipient_account_number || 'Recipient'}</p>
                {form.recipient_method === 'mobile_money' && <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>{form.recipient_provider} · {form.recipient_phone}</p>}
                {form.recipient_method === 'bank_account' && <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>{form.recipient_bank_name} · {form.recipient_account_number}{form.recipient_branch_swift ? ` · ${form.recipient_branch_swift}` : ''}</p>}
                {form.recipient_method === 'digital_wallet' && <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>{form.recipient_network} · {form.recipient_asset}{form.recipient_memo ? ` · ${form.recipient_memo}` : ''}</p>}
                <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>Sending as: {senderName} ({senderEmail})</p>
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
