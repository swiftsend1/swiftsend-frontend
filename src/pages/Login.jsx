import PropTypes from 'prop-types';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { apiUrl, getApiErrorMessage } from '../auth/api';

const paymentImage = 'https://images.pexels.com/photos/6969933/pexels-photo-6969933.jpeg?auto=compress&cs=tinysrgb&w=1200';
const handleImageFallback = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = '/swiftsend-hero.svg';
};

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState(() => location.state?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const registrationSuccess = location.state?.registrationSuccess;
  const from = location.state?.from;

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
      if (!response.ok) throw new Error(getApiErrorMessage(data, 'Unable to sign in. Check your email and password.'));

      signIn(data);
      const fromPath = from?.pathname;
      const redirectTo = fromPath && !['/', '/login', '/register'].includes(fromPath)
        ? fromPath + (from?.search || '') + (from?.hash || '')
        : '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      setError(submitError.message || 'Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = 'ss-input min-h-12 pl-10 pr-11 text-sm';

  return (
    <div className="flex min-h-[calc(100vh-76px)] items-center bg-[var(--page)] px-3 py-6 sm:px-6 sm:py-10">
      <section className="mx-auto grid min-w-0 w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_80px_-45px_rgba(22,22,22,.45)] lg:grid-cols-[.9fr_1.1fr]" aria-labelledby="login-heading">
        <aside className="relative hidden overflow-hidden p-8 text-white lg:block lg:p-10">
          <img src={paymentImage} onError={handleImageFallback} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#161616]/80 via-[#161616]/55 to-[#6c5116]/70" />
          <div className="relative flex h-full flex-col">
            <BrandMark />
            <div className="mt-auto">
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#e3bb49]">Your money, in motion</p>
              <h2 className="mt-3 max-w-xs text-4xl font-black leading-[.98] tracking-[-.06em]">Pick up right where you left off.</h2>
              <p className="mt-5 max-w-xs text-sm leading-6 text-white/60">One place to send, receive, and track every transfer.</p>
              <div className="mt-8 flex items-center gap-3 text-xs font-bold text-white/70"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#e3bb49] text-[#171717]"><ShieldCheck size={15} /></span> Protected account access</div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 p-5 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-md">
            <div className="relative mb-6 h-28 overflow-hidden rounded-3xl lg:hidden">
              <img src={paymentImage} onError={handleImageFallback} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#161616]/45 to-[#6c5116]/20" />
            </div>
            <div className="flex items-center gap-3 lg:hidden"><BrandMark light /><span className="text-sm font-black tracking-[-.03em] text-[var(--text)]">SwiftSend</span></div>
            <div className="mt-7 sm:mt-2">
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-[var(--accent-strong)]">Welcome back</p>
              <h1 id="login-heading" className="ss-title mt-2 text-3xl font-black tracking-[-.05em] sm:text-4xl">Log in to SwiftSend</h1>
              <p className="ss-copy mt-3 text-sm">Your transfers are waiting.</p>
            </div>

            {registrationSuccess && <div role="status" className="mt-6 rounded-2xl border border-[var(--accent)] bg-[var(--accent-soft)] p-3.5 text-sm font-semibold text-[var(--text)]">Your account was created. Log in to continue.</div>}
            {error && <div role="alert" aria-live="polite" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-sm font-semibold text-red-800">{error}</div>}

            <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="login-email" className="mb-2 block text-xs font-black text-[var(--text)]">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input id="login-email" name="email" type="email" required autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(''); }} className={fieldClass} placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between"><label htmlFor="login-password" className="block text-xs font-black text-[var(--text)]">Password</label><span className="flex items-center gap-3"><Link to="/help" className="text-[11px] font-bold text-[var(--accent-strong)] hover:underline">Need help?</Link><Link to="/forgot-password" className="text-[11px] font-bold text-[var(--accent-strong)] hover:underline">Forgot password?</Link></span></div>
                <div className="relative">
                  <LockKeyhole size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} className={fieldClass} placeholder="Enter your password" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-muted)]" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="ss-primary min-h-12 w-full disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? <><LoaderCircle size={17} className="animate-spin" /> Logging in…</> : <>Log in <ArrowRight size={17} /></>}</button>
            </form>

            <p className="ss-copy mt-7 text-center text-sm">Don&apos;t have an account? <Link to="/register" className="font-black text-[var(--accent-strong)] underline underline-offset-4">Create one free</Link></p>
          </div>
        </div>
      </section>
    </div>
  );
};

const BrandMark = ({ light = false }) => (
  <span className={light ? 'grid h-10 w-10 place-items-center rounded-xl bg-[#171717]' : 'grid h-10 w-10 place-items-center rounded-xl bg-[#e3bb49] text-[#171717]'}>
    <span className="relative block h-4 w-5">
      <i aria-hidden="true" className={light ? 'absolute left-0 top-1 block h-1.5 w-4 rounded-full bg-white' : 'absolute left-0 top-1 block h-1.5 w-4 rounded-full bg-[#171717]'} />
      <i aria-hidden="true" className={light ? 'absolute right-0 top-4 block h-1.5 w-5 rounded-full bg-[#e3bb49]' : 'absolute right-0 top-4 block h-1.5 w-5 rounded-full bg-[#171717]'} />
    </span>
  </span>
);

BrandMark.propTypes = { light: PropTypes.bool };

export default Login;
