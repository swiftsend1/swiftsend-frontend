import PropTypes from 'prop-types';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Check, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { apiUrl, getApiErrorMessage, isDuplicateRegistrationError } from '../auth/api';

const paymentImage = 'https://images.pexels.com/photos/6969933/pexels-photo-6969933.jpeg?auto=compress&cs=tinysrgb&w=1200';
const handleImageFallback = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = '/swiftsend-hero.svg';
};

const Register = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        const duplicate = response.status === 409 || isDuplicateRegistrationError(data);
        setErrorType(duplicate ? 'duplicate' : 'general');
        setError(getApiErrorMessage(data, duplicate ? 'This email is already registered. Try logging in instead.' : 'Unable to create your account. Please check your details and try again.'));
        return;
      }

      const authData = data.data ?? data;
      const hasSession = Boolean(authData.accessToken || authData.access_token || authData.access || authData.token || authData.authenticated);
      if (hasSession) {
        signIn(data);
        navigate('/dashboard', { replace: true });
        return;
      }
      navigate('/login', { replace: true, state: { registrationSuccess: true, email: normalizedEmail } });
    } catch (submitError) {
      setErrorType('general');
      setError(submitError instanceof TypeError ? 'We could not reach SwiftSend. Check your connection and try again.' : submitError.message || 'Unable to create your account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = 'ss-input mt-2 min-h-12 pl-10 pr-11 text-sm';
  const alertClass = errorType === 'duplicate' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-red-200 bg-red-50 text-red-800';

  return (
    <div className="flex min-h-[calc(100vh-76px)] items-center bg-[var(--page)] px-3 py-6 sm:px-6 sm:py-10">
      <section className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_80px_-45px_rgba(22,22,22,.45)] lg:grid-cols-[1.05fr_.95fr]" aria-labelledby="register-heading">
        <aside className="relative hidden overflow-hidden p-8 text-white lg:block lg:p-10">
          <img src={paymentImage} onError={handleImageFallback} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#161616]/80 via-[#161616]/55 to-[#6c5116]/70" />
          <div className="relative flex h-full flex-col">
            <RegisterBrandMark />
            <div className="mt-auto">
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#e3bb49]">Start simple</p>
              <h1 className="mt-3 max-w-sm text-4xl font-black leading-[.98] tracking-[-.06em]">Your money, one clear view.</h1>
              <p className="mt-5 max-w-sm text-sm leading-6 text-white/60">Create an account to send, receive, and keep your transfers moving.</p>
              <div className="mt-8 space-y-3">
                {['Transparent quotes', 'Trackable transfers', 'Secure account access'].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm font-semibold text-white/75"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#e3bb49]/20 text-[#e3bb49]"><Check size={13} strokeWidth={3} /></span>{item}</div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="p-5 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-md">
            <div className="relative mb-6 h-28 overflow-hidden rounded-3xl lg:hidden">
              <img src={paymentImage} onError={handleImageFallback} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#161616]/45 to-[#6c5116]/20" />
            </div>
            <div className="flex items-center gap-3 lg:hidden"><RegisterBrandMark light /><span className="text-sm font-black tracking-[-.03em] text-[var(--text)]">SwiftSend</span></div>
            <div className="mt-7 sm:mt-2">
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-[var(--accent-strong)]">Get started</p>
              <h2 id="register-heading" className="ss-title mt-2 text-3xl font-black tracking-[-.05em] sm:text-4xl">Create your account</h2>
              <p className="ss-copy mt-3 text-sm">Set up your account in under a minute.</p>
            </div>

            {error && <div role="alert" aria-live="polite" className={'mt-6 flex gap-2 rounded-2xl border p-3.5 text-sm ' + alertClass}><AlertCircle size={17} className="mt-0.5 shrink-0" /><div><p className="font-black">{errorType === 'duplicate' ? 'Account already exists' : 'We could not create your account'}</p><p className="mt-1 leading-5">{error}</p>{errorType === 'duplicate' && <Link to="/login" state={{ email }} className="mt-2 inline-flex items-center gap-1 font-black underline">Log in instead <ArrowRight size={13} /></Link>}</div></div>}

            <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="register-name" className="text-xs font-black text-[var(--text)]">Full name</label>
                <div className="relative">
                  <UserRound size={16} className="absolute left-3.5 top-1/2 mt-1 -translate-y-1/2 text-[var(--muted)]" />
                  <input id="register-name" name="name" type="text" required maxLength={150} autoComplete="name" value={name} onChange={(event) => { setName(event.target.value); clearError(); }} className={fieldClass} placeholder="Your full name" />
                </div>
              </div>
              <div>
                <label htmlFor="register-email" className="text-xs font-black text-[var(--text)]">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 mt-1 -translate-y-1/2 text-[var(--muted)]" />
                  <input id="register-email" name="email" type="email" required autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); clearError(); }} className={fieldClass} placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between"><label htmlFor="register-password" className="text-xs font-black text-[var(--text)]">Password</label><span className="ss-copy text-[10px]">8+ characters</span></div>
                <div className="relative">
                  <LockKeyhole size={16} className="absolute left-3.5 top-1/2 mt-1 -translate-y-1/2 text-[var(--muted)]" />
                  <input id="register-password" name="password" type={showPassword ? 'text' : 'password'} required minLength={8} autoComplete="new-password" value={password} onChange={(event) => { setPassword(event.target.value); clearError(); }} className={fieldClass} placeholder="Create a secure password" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 mt-1 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-muted)]" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="ss-primary min-h-12 w-full disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? <><LoaderCircle size={17} className="animate-spin" /> Creating account…</> : <>Create free account <ArrowRight size={17} /></>}</button>
            </form>

            <p className="ss-copy mt-7 text-center text-sm">Already have an account? <Link to="/login" className="font-black text-[var(--accent-strong)] underline underline-offset-4">Log in</Link></p>
          </div>
        </div>
      </section>
    </div>
  );
};

const RegisterBrandMark = ({ light = false }) => (
  <span className={light ? 'grid h-10 w-10 place-items-center rounded-xl bg-[#171717]' : 'grid h-10 w-10 place-items-center rounded-xl bg-[#e3bb49] text-[#171717]'}>
    <span className="relative block h-4 w-5">
      <i aria-hidden="true" className={light ? 'absolute left-0 top-1 block h-1.5 w-4 rounded-full bg-white' : 'absolute left-0 top-1 block h-1.5 w-4 rounded-full bg-[#171717]'} />
      <i aria-hidden="true" className={light ? 'absolute right-0 top-4 block h-1.5 w-5 rounded-full bg-[#e3bb49]' : 'absolute right-0 top-4 block h-1.5 w-5 rounded-full bg-[#171717]'} />
    </span>
  </span>
);

RegisterBrandMark.propTypes = { light: PropTypes.bool };

export default Register;
