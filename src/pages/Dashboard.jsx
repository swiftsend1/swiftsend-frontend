import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, CheckCircle2, Clock3,
  Globe2, Plus, Send, ShieldCheck, WalletCards, Activity,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { getApiErrorMessage } from '../auth/api';

const money = (amount, currency) => {
  if (amount === null || amount === undefined || amount === '') return '—';
  const value = Number(amount);
  if (!Number.isFinite(value)) return `${amount} ${currency || ''}`.trim();
  return `${new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(value)} ${currency || ''}`.trim();
};
const readableStatus = (status = '') => status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
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
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [authFetch]);

  const stats = useMemo(() => ({
    total: items.length,
    completed: items.filter((item) => ['completed', 'delivered'].includes((item.status || '').toLowerCase())).length,
    pending: items.filter((item) => !['completed', 'delivered', 'failed', 'cancelled'].includes((item.status || '').toLowerCase())).length,
  }), [items]);

  const shortcuts = [
    { to: '/send', title: 'Send money', description: 'Start a cross-border transfer', icon: Send, primary: true },
    { to: '/wallet', title: 'My wallet', description: 'View wallet actions and balances', icon: WalletCards },
    { to: '/track', title: 'Track transfer', description: 'Check a transfer reference', icon: Globe2 },
  ];

  return (
    <div className="ss-page space-y-6 sm:space-y-8">
      <section className="relative overflow-hidden rounded-[24px] p-5 text-white sm:p-7" style={{ background: 'linear-gradient(125deg,#f1cf72 0%,#e4b638 55%,#c99316 100%)' }}>
        <div className="pointer-events-none absolute -right-16 -top-28 h-80 w-80 rounded-full border-[1px] border-white/10 bg-white/5 ss-glow" />
        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end text-[#17140c]">
          <div className="max-w-2xl">
            <span className="ss-enter inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/25 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.15em] text-black" style={{ animationDelay: '0ms' }}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 ss-blink" /> Your money, in motion
            </span>
            <h2 className="ss-enter mt-5 text-3xl font-extrabold tracking-[-.045em] sm:text-4xl" style={{ animationDelay: '110ms' }}>Good to see you, {getDisplayName(user)}.</h2>
            <p className="ss-enter mt-3 max-w-xl text-sm leading-7 text-black/70 sm:text-base" style={{ animationDelay: '210ms' }}>Send across borders with more clarity. Keep an eye on every transfer from one simple workspace.</p>
          </div>
          <Link to="/send" className="ss-press ss-enter inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-black/10 transition active:scale-[.98]" style={{ background: '#171717', animationDelay: '300ms' }}>
            <Plus size={17} /> New transfer <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Transfers created', value: loading ? '—' : stats.total, icon: Activity },
            { label: 'Successfully completed', value: loading ? '—' : stats.completed, icon: CheckCircle2 },
            { label: 'In progress', value: loading ? '—' : stats.pending, icon: Clock3 },
          ].map(({ label, value, icon: Icon }, i) => (
            <div key={label} className="ss-enter rounded-2xl border border-black/10 bg-white/35 p-4 text-[#17140c] backdrop-blur-sm" style={{ animationDelay: `${350 + i * 55}ms` }}>
              <div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold text-black/60">{label}</span><Icon size={16} className="text-black" /></div>
              <p className="mt-2 text-2xl font-extrabold tabular-nums">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[.16em]" style={{ color: 'var(--accent)' }}>Quick actions</p><h3 className="ss-title mt-1 text-xl font-extrabold">What would you like to do?</h3></div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {shortcuts.map(({ to, title, description, icon: Icon, primary }, i) => (
            <Link key={to} to={to} className="ss-enter ss-press group flex items-center gap-4 rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
              style={{ background: primary ? 'var(--accent-soft)' : 'var(--surface)', borderColor: primary ? 'color-mix(in srgb, var(--accent) 35%, var(--border))' : 'var(--border)', animationDelay: `${i * 45 + 30}ms` }}>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: primary ? 'var(--accent)' : 'var(--surface-muted)', color: primary ? '#fff' : 'var(--accent-strong)' }}><Icon size={20} /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-extrabold" style={{ color: 'var(--text)' }}>{title}</span><span className="mt-1 block text-xs leading-5" style={{ color: 'var(--muted)' }}>{description}</span></span>
              <ArrowRight size={17} className="shrink-0 transition group-hover:translate-x-1" style={{ color: 'var(--muted)' }} />
            </Link>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-5 sm:px-6" style={{ borderColor: 'var(--border)' }}>
          <div><p className="text-xs font-bold uppercase tracking-[.16em]" style={{ color: 'var(--accent)' }}>Your activity</p><h3 className="ss-title mt-1 text-lg font-extrabold">Recent transfers</h3></div>
          <Link to="/history" className="ss-press inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: 'var(--accent-strong)' }}>View all <ArrowRight size={15} /></Link>
        </div>
        {error && <div className="m-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</div>}
        {loading ? (
          <div className="px-6 py-12 text-center text-sm" style={{ color: 'var(--muted)' }}>Loading your transfers…</div>
        ) : items.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl" style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}><Send size={21} /></span>
            <p className="ss-title mt-4 font-bold">Your transfer activity will appear here</p>
            <p className="ss-copy mt-1 text-sm">Create your first transfer to get started.</p>
            <Link to="/send" className="ss-press ss-primary mt-5">Start a transfer <ArrowRight size={16} /></Link>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {items.slice(0, 5).map((item, i) => {
              const tone = statusTone(item.status);
              return (
                <Link key={item.reference} to={`/track?ref=${encodeURIComponent(item.reference)}`} className="flex flex-wrap items-center gap-3 ss-press ss-enter px-5 py-4 transition hover:bg-black/[.02] sm:px-6 dark:hover:bg-white/[.025]"
                  style={{ animationDelay: `${i * 45}ms` }}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: 'var(--surface-muted)', color: 'var(--accent-strong)' }}><ArrowUpRight size={18} /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold" style={{ color: 'var(--text)' }}>{item.recipient_name || 'Transfer recipient'}</span><span className="mt-1 block truncate font-mono text-[11px]" style={{ color: 'var(--muted)' }}>{item.reference} · {item.sender_country || '—'} → {item.recipient_country || item.receive_currency || '—'}</span></span>
                  <span className="text-right"><span className="block text-sm font-extrabold tabular-nums" style={{ color: 'var(--text)' }}>{money(item.send_amount, item.send_currency)}</span><span className="mt-1 block text-[11px]" style={{ color: 'var(--muted)' }}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Date unavailable'}</span></span>
                  <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: tone.bg, color: tone.color }}>{readableStatus(item.status)}</span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 ss-enter" style={{ background: 'var(--surface-muted)', borderColor: 'var(--border)' }}>
        <div className="flex items-start gap-3"><span className="mt-0.5 text-[var(--accent)]"><ShieldCheck size={20} /></span><div><p className="text-sm font-extrabold" style={{ color: 'var(--text)' }}>Know where your transfer stands</p><p className="mt-1 text-xs leading-5" style={{ color: 'var(--muted)' }}>Use your transfer reference to view its latest recorded status and progress.</p></div></div>
        <Link to="/track" className="ss-press inline-flex shrink-0 items-center gap-2 text-sm font-bold" style={{ color: 'var(--accent-strong)' }}>Track a transfer <ArrowRight size={15} /></Link>
      </section>
    </div>
  );
};

export default Dashboard;
