import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Circle,
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
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-stellar-black via-slate-900 to-swift-900 p-5 text-white shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#e4b638] ring-1 ring-white/15">
              <Sparkles size={14} /> Stellar Anchor Showcase
            </p>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">See a real transfer flow, step by step</h1>
            <p className="mt-2 text-sm leading-6 text-slate-200 sm:text-base">
              Run a demo remittance and inspect the quote, simulated collection and payout, and any available Stellar Testnet evidence. No real money is moved.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-200">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1"><ShieldCheck size={13} className="text-stellar-yellow" /> Simulated on-ramp & payout</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1"><Globe2 size={13} className="text-stellar-yellow" /> Stellar Testnet settlement evidence</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1"><Link2 size={13} className="text-stellar-yellow" /> Anchor-pluggable design</span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-slate-200 lg:max-w-xs">
            <p className="font-semibold text-white">How to read this demo</p>
            <ul className="mt-2 space-y-1.5 text-xs leading-5">
              <li>• <b>On-ramp / payout</b>: simulated partners (demo).</li>
              <li>• <b>Stellar transaction hash</b>: treat it as on-chain evidence only when it is a real, verified Stellar Testnet transaction. A mock-mode reference is not a blockchain transaction.</li>
              <li>• Same flow can plug into real anchors later.</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-stellar-black">Run a demo transfer</h2>
              <p className="mt-1 text-sm text-slate-600">We prefilled sample details. Just choose a corridor/amount and run it.</p>
            </div>
            <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              <RefreshCw size={14} /> Reset
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Corridor</span>
              <select
                value={form.corridor}
                onChange={(e) => update('corridor', e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 focus:border-swift-500 focus:outline-none focus:ring-2 focus:ring-swift-100"
              >
                {(corridors.length ? corridors : [{ code: 'US-KE', send_country: 'US', receive_country: 'KE' }]).map((c) => (
                  <option key={c.code} value={c.code}>{c.code} — {c.send_country} to {c.receive_country}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Amount to send</span>
              <input
                type="number" min="1" step="0.01" value={form.send_amount}
                onChange={(e) => update('send_amount', e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-800 focus:border-swift-500 focus:outline-none focus:ring-2 focus:ring-swift-100"
              />
              <p className="mt-1 text-xs text-slate-500">Currency: {selectedCorridor?.send_currency || 'USD'} → {selectedCorridor?.receive_currency || 'KES'}</p>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Payout method</span>
              <select
                value={form.recipient_payout_method}
                onChange={(e) => update('recipient_payout_method', e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 focus:border-swift-500 focus:outline-none focus:ring-2 focus:ring-swift-100"
              >
                <option value="mobile_money">Mobile money</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="cash_pickup">Cash pickup</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Sender name</span>
              <input value={form.sender_name} onChange={(e) => update('sender_name', e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:border-swift-500 focus:outline-none focus:ring-2 focus:ring-swift-100" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Sender contact</span>
              <input value={form.sender_contact} onChange={(e) => update('sender_contact', e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:border-swift-500 focus:outline-none focus:ring-2 focus:ring-swift-100" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Recipient name</span>
              <input value={form.recipient_name} onChange={(e) => update('recipient_name', e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:border-swift-500 focus:outline-none focus:ring-2 focus:ring-swift-100" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Recipient contact</span>
              <input value={form.recipient_contact} onChange={(e) => update('recipient_contact', e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:border-swift-500 focus:outline-none focus:ring-2 focus:ring-swift-100" />
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button" onClick={runDemo} disabled={running}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-stellar-yellow px-5 py-3 text-sm font-bold text-stellar-black shadow-lg shadow-yellow-900/10 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {running ? <><LoaderCircle size={16} className="animate-spin" /> Running demo…</> : <><Play size={16} /> Run live anchor demo</>}
            </button>
            <p className="text-xs text-slate-500">Creates and completes a demo transfer using the configured settlement mode.</p>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <p className="inline-flex items-center gap-1.5 font-semibold"><XCircle size={16} /> Demo could not finish</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Progress</p>
            <ol className="mt-3 space-y-2">
              {STAGES.map((s, i) => {
                const done = stageIndex > i || stageIndex === 4;
                const active = stageIndex === i && running;
                return (
                  <li key={s.key} className="flex items-center gap-3 text-sm">
                    <span className={`grid h-7 w-7 place-items-center rounded-full border ${done ? 'border-emerald-300 bg-emerald-100 text-emerald-700' : active ? 'border-swift-300 bg-swift-100 text-swift-700' : 'border-slate-200 bg-white text-slate-400'}`}>
                      {done ? <CheckCircle2 size={15} /> : active ? <LoaderCircle size={15} className="animate-spin" /> : <Circle size={15} />}
                    </span>
                    <span className={done ? 'font-semibold text-slate-800' : active ? 'font-semibold text-swift-700' : 'text-slate-500'}>{s.label}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-extrabold text-stellar-black">Result & evidence</h2>
            {!rem ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">No demo run yet</p>
                <p className="mt-1">Run the demo to see the transfer status, Stellar transaction hash, and settlement evidence here.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold capitalize ${statusTone(rem.status)}`}>{pretty(rem.status)}</span>
                  {rem.reference && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Ref: {rem.reference}</span>}
                </div>

                {(quote || rem.receive_amount) && (
                  <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-sm">
                    <div><p className="text-xs text-slate-500">You send</p><p className="font-bold text-slate-900">{rem.send_amount || quote?.send_amount} {rem.send_currency || quote?.send_currency}</p></div>
                    <div><p className="text-xs text-slate-500">Recipient gets</p><p className="font-bold text-slate-900">{rem.receive_amount || quote?.receive_amount} {rem.receive_currency || quote?.receive_currency}</p></div>
                    <div><p className="text-xs text-slate-500">Rate</p><p className="font-semibold text-slate-800">{rem.exchange_rate || quote?.rate || '—'}</p></div>
                    <div><p className="text-xs text-slate-500">Fee</p><p className="font-semibold text-slate-800">{rem.fee_amount ?? quote?.fee ?? '—'} {rem.send_currency || quote?.send_currency || ''}</p></div>
                  </div>
                )}

                <div className={`rounded-xl border p-4 ${stellarHash ? 'border-swift-200 bg-swift-50/60' : 'border-slate-200 bg-slate-50'}`}>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Stellar settlement</p>
                  {stellarHash ? (
                    <>
                      <p className="mt-1 break-all font-mono text-xs font-semibold text-slate-900 sm:text-sm">{stellarHash}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a href={explorerUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-stellar-black px-3 py-2 text-xs font-bold text-white hover:bg-slate-800">
                          <ExternalLink size={14} /> View on Stellar Explorer (Testnet)
                        </a>
                      </div>
                      <p className="mt-2 text-xs text-slate-600">
                        {isRealishHash
                          ? 'This hash identifies the settlement transaction recorded for the demo. Open it in the explorer to verify on-chain details when the backend is running in testnet mode with a funded account.'
                          : 'Settlement reference recorded for this demo run.'}
                      </p>
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-slate-600">No Stellar transaction hash returned yet.</p>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 p-3"><p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">On-ramp</p><p className="mt-1 break-all text-xs font-semibold text-slate-800">{verification.on_ramp_reference || rem.on_ramp_reference || '—'}</p><p className="mt-1 text-[11px] text-slate-500">Simulated</p></div>
                  <div className="rounded-xl border border-slate-200 p-3"><p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Anchor ref</p><p className="mt-1 break-all text-xs font-semibold text-slate-800">{verification.anchor_reference || rem.anchor_reference || '—'}</p><p className="mt-1 text-[11px] text-slate-500">Settlement partner</p></div>
                  <div className="rounded-xl border border-slate-200 p-3"><p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Payout</p><p className="mt-1 break-all text-xs font-semibold text-slate-800">{verification.payout_reference || rem.payout_reference || '—'}</p><p className="mt-1 text-[11px] text-slate-500">Simulated</p></div>
                </div>

                {progress.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Flow stages</p>
                    <ul className="mt-2 space-y-2">
                      {progress.map((p) => (
                        <li key={p.key} className="flex items-center gap-2 text-sm">
                          {p.completed ? <CheckCircle2 size={15} className="text-emerald-600" /> : p.current ? <LoaderCircle size={15} className="animate-spin text-swift-600" /> : <Circle size={15} className="text-slate-300" />}
                          <span className={p.completed || p.current ? 'font-medium text-slate-800' : 'text-slate-500'}>{p.label}</span>
                          {p.at && <span className="text-xs text-slate-400">· {new Date(p.at).toLocaleTimeString()}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {rem.reference && (
                    <Link to={`/track?ref=${encodeURIComponent(rem.reference)}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                      <Rocket size={14} /> Open full tracking view <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-stellar-offwhite p-5 shadow-sm">
            <p className="inline-flex items-center gap-1.5 text-sm font-bold text-stellar-black"><Info size={16} className="text-stellar-teal" /> What this proves</p>
            <ul className="mt-2 space-y-1.5 text-sm leading-6 text-slate-700">
              <li>• SwiftSend can run an <b>end-to-end remittance flow</b> with clear stages and evidence.</li>
              <li>• The <b>settlement step is pluggable</b>: today a simulated anchor with optional real Stellar Testnet tx, tomorrow a real licensed anchor/partner (e.g. via Stellar SEPs) without changing the user flow.</li>
              <li>• Each transfer records references and a verifiable transaction hash when on-chain settlement is enabled.</li>
            </ul>
            {events.length > 0 && (
              <details className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-slate-500">Technical events ({events.length})</summary>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                  {events.slice(0, 12).map((ev, idx) => (
                    <li key={`${ev.type}-${idx}`} className="rounded-lg bg-slate-50 px-2 py-1.5">
                      <span className="font-semibold text-slate-800">{pretty(ev.stage || ev.type)}</span>: {ev.message || pretty(ev.type)}
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

export default AnchorShowcase;
