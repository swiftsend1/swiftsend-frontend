import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { apiUrl, getApiErrorMessage, isDuplicateRegistrationError } from '../auth/api';

const inputClass = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-stellar-teal focus:ring-4 focus:ring-stellar-teal/20';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const clearError = () => {
    if (error) {
      setError('');
      setErrorType('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setErrorType('');
    setIsSubmitting(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response = await fetch(apiUrl('/api/auth/register/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: name.trim(), email: normalizedEmail, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const isDuplicate = response.status === 409 || isDuplicateRegistrationError(data);
        const fallback = isDuplicate
          ? 'This email is already registered. Try logging in instead.'
          : 'Unable to create your account. Please check your details and try again.';

        setErrorType(isDuplicate ? 'duplicate' : 'general');
        setError(getApiErrorMessage(data, fallback));
        return;
      }

      const authData = data.data ?? data;
      const hasSession = Boolean(
        authData.accessToken
        || authData.access_token
        || authData.access
        || authData.token
        || authData.authenticated,
      );

      if (hasSession) {
        signIn(data);
        navigate('/dashboard', { replace: true });
        return;
      }

      navigate('/login', {
        replace: true,
        state: { registrationSuccess: true, email: normalizedEmail },
      });
    } catch (requestError) {
      setErrorType('general');
      setError(requestError instanceof TypeError
        ? 'We could not reach SwiftSend. Check your connection and try again.'
        : requestError.message || 'Unable to create your account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-stellar-offwhite px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_70px_-28px_rgba(15,15,15,.2)] lg:grid-cols-[.9fr_1.1fr]">
        <aside className="relative overflow-hidden bg-stellar-black p-7 text-white sm:p-10 lg:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-stellar-yellow/10 blur-3xl" />
          <div className="absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-stellar-teal/10 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-stellar-yellow/30 bg-stellar-yellow/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[.14em] text-stellar-yellow">
              <LockKeyhole size={14} />
              Join SwiftSend
            </span>
            <h1 className="mt-7 text-3xl font-bold tracking-[-.05em] sm:text-4xl">Move money with more confidence.</h1>
            <p className="mt-4 max-w-sm leading-7 text-slate-300">Create one account to send, receive, and keep track of every transfer in one calm, secure place.</p>

            <div className="mt-10 space-y-5">
              {[
                'See the full cost before you send',
                'Track transfers from start to finish',
                'Access your account on any device',
              ].map((benefit) => (
                <div key={benefit} className="flex items-start gap-3 text-sm text-slate-200">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-stellar-teal/20 text-stellar-teal"><Check size={13} strokeWidth={3} /></span>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="p-6 sm:p-10 lg:p-12" aria-labelledby="register-heading">
          <div className="mx-auto max-w-md">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.16em] text-stellar-teal">Get started</p>
              <h2 id="register-heading" className="mt-2 text-3xl font-bold tracking-[-.045em] text-slate-950">Create your account</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">It only takes a minute to set up your SwiftSend account.</p>
            </div>

            {error && (
              <div id="register-error" className={`mt-6 flex gap-3 rounded-2xl border p-4 text-sm ${errorType === 'duplicate' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-red-200 bg-red-50 text-red-800'}`} role="alert" aria-live="polite">
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold">{errorType === 'duplicate' ? 'Account already exists' : 'We could not create your account'}</p>
                  <p className="mt-1 leading-6">{error}</p>
                  {errorType === 'duplicate' && (
                    <Link to="/login" state={{ email }} className="mt-2 inline-flex items-center gap-1 font-bold underline underline-offset-2 hover:no-underline">
                      Log in instead <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            )}

            <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="text-sm font-semibold text-slate-700">Full name</label>
                <div className="relative">
                  <UserRound size={17} className="pointer-events-none absolute left-3.5 top-1/2 mt-1 -translate-y-1/2 text-slate-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    maxLength={150}
                    autoComplete="name"
                    value={name}
                    onChange={(event) => { setName(event.target.value); clearError(); }}
                    className={`${inputClass} pl-10`}
                    placeholder="e.g. David Moenga"
                  />
                </div>
              </div>

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
                    aria-invalid={errorType === 'duplicate'}
                    aria-describedby={errorType === 'duplicate' ? 'register-error' : undefined}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
                  <span className="text-xs text-slate-400">8+ characters</span>
                </div>
                <div className="relative">
                  <LockKeyhole size={17} className="pointer-events-none absolute left-3.5 top-1/2 mt-1 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => { setPassword(event.target.value); clearError(); }}
                    className={`${inputClass} pl-10 pr-11`}
                    placeholder="Create a secure password"
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
                {isSubmitting ? <><LoaderCircle size={18} className="animate-spin" /> Creating account…</> : <>Create free account <ArrowRight size={17} /></>}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-swift-blue underline-offset-4 hover:text-stellar-teal hover:underline">Log in</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Register;
