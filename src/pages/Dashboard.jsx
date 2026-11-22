import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
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
    <div className="ss-page mx-auto max-w-5xl space-y-5 sm:space-y-6">
      <section className="ss-surface rounded-[26px] p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.18em] text-[var(--accent-strong)]"><span className="h-1.5 w-1.5 rounded-full bg-[#4e9b59] ss-blink" /> Personal account</div>
            <h2 className="ss-title mt-3 text-3xl font-black tracking-[-.055em] sm:text-4xl">Good to see you, {getDisplayName(user)}.</h2>
            <p className="ss-copy mt-2 max-w-xl text-sm leading-6">Send money, receive funds, or check the status of a transfer.</p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-xs font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}><ShieldCheck size={15} /> Ready to transfer</div>
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link to="/send" className="ss-primary min-h-11"><Plus size={17} /> New transfer</Link>
          <Link to="/receive" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border px-4 py-3 text-sm font-bold text-[var(--text)] transition hover:bg-[var(--surface-muted)]" style={{ borderColor: 'var(--border)' }}><ArrowDownLeft size={17} /> Receive money</Link>
        </div>
        <div className="mt-6 grid grid-cols-3 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
          <SummaryStat label="Transfers" value={loading ? '—' : stats.total} />
          <SummaryStat label="Completed" value={loading ? '—' : stats.completed} />
          <SummaryStat label="In progress" value={loading ? '—' : stats.pending} />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[var(--accent-strong)]">Quick actions</p><h3 className="ss-title mt-1 text-xl font-black">What do you need?</h3></div><Link to="/help" className="text-xs font-bold text-[var(--accent-strong)] hover:underline">Need help?</Link></div>
        <div className="grid gap-3 sm:grid-cols-2">
          {quickActions.slice(0, 2).map(({ to, title, detail, icon: Icon, primary }) => (
            <Link key={to} to={to} className="group flex min-h-[78px] items-center gap-3 rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md" style={{ background: primary ? 'var(--accent-soft)' : 'var(--surface)', borderColor: primary ? 'color-mix(in srgb, var(--accent) 35%, var(--border))' : 'var(--border)' }}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: primary ? 'var(--accent)' : 'var(--surface-muted)', color: primary ? '#17140c' : 'var(--accent-strong)' }}><Icon size={18} /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-black text-[var(--text)]">{title}</span><span className="mt-1 block truncate text-xs text-[var(--muted)]">{detail}</span></span>
              <ArrowRight size={15} className="shrink-0 text-[var(--muted)] transition group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-xs font-bold text-[var(--muted)]"><Link to="/wallet" className="inline-flex items-center gap-1.5 hover:text-[var(--text)]"><WalletCards size={14} /> Wallet</Link><Link to="/track" className="inline-flex items-center gap-1.5 hover:text-[var(--text)]"><Globe2 size={14} /> Track a transfer</Link><Link to="/history" className="inline-flex items-center gap-1.5 hover:text-[var(--text)]"><Clock3 size={14} /> View activity</Link></div>
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

      <div className="flex items-center gap-3 rounded-2xl border bg-[var(--surface-muted)] p-4" style={{ borderColor: 'var(--border)' }}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><ShieldCheck size={17} /></span><p className="min-w-0 flex-1 text-xs leading-5 text-[var(--muted)]">Every transfer has a reference and a recorded status.</p><Link to="/track" className="shrink-0 text-xs font-black text-[var(--accent-strong)]">Track <ArrowRight size={13} className="ml-1 inline" /></Link></div>
    </div>
  );
};

const SummaryStat = ({ label, value }) => <div className="border-r px-2 first:pl-0 last:border-r-0 sm:px-4" style={{ borderColor: 'var(--border)' }}><span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">{label}</span><span className="mt-1 block text-xl font-black tabular-nums text-[var(--text)]">{value}</span></div>;

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

SummaryStat.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired };
TransferRow.propTypes = { item: PropTypes.shape({ status: PropTypes.string, reference: PropTypes.string, recipient_name: PropTypes.string, sender_country: PropTypes.string, recipient_country: PropTypes.string, receive_currency: PropTypes.string, send_amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), send_currency: PropTypes.string, created_at: PropTypes.string }).isRequired };

export default Dashboard;
