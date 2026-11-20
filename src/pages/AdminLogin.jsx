import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LayoutDashboard, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { apiUrl, getApiErrorMessage } from '../auth/api';
import DarkModeToggle from '../components/DarkModeToggle';

const isUserAdmin = (user, roles = []) => {
  if (user?.is_staff || user?.is_superuser) return true;
  const allRoles = [...roles, ...(Array.isArray(user?.roles) ? user.roles : [])];
  return allRoles.some((r) => typeof r === 'string' && ['admin', 'staff', 'superuser', 'administrator'].includes(r.toLowerCase()));
};

const inputClass = 'ss-input mt-2 min-h-12 text-sm';

const AdminLogin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signIn, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(location.state?.adminError || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const response = await fetch(apiUrl('/api/auth/login/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(getApiErrorMessage(data, 'Unable to sign in. Check your email and password.'));
      }

      signIn(data);
      const sessionUser = data?.user ?? data?.data?.user ?? null;
      const sessionRoles = data?.roles ?? data?.data?.roles ?? sessionUser?.roles ?? [];
      if (!isUserAdmin(sessionUser, sessionRoles)) {
        await signOut();
        throw new Error('This account is not authorized for admin access.');
      }

      const fromPath = location.state?.from?.pathname;
      navigate(fromPath && fromPath.startsWith('/admin') ? fromPath : '/admin', { replace: true });
    } catch (e) {
      setError(e.message || 'Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen px-4 py-10 sm:px-6 lg:px-8" style={{background:"var(--page)"}}><div className="absolute right-4 top-4"><DarkModeToggle compact /></div>
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl items-center gap-8 lg:grid-cols-[1fr_1fr]">
        <section className="hidden rounded-[28px] p-8 text-white lg:block" style={{background:"linear-gradient(145deg,#171717,#332a17)"}}>
          <span className="inline-flex items-center gap-2 rounded-full border border-stellar-yellow/30 bg-stellar-yellow/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-stellar-yellow">
            <ShieldCheck size={14} /> Separate Admin Access
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight">SwiftSend Operations Console</h1>
          <p className="mt-4 max-w-lg text-lg leading-8 text-slate-300">Sign in separately to monitor users, transactions, statuses, volumes, and operational health without using the regular customer app flow.</p>
          <div className="mt-8 grid gap-3 text-sm text-slate-200">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"><LayoutDashboard size={18} className="text-stellar-yellow" /> Dedicated admin route at <span className="font-mono text-stellar-yellow">/admin</span></div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"><ShieldCheck size={18} className="text-stellar-teal" /> Requires staff/superuser privileges</div>
          </div>
        </section>

        <section className="ss-surface w-full rounded-[28px] p-6 sm:p-10">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-stellar-black text-stellar-yellow"><LayoutDashboard size={18} /></span>
            <div>
              <p className="text-sm font-extrabold text-stellar-black">SwiftSend Admin</p>
              <p className="text-xs text-slate-500">Separate operations access</p>
            </div>
          </div>
          <p className="text-sm font-bold uppercase tracking-[.16em] text-stellar-teal">Admin sign in</p>
          <h2 className="ss-title mt-2 text-3xl font-bold tracking-[-.045em]">Access operations dashboard</h2>
          <p className="ss-copy mt-2 text-sm leading-6">Use your admin/staff credentials. Regular user access does not apply here.</p>

          {error ? <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</div> : null}

          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="admin-email" className="text-sm font-semibold">Admin email</label>
              <div className="relative">
                <Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 mt-1 -translate-y-1/2 text-slate-400" />
                <input id="admin-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} pl-10`} placeholder="admin@company.com" />
              </div>
            </div>
            <div>
              <label htmlFor="admin-password" className="text-sm font-semibold">Password</label>
              <div className="relative">
                <LockKeyhole size={17} className="pointer-events-none absolute left-3.5 top-1/2 mt-1 -translate-y-1/2 text-slate-400" />
                <input id="admin-password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pl-10 pr-11`} placeholder="Enter password" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-1/2 mt-1 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-stellar-black px-4 py-3.5 text-sm font-bold text-white ring-1 ring-stellar-yellow/30 transition hover:bg-swift-navy disabled:opacity-65">
              {isSubmitting ? <><LoaderCircle size={18} className="animate-spin" /> Signing in…</> : <>Sign in to admin <ArrowRight size={17} /></>}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>Admin access is separate from the customer app.</p>
            <Link to="/login" className="font-semibold text-swift-blue hover:text-stellar-teal">Customer login</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminLogin;
