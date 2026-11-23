import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Activity,
  ArrowRight,
  ArrowDownRight,
  BadgeCheck,
  CheckCircle2,
  Clipboard,
  Circle,
  Copy,
  Database,
  ExternalLink,
  Globe2,
  Info,
  Link2,
  LoaderCircle,
  Play,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  XCircle,
  Zap,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { apiUrl, getApiErrorMessage } from '../auth/api';

const STAGES = [
  { key: 'quote', label: 'Get transfer quote' },
  { key: 'create', label: 'Create demo transfer' },
  { key: 'settle', label: 'Settle on Stellar network' },
  { key: 'evidence', label: 'Collect evidence & complete' },
];

const defaultForm = {
  corridor: 'US-KE',
  send_amount: '50.00',
  sender_name: 'Demo Sender',
  sender_contact: 'demo.sender@swiftsend.app',
  sender_country: 'US',
  recipient_name: 'Demo Recipient',
  recipient_contact: '+254700000000',
  recipient_country: 'KE',
  recipient_payout_method: 'mobile_money',
};

const statusTone = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'completed' || s === 'settled') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (s === 'failed' || s === 'canceled') return 'text-rose-700 bg-rose-50 border-rose-200';
  if (s.includes('progress') || s.includes('pending') || s.includes('processing') || s.includes('submitted')) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-slate-700 bg-slate-50 border-slate-200';
};

const pretty = (v) => (v ? String(v).replace(/_/g, ' ') : '—');

