import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { apiUrl, getApiErrorMessage } from '../auth/api';

const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : '—');
const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');
const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const StatusBadge = ({ status }) => {
  const s = String(status || '').toLowerCase();
  if (s === 'completed') {
    return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"><CheckCircle2 size={12} /> Completed</span>;
  }
  if (s === 'failed') {
    return <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700"><XCircle size={12} /> Failed</span>;
  }
  if (s === 'initiated') {
    return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 capitalize"><Clock size={12} /> {s.replace(/_/g, ' ')}</span>;
  }
  return <span className="inline-flex items-center gap-1 rounded-full bg-stellar-yellow/20 px-2.5 py-1 text-xs font-semibold text-stellar-black ring-1 ring-stellar-yellow/50 capitalize"><AlertCircle size={12} /> {s.replace(/_/g, ' ') || 'unknown'}</span>;
};

const StatCard = ({ icon, label, value, hint, tone = 'default' }) => (
  <div className={`rounded-2xl border bg-white p-5 shadow-sm ${tone === 'accent' ? 'border-stellar-yellow/40 ring-1 ring-stellar-yellow/20' : 'border-slate-200'}`}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-extrabold tracking-tight text-stellar-black">{value}</p>
        {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      </div>
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-stellar-offwhite text-stellar-black ring-1 ring-slate-200">{icon}</div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { authFetch, user, roles } = useAuth();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [remittances, setRemittances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [userQuery, setUserQuery] = useState('');
  const [txQuery, setTxQuery] = useState('');
  const [txStatus, setTxStatus] = useState('all');

  const isAdmin = user?.is_staff || user?.is_superuser || (Array.isArray(roles) && roles.some((r) => ['admin', 'staff', 'superuser', 'administrator'].includes(String(r).toLowerCase())));

  const load = useCallback(async (mode = 'initial') => {
    if (mode === 'refresh') setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const [ovRes, usersRes, remRes] = await Promise.all([
        authFetch(apiUrl('/api/admin/overview/')),
        authFetch(apiUrl('/api/admin/users/')),
        authFetch(apiUrl('/api/admin/remittances/')),
      ]);
      const ov = await ovRes.json().catch(() => ({}));
      const us = await usersRes.json().catch(() => ({}));
      const rem = await remRes.json().catch(() => ({}));
      if (!ovRes.ok) throw new Error(getApiErrorMessage(ov, 'Failed to load admin overview.'));
      if (!usersRes.ok) throw new Error(getApiErrorMessage(us, 'Failed to load users.'));
      if (!remRes.ok) throw new Error(getApiErrorMessage(rem, 'Failed to load remittances.'));
      setOverview(ov);
      setUsers(Array.isArray(us.users) ? us.users : []);
      setRemittances(Array.isArray(rem.remittances) ? rem.remittances : []);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e.message || 'Failed to load admin data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authFetch]);

  useEffect(() => {
    if (isAdmin) load('initial');
    else setLoading(false);
  }, [isAdmin, load]);

  const derived = useMemo(() => {
    const totalSent = remittances.reduce((sum, r) => sum + toNumber(r.send_amount), 0);
    const totalReceived = remittances.reduce((sum, r) => sum + toNumber(r.receive_amount), 0);
    const totalFees = remittances.reduce((sum, r) => sum + toNumber(r.fee_amount), 0);
    const byStatus = remittances.reduce((acc, r) => {
      const key = String(r.status || 'unknown').toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const byChannel = remittances.reduce((acc, r) => {
      const key = String(r.channel || 'unknown').toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const activeUsers = users.filter((u) => u.is_active).length;
    const staffUsers = users.filter((u) => u.is_staff || u.is_superuser).length;
    const completed = overview?.remittances?.completed ?? byStatus.completed ?? 0;
    const totalTx = overview?.remittances?.total ?? remittances.length;
    const successRate = totalTx ? ((completed / totalTx) * 100).toFixed(1) : '0.0';
    const statusEntries = Object.entries(byStatus).sort((a, b) => b[1] - a[1]);
    const channelEntries = Object.entries(byChannel).sort((a, b) => b[1] - a[1]);
    return { totalSent, totalReceived, totalFees, activeUsers, staffUsers, successRate, statusEntries, channelEntries };
  }, [overview, remittances, users]);

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => [u.name, u.email, u.username, ...(u.roles || [])].some((v) => String(v || '').toLowerCase().includes(q)));
  }, [userQuery, users]);

  const filteredRemittances = useMemo(() => {
    const q = txQuery.trim().toLowerCase();
    return remittances.filter((r) => {
      if (txStatus !== 'all' && String(r.status || '').toLowerCase() !== txStatus) return false;
      if (!q) return true;
      return [r.reference, r.owner_email, r.sender_country, r.recipient_country, r.corridor_code, r.send_currency, r.receive_currency, r.stellar_tx_hash, r.payout_reference]
        .some((v) => String(v || '').toLowerCase().includes(q));
    });
  }, [remittances, txQuery, txStatus]);

  const statusOptions = useMemo(() => ['all', ...Array.from(new Set(remittances.map((r) => String(r.status || '').toLowerCase()).filter(Boolean)))], [remittances]);

  if (!isAdmin) {
    return (
      <div className="flex min-h-full items-center justify-center rounded-2xl bg-stellar-offwhite p-4 sm:p-6">
        <div className="max-w-md space-y-3 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-rose-600"><ShieldCheck size={22} /></div>
          <h2 className="text-xl font-bold text-stellar-black">Admin access required</h2>
          <p className="text-sm text-slate-600">You do not have permission to view the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-stellar-black via-swift-navy to-stellar-teal p-5 text-white shadow-lg sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-stellar-yellow"><LayoutDashboard size={14} /> Operations Control</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Admin Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">Monitor users, remittance operations, status health, volumes, and activity across SwiftSend from one place.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-slate-200 backdrop-blur">
              Last updated: <span className="font-semibold text-white">{lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}</span>
            </div>
            <button
              type="button"
              onClick={() => load('refresh')}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 rounded-xl bg-stellar-yellow px-4 py-2.5 text-sm font-bold text-stellar-black transition hover:bg-yellow-300 disabled:opacity-60"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /> {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {['overview', 'users', 'transactions'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${tab === t ? 'bg-white text-stellar-black shadow' : 'border border-white/20 bg-white/10 text-white hover:bg-white/20'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
      {loading && <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">Loading admin operations data…</div>}

      {!loading && tab === 'overview' && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={<Users size={20} />} label="Total Users" value={overview?.users?.total ?? users.length} hint={`${derived.activeUsers} active • ${derived.staffUsers} staff/superuser`} />
            <StatCard icon={<ArrowRightLeft size={20} />} label="Transactions" value={overview?.remittances?.total ?? remittances.length} hint={`${overview?.remittances?.completed ?? 0} completed`} />
            <StatCard icon={<TrendingUp size={20} />} label="Success Rate" value={`${derived.successRate}%`} hint={`${overview?.remittances?.failed ?? 0} failed`} tone="accent" />
            <StatCard icon={<Clock size={20} />} label="In Progress / Failed" value={(overview?.remittances?.pending || 0) + (overview?.remittances?.failed || 0)} hint={`${overview?.remittances?.pending ?? 0} in progress`} />
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Sent Volume (sample)</p>
              <p className="mt-2 text-2xl font-extrabold text-stellar-black">{derived.totalSent.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              <p className="mt-1 text-xs text-slate-500">Sum of send amounts from loaded remittances</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Received Volume (sample)</p>
              <p className="mt-2 text-2xl font-extrabold text-stellar-black">{derived.totalReceived.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              <p className="mt-1 text-xs text-slate-500">Sum of receive amounts from loaded remittances</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Fees Collected (sample)</p>
              <p className="mt-2 text-2xl font-extrabold text-stellar-black">{derived.totalFees.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              <p className="mt-1 text-xs text-slate-500">Sum of fee amounts from loaded remittances</p>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.4fr_.9fr]">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-stellar-black"><Activity size={18} className="text-stellar-teal" /> Recent Transactions</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-stellar-offwhite text-slate-700">
                    <tr>
                      <th className="p-4 text-left font-semibold">Reference</th>
                      <th className="p-4 text-left font-semibold">Corridor</th>
                      <th className="p-4 text-left font-semibold">Sent</th>
                      <th className="p-4 text-left font-semibold">Received</th>
                      <th className="p-4 text-left font-semibold">Status</th>
                      <th className="p-4 text-left font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(overview?.recent_remittances || []).length === 0 ? (
                      <tr><td colSpan="6" className="p-8 text-center text-slate-500">No recent transactions.</td></tr>
                    ) : (overview.recent_remittances || []).map((r) => (
                      <tr key={r.reference} className="hover:bg-slate-50">
                        <td className="p-4 font-mono text-xs font-semibold text-swift-blue">{r.reference}</td>
                        <td className="p-4">{r.corridor_code || '—'}</td>
                        <td className="p-4">{r.send_amount} {r.send_currency}</td>
                        <td className="p-4">{r.receive_amount} {r.receive_currency}</td>
                        <td className="p-4"><StatusBadge status={r.status} /></td>
                        <td className="p-4 text-slate-500">{formatDateTime(r.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-extrabold text-stellar-black">Status breakdown</h2>
                <div className="mt-3 space-y-2">
                  {derived.statusEntries.length === 0 ? <p className="text-sm text-slate-500">No data.</p> : derived.statusEntries.map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between gap-3 rounded-xl bg-stellar-offwhite px-3 py-2">
                      <div className="min-w-0 flex-1"><StatusBadge status={status} /></div>
                      <span className="text-sm font-extrabold text-stellar-black">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-extrabold text-stellar-black">Channels</h2>
                <div className="mt-3 space-y-2">
                  {derived.channelEntries.length === 0 ? <p className="text-sm text-slate-500">No data.</p> : derived.channelEntries.map(([channel, count]) => (
                    <div key={channel} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                      <span className="text-sm font-semibold capitalize text-slate-700">{channel}</span>
                      <span className="rounded-full bg-stellar-black px-2.5 py-0.5 text-xs font-bold text-stellar-yellow">{count}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-500">Operations monitored from available admin APIs (users, remittances, overview).</p>
              </div>
            </div>
          </section>
        </>
      )}

      {!loading && tab === 'users' && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-stellar-black"><Users size={18} className="text-stellar-teal" /> Users</h2>
              <p className="text-sm text-slate-500">{filteredUsers.length} of {users.length} users</p>
            </div>
            <label className="relative block w-full sm:w-80">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={userQuery} onChange={(e) => setUserQuery(e.target.value)} placeholder="Search name, email, role…" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-stellar-teal focus:ring-4 focus:ring-stellar-teal/20" />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-stellar-offwhite text-slate-700">
                <tr>
                  <th className="p-4 text-left font-semibold">User</th>
                  <th className="p-4 text-left font-semibold">Email</th>
                  <th className="p-4 text-left font-semibold">Roles</th>
                  <th className="p-4 text-left font-semibold">Status</th>
                  <th className="p-4 text-left font-semibold">Joined</th>
                  <th className="p-4 text-left font-semibold">Last Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-slate-500">No users match your search.</td></tr>
                ) : filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-stellar-yellow/20 font-bold text-stellar-black ring-1 ring-stellar-yellow/40">{(u.name || u.email || 'U').slice(0, 2).toUpperCase()}</div>
                        <div>
                          <div className="font-semibold text-stellar-black">{u.name || '—'}</div>
                          <div className="text-xs text-slate-500">@{u.username || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-700">{u.email || '—'}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5">{(u.roles || []).map((role) => <span key={role} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{role}</span>)}</div>
                    </td>
                    <td className="p-4">
                      {u.is_active ? <span className="font-medium text-emerald-600">Active</span> : <span className="text-slate-400">Inactive</span>}
                      {(u.is_staff || u.is_superuser) && <span className="ml-2 rounded-full bg-stellar-black px-2 py-0.5 text-xs font-semibold text-stellar-yellow">Staff</span>}
                    </td>
                    <td className="p-4 text-slate-500">{formatDate(u.date_joined)}</td>
                    <td className="p-4 text-slate-500">{formatDateTime(u.last_login)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!loading && tab === 'transactions' && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-stellar-black"><ArrowRightLeft size={18} className="text-stellar-teal" /> Transactions</h2>
              <p className="text-sm text-slate-500">{filteredRemittances.length} of {remittances.length} transactions</p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <label className="relative block sm:w-72">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={txQuery} onChange={(e) => setTxQuery(e.target.value)} placeholder="Search ref, user, corridor, hash…" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-stellar-teal focus:ring-4 focus:ring-stellar-teal/20" />
              </label>
              <select value={txStatus} onChange={(e) => setTxStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-stellar-teal focus:ring-4 focus:ring-stellar-teal/20">
                {statusOptions.map((s) => <option key={s} value={s}>{s === 'all' ? 'All statuses' : s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-stellar-offwhite text-slate-700">
                <tr>
                  <th className="p-4 text-left font-semibold">Reference</th>
                  <th className="p-4 text-left font-semibold">User</th>
                  <th className="p-4 text-left font-semibold">Route</th>
                  <th className="p-4 text-left font-semibold">Sent</th>
                  <th className="p-4 text-left font-semibold">Received</th>
                  <th className="p-4 text-left font-semibold">Fee</th>
                  <th className="p-4 text-left font-semibold">Status</th>
                  <th className="p-4 text-left font-semibold">Refs</th>
                  <th className="p-4 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRemittances.length === 0 ? (
                  <tr><td colSpan="9" className="p-8 text-center text-slate-500">No transactions match your filters.</td></tr>
                ) : filteredRemittances.map((r) => (
                  <tr key={r.reference} className="hover:bg-slate-50">
                    <td className="p-4 font-mono text-xs font-semibold text-swift-blue">{r.reference}</td>
                    <td className="p-4 text-slate-700">{r.owner_email || '—'}</td>
                    <td className="p-4">
                      <div className="font-medium text-stellar-black">{r.sender_country || '—'}→{r.recipient_country || '—'}</div>
                      <div className="text-xs text-slate-500">{r.corridor_code || '—'} • {(r.channel || '—').toString()}</div>
                    </td>
                    <td className="p-4">{r.send_amount} {r.send_currency}</td>
                    <td className="p-4">{r.receive_amount} {r.receive_currency}</td>
                    <td className="p-4">{r.fee_amount} {r.send_currency}</td>
                    <td className="p-4"><StatusBadge status={r.status} /></td>
                    <td className="p-4 text-xs text-slate-600">
                      <div className="max-w-[180px] truncate" title={r.stellar_tx_hash || ''}>Stellar: <span className="font-mono">{r.stellar_tx_hash || '—'}</span></div>
                      <div className="max-w-[180px] truncate" title={r.payout_reference || ''}>Payout: <span className="font-mono">{r.payout_reference || '—'}</span></div>
                    </td>
                    <td className="p-4 text-slate-500">
                      <div>{formatDateTime(r.created_at)}</div>
                      {r.completed_at ? <div className="text-xs text-emerald-700">Done: {formatDateTime(r.completed_at)}</div> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminDashboard;
