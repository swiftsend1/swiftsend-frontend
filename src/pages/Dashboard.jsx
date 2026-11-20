import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Globe2,
  Plus,
  Send,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { getApiErrorMessage } from '../auth/api';

const money = (amount, currency) => {
  const suffix = currency ? ' ' + currency : '';
  if (amount === null || amount === undefined || amount === '') return '—';
  const value = Number(amount);
  if (!Number.isFinite(value)) return String(amount) + suffix;
  return new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(value) + suffix;
};

const readableStatus = (status = '') => status.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());

const statusTone = (status = '') => {
  if (['completed', 'delivered', 'success'].includes(status.toLowerCase())) return { bg: 'var(--accent-soft)', color: 'var(--accent-strong)' };
  if (['failed', 'cancelled', 'rejected'].includes(status.toLowerCase())) return { bg: 'rgba(239,68,68,.12)', color: '#dc2626' };
  return { bg: 'rgba(234,179,8,.13)', color: 'var(--text)' };
};

const getDisplayName = (user) => user?.name || user?.full_name || user?.first_name || user?.email?.split('@')[0] || 'there';

const Dashboard = () => {
  const { user, authFetch } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    authFetch('/api/remittances/')
      .then(async (response) => {
        const data = await response.json().catch(() => []);
        if (!response.ok) throw new Error(getApiErrorMessage(data, 'We could not load your recent transfers.'));
        if (!cancelled) setItems(Array.isArray(data) ? data : (data?.results || []));
      })
      .catch((requestError) => { if (!cancelled) setError(requestError.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [authFetch]);

  const stats = useMemo(() => ({
    total: items.length,
    completed: items.filter((item) => ['completed', 'delivered'].includes((item.status || '').toLowerCase())).length,
    pending: items.filter((item) => !['completed', 'delivered', 'failed', 'cancelled'].includes((item.status || '').toLowerCase())).length,
  }), [items]);

  const quickActions = [
    { to: '/send', title: 'Send money', detail: 'Start a transfer', icon: Send, primary: true },
    { to: '/receive', title: 'Receive money', detail: 'Share your details', icon: ArrowDownLeft },
    { to: '/track', title: 'Track transfer', detail: 'Check a reference', icon: Globe2 },
    { to: '/wallet', title: 'My wallet', detail: 'View wallet status', icon: WalletCards },
  ];

  return (
    <div className="ss-page space-y-5 sm:space-y-7">
      <section className="relative overflow-hidden rounded-[28px] bg-[#161616] p-5 text-white shadow-[0_24px_70px_-35px_rgba(22,22,22,.5)] sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute -right-20 -top-28 h-96 w-96 rounded-full border border-[#e3bb49]/20 bg-[#e3bb49]/10 blur-2xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 h-32 w-32 rounded-full bg-[#e3bb49]/10 blur-3xl" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[.18em] text-[#e3bb49]"><span className="h-1.5 w-1.5 rounded-full bg-[#4e9b59] ss-blink" /> Overview <span className="text-white/30">·</span> Personal account</div>
            <h2 className="mt-4 text-3xl font-black tracking-[-.055em] sm:text-5xl">Good to see you, {getDisplayName(user)}.</h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-white/55 sm:text-base">Your transfers, status updates, and next steps in one clear view.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/send" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#e3bb49] px-5 py-3.5 text-sm font-black text-[#161616] transition hover:-translate-y-0.5 hover:bg-[#f6d87a]"><Plus size={17} /> New transfer</Link>
              <Link to="/receive" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"><ArrowDownLeft size={17} /> Receive money</Link>
            </div>
          </div>
          <div className="relative rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:min-w-[230px]">
            <div className="flex items-center justify-between gap-4"><span className="text-xs font-bold text-white/50">Account status</span><ShieldCheck size={16} className="text-[#e3bb49]" /></div>
            <p className="mt-3 text-lg font-black">Ready to transfer</p>
            <p className="mt-1 text-xs text-white/45">Quotes shown before confirmation</p>
          </div>
        </div>
        <div className="relative mt-8 grid gap-2 sm:grid-cols-3">
          <Metric label="Transfers" value={loading ? '—' : stats.total} icon={Activity} />
          <Metric label="Completed" value={loading ? '—' : stats.completed} icon={CheckCircle2} />
          <Metric label="In progress" value={loading ? '—' : stats.pending} icon={Clock3} />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[var(--accent-strong)]">Actions</p><h3 className="ss-title mt-1 text-xl font-black sm:text-2xl">Make a move</h3></div><Link to="/help" className="text-xs font-bold text-[var(--accent-strong)] hover:underline">Need help?</Link></div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map(({ to, title, detail, icon: Icon, primary }) => (
            <Link key={to} to={to} className="group flex min-h-[88px] items-center gap-3 rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md" style={{ background: primary ? 'var(--accent-soft)' : 'var(--surface)', borderColor: primary ? 'color-mix(in srgb, var(--accent) 35%, var(--border))' : 'var(--border)' }}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: primary ? 'var(--accent)' : 'var(--surface-muted)', color: primary ? '#fff' : 'var(--accent-strong)' }}><Icon size={18} /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-black text-[var(--text)]">{title}</span><span className="mt-1 block truncate text-xs text-[var(--muted)]">{detail}</span></span>
              <ArrowRight size={15} className="shrink-0 text-[var(--muted)] transition group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[22px] border bg-[var(--surface)] shadow-[var(--shadow)]" style={{ borderColor: 'var(--border)' }}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-5 sm:px-6" style={{ borderColor: 'var(--border)' }}>
          <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[var(--accent-strong)]">Activity</p><h3 className="ss-title mt-1 text-lg font-black">Recent transfers</h3></div>
          <Link to="/history" className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--accent-strong)]">View all <ArrowRight size={15} /></Link>
        </div>
        {error && <div className="m-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</div>}
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-[var(--muted)]">Loading your transfers…</div>
        ) : items.length === 0 ? (
          <EmptyActivity />
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {items.slice(0, 5).map((item, index) => <TransferRow key={item.reference || index} item={item} />)}
          </div>
        )}
      </section>

      <div className="flex items-center gap-3 rounded-2xl border bg-[var(--surface-muted)] p-4" style={{ borderColor: 'var(--border)' }}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><ShieldCheck size={17} /></span>
        <p className="min-w-0 flex-1 text-xs leading-5 text-[var(--muted)]">Every transfer has a reference and a recorded status.</p>
        <Link to="/track" className="shrink-0 text-xs font-black text-[var(--accent-strong)]">Track <ArrowRight size={13} className="ml-1 inline" /></Link>
      </div>
    </div>
  );
};