const AnchorShowcase = () => {
  const { authFetch } = useAuth();
  const [corridors, setCorridors] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [quote, setQuote] = useState(null);
  const [stageIndex, setStageIndex] = useState(-1);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [track, setTrack] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    fetch(apiUrl('/api/corridors/?receive_country=KE'))
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.results || []);
        setCorridors(list);
        if (list.length && !list.some((c) => c.code === defaultForm.corridor)) {
          setForm((f) => ({ ...f, corridor: list[0].code, sender_country: list[0].send_country || f.sender_country }));
        }
      })
      .catch(() => setCorridors([]));
  }, []);

  const selectedCorridor = useMemo(
    () => corridors.find((c) => c.code === form.corridor),
    [corridors, form.corridor],
  );

  const update = (key, value) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'corridor') {
        const c = corridors.find((x) => x.code === value);
        if (c?.send_country) next.sender_country = c.send_country;
        if (c?.receive_country) next.recipient_country = c.receive_country;
      }
      return next;
    });
  };

  const runDemo = async () => {
    setRunning(true);
    setError('');
    setResult(null);
    setTrack(null);
    setQuote(null);
    setStageIndex(0);
    try {
      // 1) Quote
      const quoteRes = await fetch(apiUrl('/api/corridors/quote/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ corridor: form.corridor, send_amount: form.send_amount }),
      });
      const quoteData = await quoteRes.json().catch(() => ({}));
      if (!quoteRes.ok) throw new Error(getApiErrorMessage(quoteData, 'Could not get a transfer quote.'));
      setQuote(quoteData);

      // 2) Create remittance
      setStageIndex(1);
      const createRes = await authFetch('/api/remittances/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_name: form.sender_name,
          sender_contact: form.sender_contact,
          sender_country: form.sender_country,
          recipient_name: form.recipient_name,
          recipient_contact: form.recipient_contact,
          recipient_country: form.recipient_country,
          recipient_payout_method: form.recipient_payout_method,
          corridor: form.corridor,
          send_amount: form.send_amount,
        }),
      });
      const created = await createRes.json().catch(() => ({}));
      if (!createRes.ok) throw new Error(getApiErrorMessage(created, 'Could not create the demo transfer.'));
      const reference = created.reference;
      if (!reference) throw new Error('Demo transfer was created but no reference was returned.');

      // 3) Validate/run to completion (executes staged flow incl. Stellar settlement step)
      setStageIndex(2);
      const validateRes = await authFetch(`/api/remittances/${encodeURIComponent(reference)}/validate/`, { method: 'POST' });
      const validated = await validateRes.json().catch(() => ({}));
      if (!validateRes.ok) throw new Error(getApiErrorMessage(validated, 'Demo transfer could not be completed.'));
      setResult(validated);

      // 4) Fetch tracking/evidence view for full timeline
      setStageIndex(3);
      const trackRes = await fetch(apiUrl(`/api/track/${encodeURIComponent(reference)}/`));
      const trackData = await trackRes.json().catch(() => ({}));
      if (trackRes.ok) setTrack(trackData);
      setStageIndex(4);
    } catch (e) {
      setError(e.message || 'Something went wrong while running the demo.');
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    setError('');
    setResult(null);
    setTrack(null);
    setQuote(null);
    setStageIndex(-1);
    setCopiedHash(false);
  };

  const copyHash = async () => {
    if (!stellarHash || !navigator.clipboard) return;
    await navigator.clipboard.writeText(stellarHash);
    setCopiedHash(true);
    window.setTimeout(() => setCopiedHash(false), 1800);
  };

  const rem = result || track;
  const verification = track?.verification || result?.evidence_report?.verification || {};
  const stellarHash = verification.stellar_tx_hash || rem?.stellar_tx_hash || '';
  const explorerUrl = stellarHash ? `https://stellar.expert/explorer/testnet/tx/${stellarHash}` : '';
  const progress = track?.progress || [];
  const events = track?.events || [];
  const isRealishHash = /^[a-f0-9]{64}$/i.test(stellarHash);

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="relative isolate overflow-hidden rounded-[28px] border border-[#2e2b24] bg-[#11110f] p-5 text-white shadow-[0_24px_60px_-34px_rgba(23,23,23,.7)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-70" aria-hidden="true">
          <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#e4b638]/20 blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-[#b88712]/20 blur-3xl" />
          <div className="absolute inset-0 opacity-[.08] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:32px_32px]" />
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl lg:pt-1">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#e4b638]/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[.18em] text-[#f1cf72] ring-1 ring-[#e4b638]/30">
              <Sparkles size={14} /> Stellar network · Testnet
            </p>
            <h1 className="mt-4 max-w-2xl text-3xl font-black leading-[1.02] tracking-[-.055em] sm:text-5xl">Move money. <span className="text-[#e4b638]">Prove every step.</span></h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#c9c6bd] sm:text-base">
              A transparent remittance flow from quote to payout, with settlement evidence ready to inspect. This showcase uses simulated partners and never moves real funds.
            </p>
            <div className="mt-6 grid max-w-2xl grid-cols-3 gap-2 sm:gap-3">
              <HeroStat value="04" label="flow stages" />
              <HeroStat value="01" label="evidence trail" />
              <HeroStat value="0" label="real funds moved" />
            </div>
          </div>
          <div className="w-full rounded-2xl border border-white/15 bg-white/[.07] p-4 backdrop-blur-sm lg:max-w-xs lg:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[.16em] text-[#f1cf72]">Demo environment</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Ready</span>
            </div>
            <p className="mt-4 text-lg font-black tracking-tight text-white">Anchor-ready by design</p>
            <p className="mt-2 text-xs leading-5 text-[#c9c6bd]">The settlement adapter can point to a real licensed partner later without changing the customer journey.</p>
            <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4 text-xs font-semibold text-[#e7e2d5]"><ShieldCheck size={15} className="text-[#e4b638]" /> Simulated on-ramp & payout</div>
          </div>
        </div>
      </section>

      <section aria-labelledby="flow-overview" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.18em]" style={{ color: 'var(--accent-strong)' }}>The transfer path</p>
            <h2 id="flow-overview" className="mt-1 text-lg font-black tracking-[-.035em]" style={{ color: 'var(--text)' }}>One flow, four checkpoints.</h2>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--muted)' }}><Activity size={14} /> {running ? 'Demo in progress' : stageIndex === 4 ? 'Demo complete' : 'Awaiting a run'}</span>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-4 sm:gap-0">
          {STAGES.map((stage, index) => <FlowStep key={stage.key} stage={stage} index={index} stageIndex={stageIndex} running={running} />)}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.18em]" style={{ color: 'var(--accent-strong)' }}>Configure the journey</p>
              <h2 className="mt-1 text-xl font-black tracking-[-.035em]" style={{ color: 'var(--text)' }}>Run a demo transfer</h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>Sample details are ready. Choose a corridor, then start the flow.</p>
            </div>
            <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-bold transition hover:bg-[var(--surface-muted)]" style={{ color: 'var(--muted)' }}>
              <RefreshCw size={14} /> Reset
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Corridor</span>
              <select
                value={form.corridor}
                onChange={(e) => update('corridor', e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm font-medium text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
              >
                {(corridors.length ? corridors : [{ code: 'US-KE', send_country: 'US', receive_country: 'KE' }]).map((c) => (
                  <option key={c.code} value={c.code}>{c.code} — {c.send_country} to {c.receive_country}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Amount to send</span>
              <input
                type="number" min="1" step="0.01" value={form.send_amount}
                onChange={(e) => update('send_amount', e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm font-medium text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
              />
              <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>Currency: {selectedCorridor?.send_currency || 'USD'} → {selectedCorridor?.receive_currency || 'KES'}</p>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Payout method</span>
              <select
                value={form.recipient_payout_method}
                onChange={(e) => update('recipient_payout_method', e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm font-medium text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
              >
                <option value="mobile_money">Mobile money</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="cash_pickup">Cash pickup</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Sender name</span>
              <input value={form.sender_name} onChange={(e) => update('sender_name', e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Sender contact</span>
              <input value={form.sender_contact} onChange={(e) => update('sender_contact', e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Recipient name</span>
              <input value={form.recipient_name} onChange={(e) => update('recipient_name', e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Recipient contact</span>
              <input value={form.recipient_contact} onChange={(e) => update('recipient_contact', e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" />
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button" onClick={runDemo} disabled={running}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-black text-[#17140c] shadow-lg shadow-yellow-900/10 transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {running ? <><LoaderCircle size={16} className="animate-spin" /> Running demo…</> : <><Play size={16} /> Run live anchor demo</>}
            </button>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Creates and completes a demo transfer using the configured settlement mode.</p>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <p className="inline-flex items-center gap-1.5 font-semibold"><XCircle size={16} /> Demo could not finish</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <p className="text-xs font-black uppercase tracking-[.16em]" style={{ color: 'var(--muted)' }}>Run progress</p>
            <ol className="mt-3 space-y-2">
              {STAGES.map((s, i) => {
                const done = stageIndex > i || stageIndex === 4;
                const active = stageIndex === i && running;
                return (
                  <li key={s.key} className="flex items-center gap-3 text-sm">
                    <span className={`grid h-7 w-7 place-items-center rounded-full border ${done ? 'border-emerald-300 bg-emerald-100 text-emerald-700' : active ? 'border-swift-300 bg-swift-100 text-swift-700' : 'border-slate-200 bg-white text-slate-400'}`}>
                      {done ? <CheckCircle2 size={15} /> : active ? <LoaderCircle size={15} className="animate-spin" /> : <Circle size={15} />}
                    </span>
                    <span className={done ? 'font-semibold' : active ? 'font-semibold text-[var(--accent-strong)]' : ''} style={!done && !active ? { color: 'var(--muted)' } : { color: done ? 'var(--text)' : undefined }}>{s.label}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.18em]" style={{ color: 'var(--accent-strong)' }}>Proof layer</p>
                <h2 className="mt-1 text-xl font-black tracking-[-.035em]" style={{ color: 'var(--text)' }}>Result & evidence</h2>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--accent-soft)]" style={{ color: 'var(--accent-strong)' }}><BadgeCheck size={18} /></span>
            </div>
            {!rem ? (
              <div className="mt-5 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-5 text-sm" style={{ color: 'var(--muted)' }}>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--surface)]" style={{ color: 'var(--accent-strong)' }}><Database size={18} /></div>
                <p className="mt-4 font-bold" style={{ color: 'var(--text)' }}>Your evidence trail will appear here</p>
                <p className="mt-1">Run the demo to inspect the transfer status, settlement hash, partner references, and final timeline.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold capitalize ${statusTone(rem.status)}`}>{pretty(rem.status)}</span>
                  {rem.reference && <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Ref: {rem.reference}</span>}
                </div>

                {(quote || rem.receive_amount) && (
                  <div className="grid grid-cols-2 gap-3 rounded-xl bg-[var(--surface-muted)] p-3 text-sm">
                    <EvidenceMetric label="You send" value={`${rem.send_amount || quote?.send_amount} ${rem.send_currency || quote?.send_currency || ''}`} strong />
                    <EvidenceMetric label="Recipient gets" value={`${rem.receive_amount || quote?.receive_amount} ${rem.receive_currency || quote?.receive_currency || ''}`} strong />
                    <EvidenceMetric label="Rate" value={rem.exchange_rate || quote?.rate || '—'} />
                    <EvidenceMetric label="Fee" value={`${rem.fee_amount ?? quote?.fee ?? '—'} ${rem.send_currency || quote?.send_currency || ''}`} />
                  </div>
                )}

                <div className={`rounded-xl border p-4 ${stellarHash ? 'border-[#e4b638]/45 bg-[var(--accent-soft)]' : 'border-[var(--border)] bg-[var(--surface-muted)]'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-black uppercase tracking-[.16em]" style={{ color: 'var(--muted)' }}>Stellar settlement</p>
                    {stellarHash && <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${isRealishHash ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{isRealishHash ? 'Testnet hash' : 'Reference only'}</span>}
                  </div>
                  {stellarHash ? (
                    <>
                      <p className="mt-3 break-all rounded-lg border border-black/5 bg-[var(--surface)] p-3 font-mono text-xs font-semibold" style={{ color: 'var(--text)' }}>{stellarHash}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a href={explorerUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-[#171717] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#34322d]">
                          <ExternalLink size={14} /> View on Stellar Explorer (Testnet)
                        </a>
                        <button type="button" onClick={copyHash} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-bold transition hover:bg-[var(--surface-muted)]" style={{ color: 'var(--text)' }}>
                          {copiedHash ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Copy size={14} />} {copiedHash ? 'Copied' : 'Copy hash'}
                        </button>
                      </div>
                      <p className="mt-2 text-xs leading-5" style={{ color: 'var(--muted)' }}>
                        {isRealishHash
                          ? 'This hash identifies the settlement transaction recorded for the demo. Open it in the explorer to verify on-chain details when the backend is running in testnet mode with a funded account.'
                          : 'Settlement reference recorded for this demo run.'}
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>No Stellar transaction hash returned yet.</p>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <EvidenceCard icon={<ArrowDownRight size={14} />} label="On-ramp" value={verification.on_ramp_reference || rem.on_ramp_reference || '—'} detail="Simulated" />
                  <EvidenceCard icon={<Link2 size={14} />} label="Anchor ref" value={verification.anchor_reference || rem.anchor_reference || '—'} detail="Settlement partner" />
                  <EvidenceCard icon={<Zap size={14} />} label="Payout" value={verification.payout_reference || rem.payout_reference || '—'} detail="Simulated" />
                </div>

                {progress.length > 0 && (
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.16em]" style={{ color: 'var(--muted)' }}>Flow stages</p>
                    <ul className="mt-2 space-y-2">
                      {progress.map((p) => (
                        <li key={p.key} className="flex items-center gap-2 text-sm">
                          {p.completed ? <CheckCircle2 size={15} className="text-emerald-600" /> : p.current ? <LoaderCircle size={15} className="animate-spin text-swift-600" /> : <Circle size={15} className="text-slate-300" />}
                          <span className={p.completed || p.current ? 'font-medium' : ''} style={{ color: p.completed || p.current ? 'var(--text)' : 'var(--muted)' }}>{p.label}</span>
                          {p.at && <span className="text-xs" style={{ color: 'var(--muted)' }}>· {new Date(p.at).toLocaleTimeString()}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {rem.reference && (
                    <Link to={`/track?ref=${encodeURIComponent(rem.reference)}`} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-bold transition hover:bg-[var(--surface-muted)]" style={{ color: 'var(--text)' }}>
                      <Rocket size={14} /> Open full tracking view <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5 shadow-[var(--shadow)]">
            <p className="inline-flex items-center gap-1.5 text-sm font-black" style={{ color: 'var(--text)' }}><Info size={16} style={{ color: 'var(--accent-strong)' }} /> What this proves</p>
            <ul className="mt-3 space-y-2 text-sm leading-6" style={{ color: 'var(--muted)' }}>
              <li className="flex gap-2"><Globe2 size={16} className="mt-1 shrink-0" style={{ color: 'var(--accent-strong)' }} /> <span>SwiftSend can run an <b style={{ color: 'var(--text)' }}>end-to-end remittance flow</b> with clear stages and evidence.</span></li>
              <li className="flex gap-2"><Link2 size={16} className="mt-1 shrink-0" style={{ color: 'var(--accent-strong)' }} /> <span>The <b style={{ color: 'var(--text)' }}>settlement step is pluggable</b>: today a simulated anchor with optional real Stellar Testnet tx, tomorrow a real licensed anchor/partner without changing the user flow.</span></li>
              <li className="flex gap-2"><Clipboard size={16} className="mt-1 shrink-0" style={{ color: 'var(--accent-strong)' }} /> <span>Each transfer records references and a verifiable transaction hash when on-chain settlement is enabled.</span></li>
            </ul>
            {events.length > 0 && (
              <details className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                <summary className="cursor-pointer text-xs font-black uppercase tracking-[.14em]" style={{ color: 'var(--muted)' }}>Technical events ({events.length})</summary>
                <ul className="mt-2 space-y-1.5 text-xs" style={{ color: 'var(--muted)' }}>
                  {events.slice(0, 12).map((ev, idx) => (
                    <li key={`${ev.type}-${idx}`} className="rounded-lg bg-[var(--surface-muted)] px-2 py-1.5">
                      <span className="font-semibold" style={{ color: 'var(--text)' }}>{pretty(ev.stage || ev.type)}</span>: {ev.message || pretty(ev.type)}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const HeroStat = ({ value, label }) => (
  <div className="rounded-xl border border-white/10 bg-white/[.06] px-3 py-3">
    <p className="text-xl font-black tracking-[-.04em] text-[#f1cf72] sm:text-2xl">{value}</p>
    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[.12em] text-[#aaa69b]">{label}</p>
  </div>
);

const FlowStep = ({ stage, index, stageIndex, running }) => {
  const done = stageIndex === 4 || stageIndex > index;
  const active = running && stageIndex === index;
  return (
    <div className="relative flex items-center gap-3 rounded-xl p-2 sm:rounded-none sm:px-2 sm:first:pl-0 sm:last:pr-0">
      {index > 0 && <span className={`absolute -left-1 top-1/2 hidden h-px w-2 -translate-y-1/2 sm:block ${done || active ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`} aria-hidden="true" />}
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${done ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : active ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]' : 'border-[var(--border)] bg-[var(--surface-muted)]'}`} style={!done && !active ? { color: 'var(--muted)' } : undefined}>
        {done ? <CheckCircle2 size={17} /> : active ? <LoaderCircle size={17} className="animate-spin" /> : <span className="text-xs font-black">0{index + 1}</span>}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[.13em]" style={{ color: 'var(--muted)' }}>Step 0{index + 1}</p>
        <p className={`truncate text-xs font-bold ${done || active ? '' : ''}`} style={{ color: done || active ? 'var(--text)' : 'var(--muted)' }}>{stage.label}</p>
      </div>
    </div>
  );
};

const EvidenceMetric = ({ label, value, strong = false }) => (
  <div>
    <p className="text-xs" style={{ color: 'var(--muted)' }}>{label}</p>
    <p className={strong ? 'font-black' : 'font-semibold'} style={{ color: 'var(--text)' }}>{value}</p>
  </div>
);

const EvidenceCard = ({ icon, label, value, detail }) => (
  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
    <p className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[.12em]" style={{ color: 'var(--muted)' }}>{icon} {label}</p>
    <p className="mt-2 break-all text-xs font-bold" style={{ color: 'var(--text)' }}>{value}</p>
    <p className="mt-1 text-[11px]" style={{ color: 'var(--muted)' }}>{detail}</p>
  </div>
);

HeroStat.propTypes = { value: PropTypes.string.isRequired, label: PropTypes.string.isRequired };
FlowStep.propTypes = { stage: PropTypes.shape({ key: PropTypes.string.isRequired, label: PropTypes.string.isRequired }).isRequired, index: PropTypes.number.isRequired, stageIndex: PropTypes.number.isRequired, running: PropTypes.bool.isRequired };
EvidenceMetric.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.string.isRequired, strong: PropTypes.bool };
EvidenceCard.propTypes = { icon: PropTypes.node.isRequired, label: PropTypes.string.isRequired, value: PropTypes.string.isRequired, detail: PropTypes.string.isRequired };

export default AnchorShowcase;
