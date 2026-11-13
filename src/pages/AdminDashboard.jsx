import { useEffect, useState } from 'react';
import { ShieldCheck, Users, ArrowRightLeft, Activity, Clock, CheckCircle2, XCircle, AlertCircle, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { apiUrl, getApiErrorMessage } from '../auth/api';

const StatusBadge = ({ status }) => {
  const s = (status || '').toLowerCase();
  if (s === 'completed') return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"><CheckCircle2 size={12} /> Completed</span>;
  if (s === 'failed') return <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700"><XCircle size={12} /> Failed</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"><AlertCircle size={12} /> {status}</span>;
};

const AdminDashboard = () => {
  const { authFetch, user, roles } = useAuth();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [remittances, setRemittances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');

  const isAdmin = user?.is_staff || user?.is_superuser || (Array.isArray(roles) && roles.some(r => ['admin', 'staff', 'superuser'].includes(String(r).toLowerCase())));

  useEffect(() => {
    const load = async () => {
      setLoading(true);
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
        setUsers(us.users || []);
        setRemittances(rem.remittances || []);
      } catch (e) {
        setError(e.message || 'Failed to load admin data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authFetch]);

  if (!isAdmin) {
    return (
      <div className="min-h-full rounded-2xl bg-[#F8F9FA] p-4 sm:p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md text-center space-y-3">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-rose-600"><ShieldCheck size={22} /></div>
          <h2 className="text-xl font-bold text-slate-900">Admin access required</h2>
          <p className="text-sm text-slate-600">You do not have permission to view the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full rounded-2xl bg-[#F8F9FA] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2C3E50] flex items-center gap-2"><LayoutDashboard className="text-[#0f766e]" /> Admin Dashboard</h1>
            <p className="text-sm text-slate-600 mt-1">Monitor users, logins activity, and all transactions in real-time</p>
          </div>
          <div className="flex gap-2 rounded-xl bg-white p-1 shadow-sm border">
            {['overview', 'users', 'transactions'].map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize ${tab === t ? 'bg-[#0f766e] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>{t}</button>
            ))}
          </div>
        </div>

        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>}
        {loading && <div className="text-center py-12 text-slate-500">Loading admin data...</div>}

        {!loading && tab === 'overview' && overview && (
          <>
            <div className="grid md:grid-cols-4 gap-4">
              <Card icon={<Users className="text-blue-600" />} label="Total Users" value={overview.users?.total} />
              <Card icon={<ArrowRightLeft className="text-emerald-600" />} label="Total Transactions" value={overview.remittances?.total} />
              <Card icon={<CheckCircle2 className="text-green-600" />} label="Completed" value={overview.remittances?.completed} />
              <Card icon={<Clock className="text-amber-600" />} label="Pending/Failed" value={(overview.remittances?.pending || 0) + (overview.remittances?.failed || 0)} />
            </div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b"><h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Activity size={18} /> Recent Transactions</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-4 font-semibold text-slate-600">Reference</th>
                      <th className="text-left p-4 font-semibold text-slate-600">Corridor</th>
                      <th className="text-left p-4 font-semibold text-slate-600">Amount</th>
                      <th className="text-left p-4 font-semibold text-slate-600">Recipient Gets</th>
                      <th className="text-left p-4 font-semibold text-slate-600">Status</th>
                      <th className="text-left p-4 font-semibold text-slate-600">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(overview.recent_remittances || []).map((r) => (
                      <tr key={r.reference} className="hover:bg-slate-50">
                        <td className="p-4 font-mono text-xs">{r.reference}</td>
                        <td className="p-4">{r.corridor_code}</td>
                        <td className="p-4">{r.send_amount} {r.send_currency}</td>
                        <td className="p-4">{r.receive_amount} {r.receive_currency}</td>
                        <td className="p-4"><StatusBadge status={r.status} /></td>
                        <td className="p-4 text-slate-500">{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!loading && tab === 'users' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b"><h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Users size={18} /> Registered Users ({users.length})</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-slate-600">User</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Email</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Roles</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Status</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Joined</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Last Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-full bg-[#e7faf3] text-[#087869] font-semibold">{(u.name || u.email || 'U').slice(0,2).toUpperCase()}</div>
                          <div><div className="font-semibold text-slate-900">{u.name || '—'}</div><div className="text-xs text-slate-500">@{u.username}</div></div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">{u.email}</td>
                      <td className="p-4">{(u.roles || []).join(', ')}</td>
                      <td className="p-4">{u.is_active ? <span className="text-emerald-600 font-medium">Active</span> : <span className="text-slate-400">Inactive</span>} {u.is_staff && <span className="ml-2 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Staff</span>}</td>
                      <td className="p-4 text-slate-500">{u.date_joined ? new Date(u.date_joined).toLocaleDateString() : '—'}</td>
                      <td className="p-4 text-slate-500">{u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && tab === 'transactions' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b"><h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><ArrowRightLeft size={18} /> All Transactions ({remittances.length})</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-slate-600">Reference</th>
                    <th className="text-left p-4 font-semibold text-slate-600">User</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Route</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Sent</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Received</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Fee</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Status</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Stellar Hash</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {remittances.map((r) => (
                    <tr key={r.reference} className="hover:bg-slate-50">
                      <td className="p-4 font-mono text-xs">{r.reference}</td>
                      <td className="p-4 text-slate-600">{r.owner_email || '—'}</td>
                      <td className="p-4">{r.sender_country}→{r.recipient_country} ({r.corridor_code})</td>
                      <td className="p-4">{r.send_amount} {r.send_currency}</td>
                      <td className="p-4">{r.receive_amount} {r.receive_currency}</td>
                      <td className="p-4">{r.fee_amount} {r.send_currency}</td>
                      <td className="p-4"><StatusBadge status={r.status} /></td>
                      <td className="p-4 font-mono text-xs max-w-[120px] truncate">{r.stellar_tx_hash || '—'}</td>
                      <td className="p-4 text-slate-500">{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Card = ({ icon, label, value }) => (
  <div className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4">
    <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-50">{icon}</div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value ?? 0}</p>
    </div>
  </div>
);

export default AdminDashboard;
