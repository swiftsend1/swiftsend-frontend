import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { apiUrl, getApiErrorMessage } from '../auth/api';

const inputClass = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-stellar-teal focus:ring-4 focus:ring-stellar-teal/20';

const Login = () => {
  const location = useLocation();
  const [email, setEmail] = useState(() => location.state?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const registrationSuccess = location.state?.registrationSuccess;
  const from = location.state?.from;

  const clearError = () => {
    if (error) setError('');
  };

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
      const fromPath = from?.pathname;
      const redirectTo = fromPath && !['/', '/login', '/register'].includes(fromPath)
        ? `${fromPath}${from?.search || ''}${from?.hash || ''}`
        : '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-stellar-offwhite px-4 py-10 sm:px-6 lg:px-8">
      <section className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_28px_70px_-28px_rgba(15,15,15,.2)] sm:p-10" aria-labelledby="login-heading">
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-stellar-yellow/20 text-stellar-black ring-1 ring-stellar-yellow/50"><ShieldCheck size={24} /></span>
          <p className="mt-6 text-sm font-bold uppercase tracking-[.16em] text-stellar-teal">Welcome back</p>
          <h1 id="login-heading" className="mt-2 text-3xl font-bold tracking-[-.045em] text-stellar-black">Log in to SwiftSend</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Pick up where you left off and keep moving money.</p>
        </div>

        {registrationSuccess && (
          <div className="mt-6 rounded-2xl border border-stellar-teal/30 bg-stellar-teal/10 p-4 text-sm text-swift-navy" role="status">
            Your account was created. Log in to continue.
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email address</label>
            <div className="relative">
              <Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 mt-1 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => { setEmail(event.target.value); clearError(); }}
                className={`${inputClass} pl-10`}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
            <div className="relative">
              <LockKeyhole size={17} className="pointer-events-none absolute left-3.5 top-1/2 mt-1 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => { setPassword(event.target.value); clearError(); }}
                className={`${inputClass} pl-10 pr-11`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-2 top-1/2 mt-1 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-stellar-teal/30"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-stellar-black px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 ring-1 ring-stellar-yellow/30 transition hover:-translate-y-0.5 hover:bg-swift-navy focus:outline-none focus:ring-4 focus:ring-stellar-teal/20 disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
            aria-busy={isSubmitting}
          >
            {isSubmitting ? <><LoaderCircle size={18} className="animate-spin" /> Logging in…</> : <>Log in <ArrowRight size={17} /></>}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-bold text-swift-blue underline-offset-4 hover:text-stellar-teal hover:underline">Create one free</Link>
        </p>
      </section>
    </div>
  );
};

export default Login;