const Metric = ({ label, value, icon: Icon }) => <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-[#e3bb49]"><Icon size={15} /></span><span><span className="block text-[11px] font-semibold text-white/45">{label}</span><span className="mt-0.5 block text-xl font-black tabular-nums">{value}</span></span></div>;

const TransferRow = ({ item }) => {
  const tone = statusTone(item.status);
  return <Link to={'/track?ref=' + encodeURIComponent(item.reference || '')} className="flex items-center gap-3 px-5 py-4 transition hover:bg-black/[.02] sm:px-6 dark:hover:bg-white/[.025]">
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--surface-muted)] text-[var(--accent-strong)]"><ArrowUpRight size={18} /></span>
    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-[var(--text)]">{item.recipient_name || 'Transfer recipient'}</span><span className="mt-1 block truncate font-mono text-[11px] text-[var(--muted)]">{item.reference || 'No reference'} · {item.sender_country || '—'} → {item.recipient_country || item.receive_currency || '—'}</span></span>
    <span className="hidden text-right sm:block"><span className="block text-sm font-black tabular-nums text-[var(--text)]">{money(item.send_amount, item.send_currency)}</span><span className="mt-1 block text-[11px] text-[var(--muted)]">{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Date unavailable'}</span></span>
    <span className="rounded-full px-2.5 py-1 text-[10px] font-black" style={{ background: tone.bg, color: tone.color }}>{readableStatus(item.status)}</span>
    <ArrowRight size={15} className="shrink-0 text-[var(--muted)] sm:hidden" />
  </Link>;
};

const EmptyActivity = () => <div className="px-6 py-12 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><Send size={21} /></span><p className="ss-title mt-4 font-black">No transfers yet</p><p className="ss-copy mt-1 text-sm">Create your first transfer to get started.</p><Link to="/send" className="ss-primary mt-5">Start a transfer <ArrowRight size={16} /></Link></div>;

Metric.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, icon: PropTypes.elementType.isRequired };
TransferRow.propTypes = { item: PropTypes.shape({ status: PropTypes.string, reference: PropTypes.string, recipient_name: PropTypes.string, sender_country: PropTypes.string, recipient_country: PropTypes.string, receive_currency: PropTypes.string, send_amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), send_currency: PropTypes.string, created_at: PropTypes.string }).isRequired };

export default Dashboard;
