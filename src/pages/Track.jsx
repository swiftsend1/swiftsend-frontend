import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Circle, Download, ExternalLink, FileJson, LoaderCircle, MapPin, Play, Search, XCircle, Zap } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { apiUrl, getApiErrorMessage } from '../auth/api';

const statusLabel = (s) => (s || '').replace(/_/g, ' ');

const Track = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { authFetch } = useAuth();
  const [refId, setRefId] = useState(searchParams.get('ref') || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [showEvidence, setShowEvidence] = useState(false);

  const fetchTrack = useCallback(async (ref) => {
    const value = (ref || '').trim();
    if (!value) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const response = await fetch(apiUrl(`/api/track/${encodeURIComponent(value)}/`));
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(getApiErrorMessage(data, 'Transfer not found. Check your reference ID.'));
      setResult(data);
      setSearchParams({ ref: data.reference });
    } catch (e) {
      setError(e.message || 'Unable to track this transfer.');
    } finally {
      setLoading(false);
    }
  }, [setSearchParams]);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) { setRefId(ref); fetchTrack(ref); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const runAction = async (path, label) => {
    if (!result?.reference) return;
    setActionLoading(label); setError('');
    try {
      const response = await authFetch(`/api/remittances/${encodeURIComponent(result.reference)}/${path}/`, { method: 'POST' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(getApiErrorMessage(data, `Unable to ${label}.`));
      if (data.remittance) setResult({ ...data.remittance, evidence_report: data.evidence_report });
      else await fetchTrack(result.reference);
    } catch (e) {
      setError(e.message || `Unable to ${label}.`);
    } finally {
      setActionLoading('');
    }
  };

  const stages = result?.progress?.stages || [];
  const completed = new Set(result?.progress?.completed_stages || []);
  const report = result?.evidence_report;

  const downloadEvidence = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `swiftsend-evidence-${result.reference}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="min-h-full rounded-2xl bg-gradient-to-br from-slate-50 via-white to-cyan-50/20">
      <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e7faf3] px-4 py-2 text-sm font-semibold text-[#087869] mb-4"><MapPin size={16} /> Real-Time Tracking</div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">Track Your Transfer</h1>
          <p className="mt-3 text-lg text-slate-600">Follow every step from sending to delivery with full transparency</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-slate-900 to-[#0f766e] p-6 text-white">
            <h2 className="text-xl font-bold flex items-center gap-2"><Search size={20} /> Enter Reference Number</h2>
            <p className="text-sm text-slate-200 mt-1">Track your transfer using the reference ID you received</p>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <input value={refId} onChange={(e) => setRefId(e.target.value)} className="flex-1 px-6 py-4 text-lg font-mono rounded-xl border-2 border-slate-200 focus:border-[#0f766e] focus:ring-4 focus:ring-emerald-50 transition" placeholder="e.g. SSABC1234567" />
              <button onClick={() => fetchTrack(refId)} disabled={loading || !refId.trim()} className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#0f766e] to-[#0b645e] text-white font-bold shadow-lg hover:shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <LoaderCircle size={20} className="animate-spin" /> : <Search size={20} />} Track Transfer
              </button>
            </div>
          </div>
        </div>

        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 mb-6" role="alert">{error}</div>}

        {result && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 p-6 border-b border-emerald-100">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Transfer Reference</p>
                    <p className="text-2xl font-mono font-bold text-slate-900">{result.reference}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${result.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : result.status === 'failed' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                    {statusLabel(result.status)}
                  </span>
                </div>
              </div>
              <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Route</p><p className="font-semibold">{result.sender_country} → {result.recipient_country}</p></div>
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Amount Sent</p><p className="font-semibold">{result.send_amount} {result.send_currency}</p></div>
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Recipient Gets</p><p className="font-semibold text-[#0f766e]">{result.receive_amount} {result.receive_currency}</p></div>
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Channel</p><p className="font-semibold capitalize">{result.channel}</p></div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-100 overflow-hidden">
              <div className="p-6 border-b flex items-center justify-between">
                <div><h3 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Zap className="text-[#0f766e]" /> Transfer Progress</h3><p className="text-sm text-slate-600 mt-1">End-to-end journey tracking</p></div>
                <div className="flex gap-2">
                  <button onClick={() => runAction('advance', 'advance')} disabled={!!actionLoading || result.status === 'completed' || result.status === 'failed'} className="px-4 py-2 rounded-lg border-2 border-slate-200 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">Advance</button>
                  <button onClick={() => runAction('validate', 'run validation')} disabled={!!actionLoading || result.status === 'completed'} className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#0f766e] to-[#0b645e] text-white text-sm font-semibold hover:shadow-lg disabled:opacity-50 flex items-center gap-2">{actionLoading ? <LoaderCircle size={14} className="animate-spin" /> : <Play size={14} />} Validate</button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stages.map((stage, idx) => {
                    const done = completed.has(stage);
                    const current = result.status === stage;
                    return (
                      <div key={stage} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`grid h-10 w-10 place-items-center rounded-full ${done ? 'bg-gradient-to-br from-[#0f766e] to-[#22d3ee] text-white' : current ? 'bg-amber-100 text-amber-700 ring-4 ring-amber-50' : 'bg-slate-100 text-slate-400'}`}>
                            {done ? <CheckCircle2 size={20} /> : current ? <Circle size={20} /> : <Circle size={20} />}
                          </div>
                          {idx < stages.length - 1 && <div className={`w-0.5 h-12 mt-2 ${done ? 'bg-emerald-200' : 'bg-slate-200'}`} />}
                        </div>
                        <div className="flex-1 pb-8">
                          <p className={`font-bold ${done || current ? 'text-slate-900' : 'text-slate-400'}`}>{statusLabel(stage)}</p>
                          <p className="text-sm text-slate-500 mt-1">{done ? 'Completed' : current ? 'In Progress' : 'Pending'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-100 p-6">
                <h3 className="font-bold text-lg mb-4">Verification Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl"><span className="text-slate-600">Stellar TX Hash</span><span className="font-mono text-xs max-w-[150px] truncate">{result.stellar_tx_hash || '—'}</span></div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl"><span className="text-slate-600">On-ramp Ref</span><span className="font-mono text-xs">{result.on_ramp_reference || '—'}</span></div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl"><span className="text-slate-600">Anchor Ref</span><span className="font-mono text-xs">{result.anchor_reference || '—'}</span></div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl"><span className="text-slate-600">Payout Ref</span><span className="font-mono text-xs">{result.payout_reference || '—'}</span></div>
                </div>
              </div>
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-100 p-6">
                <h3 className="font-bold text-lg mb-4">Evidence & Reports</h3>
                <p className="text-sm text-slate-600 mb-4">Download complete audit trail with all transaction details</p>
                <div className="space-y-3">
                  <button onClick={() => setShowEvidence((v) => !v)} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition"><FileJson size={18} /> {showEvidence ? 'Hide' : 'View'} Evidence Report</button>
                  {report && <button onClick={downloadEvidence} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#0f766e] to-[#0b645e] text-white hover:shadow-lg transition"><Download size={18} /> Download JSON</button>}
                </div>
              </div>
            </div>

            {showEvidence && report && <pre className="text-xs bg-slate-900 text-slate-100 rounded-2xl p-6 overflow-auto max-h-96 shadow-xl">{JSON.stringify(report, null, 2)}</pre>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Track;
