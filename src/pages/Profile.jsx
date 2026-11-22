import { ArrowRight, Calendar, CheckCircle2, LockKeyhole, Mail, MapPin, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const initials = (name) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : (parts[0] || 'U').slice(0, 2).toUpperCase();
};

export default function Profile() {
  const { user } = useAuth();
  const name = user?.name || user?.full_name || user?.first_name || user?.email?.split('@')[0] || 'SwiftSend User';
  const email = user?.email || 'Not provided';
  const phone = user?.phone || user?.phone_number || user?.profile?.phone || 'Not provided';
  const country = user?.country || user?.profile?.country || 'Not provided';
  const username = user?.username || user?.email?.split('@')[0] || 'Not provided';
  const joined = user?.date_joined ? new Date(user.date_joined).toLocaleDateString('en', { month: 'long', year: 'numeric' }) : 'Not available';
  const details = [
    { label: 'Full name', value: name, icon: UserRound, complete: Boolean(user?.name || user?.full_name || user?.first_name) },
    { label: 'Email address', value: email, icon: Mail, complete: email !== 'Not provided' },
    { label: 'Phone number', value: phone, icon: Phone, complete: phone !== 'Not provided' },
    { label: 'Country', value: country, icon: MapPin, complete: country !== 'Not provided' },
    { label: 'Username', value: username, icon: UserRound, complete: username !== 'Not provided' },
    { label: 'Member since', value: joined, icon: Calendar, complete: joined !== 'Not available' },
  ];
  const completedDetails = details.filter((detail) => detail.complete).length;
  const completion = Math.round((completedDetails / details.length) * 100);

  return (
    <div className="mx-auto max-w-5xl space-y-5 sm:space-y-7">
      <header>
        <p className="text-[10px] font-extrabold uppercase tracking-[.18em]" style={{ color: 'var(--accent-strong)' }}>Account</p>
        <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div><h2 className="ss-title text-2xl font-black sm:text-3xl">Your profile</h2><p className="ss-copy mt-1 text-sm">Manage the details and security of your SwiftSend account.</p></div>
          <Link to="/help" className="inline-flex w-fit items-center gap-1.5 text-xs font-bold text-[var(--accent-strong)] hover:underline">Need to update something? <ArrowRight size={14} /></Link>
        </div>
      </header>

      <section className="overflow-hidden rounded-[26px] border" style={{ borderColor: 'var(--border)', background: 'linear-gradient(120deg,var(--accent-soft),var(--surface))' }}>
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-4 text-2xl font-black shadow-sm" style={{ background: 'var(--accent)', color: '#17140c', borderColor: 'var(--surface)' }}>{initials(name)}</span>
            <div className="min-w-0"><h3 className="truncate text-xl font-black">{name}</h3><p className="ss-copy mt-1 truncate text-sm">{email}</p><span className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-extrabold" style={{ background: 'var(--surface)', color: 'var(--accent-strong)' }}><ShieldCheck size={13} /> Personal account</span></div>
          </div>
          <div className="w-full rounded-2xl border p-4 sm:max-w-[230px]" style={{ borderColor: 'color-mix(in srgb, var(--accent) 24%, var(--border))', background: 'color-mix(in srgb, var(--surface) 70%, transparent)' }}>
            <div className="flex items-center justify-between gap-3"><span className="text-xs font-bold">Profile completeness</span><span className="text-sm font-black" style={{ color: 'var(--accent-strong)' }}>{completion}%</span></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ background: 'var(--surface-muted)' }}><div className="h-full rounded-full transition-all" style={{ width: `${completion}%`, background: 'var(--accent)' }} /></div>
            <p className="ss-copy mt-2 text-[11px]">Keep your details current for smoother transfers.</p>
          </div>
        </div>
      </section>

      <section className="ss-surface overflow-hidden rounded-[24px]">
        <div className="border-b px-5 py-4 sm:px-6" style={{ borderColor: 'var(--border)' }}><h3 className="ss-title text-lg font-black">Personal details</h3><p className="ss-copy mt-1 text-xs">Information associated with your account.</p></div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6">{details.map(({ label, value, icon: Icon, complete }) => <div key={label} className="flex items-start gap-3 rounded-xl p-4" style={{ background: 'var(--surface-muted)' }}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: 'var(--surface)', color: 'var(--accent-strong)' }}><Icon size={17} /></span><div className="min-w-0 flex-1"><p className="ss-copy text-[10px] font-bold uppercase tracking-wider">{label}</p><p className="mt-1 break-words text-sm font-bold">{value}</p></div>{complete && <CheckCircle2 size={16} className="mt-1 shrink-0" style={{ color: 'var(--accent-strong)' }} aria-label={`${label} is available`} />}</div>)}</div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-2xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}><LockKeyhole size={18} /></span><div><p className="text-sm font-extrabold">Secure account session</p><p className="ss-copy mt-1 text-xs leading-5">Your account session is protected. Sign out whenever you use a shared device.</p></div></div>
        <div className="flex items-start gap-3 rounded-2xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}><ShieldCheck size={18} /></span><div><p className="text-sm font-extrabold">Need a correction?</p><p className="ss-copy mt-1 text-xs leading-5">Contact support if any profile detail needs to be updated or verified.</p><Link to="/help" className="mt-2 inline-flex items-center gap-1 text-xs font-black" style={{ color: 'var(--accent-strong)' }}>Open help <ArrowRight size={13} /></Link></div></div>
      </section>
    </div>
  );
}
