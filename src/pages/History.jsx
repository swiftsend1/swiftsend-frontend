import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { getApiErrorMessage } from '../auth/api';

const statusColor = {
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  initiated: 'bg-slate-100 text-slate-700',
};

const History = () => {
  const { authFetch } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    authFetch('/api/remittances/')
      .then(async (r) => {
        const data = await r.json().catch(() => []);
        if (!r.ok) throw new Error(getApiErrorMessage(data, 'Unable to load transfers.'));
        if (!cancelled) setItems(Array.isArray(data) ? data : (data?.results || []));
      })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [authFetch]);

  return (
    <div className="min-h-full rounded-2xl bg-stellar-offwhite p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h2 className="text-3xl font-bold text-stellar-black">Transaction History</h2>
        <Link to="/send" className="bg-stellar-black text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-swift-navy ring-1 ring-stellar-yellow/30">New transfer</Link>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 mb-4">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow-md border">
          <thead className="bg-stellar-black text-white">
            <tr>
              <th className="py-3 px-4 text-left">Reference</th>
              <th className="py-3 px-4 text-left">Recipient</th>
              <th className="py-3 px-4 text-left">Corridor</th>
              <th className="py-3 px-4 text-left">Sent</th>
              <th className="py-3 px-4 text-left">Received</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="py-10 text-center text-slate-500"><span className="inline-flex items-center gap-2"><LoaderCircle size={16} className="animate-spin" /> Loading…</span></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="7" className="py-10 text-center text-slate-500">No remittances yet. <Link to="/send" className="text-swift-blue font-semibold hover:text-stellar-teal">Create one</Link>.</td></tr>
            ) : items.map((txn) => (
              <tr key={txn.reference} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4"><Link to={`/track?ref=${encodeURIComponent(txn.reference)}`} className="font-mono text-swift-blue hover:text-stellar-teal hover:underline">{txn.reference}</Link></td>
                <td className="py-3 px-4">{txn.recipient_name}</td>
                <td className="py-3 px-4">{txn.sender_country}/{txn.send_currency} → {txn.receive_currency}</td>
                <td className="py-3 px-4">{txn.send_amount} {txn.send_currency}</td>
                <td className="py-3 px-4">{txn.receive_amount} {txn.receive_currency}</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${statusColor[txn.status] || 'bg-yellow-100 text-yellow-800'}`}>
                    {(txn.status || '').replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-3 px-4">{txn.created_at ? new Date(txn.created_at).toLocaleString() : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;
