import { Camera, Mail, MapPin, Phone, Shield, User, Calendar, Edit3 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const Profile = () => {
  const { user } = useAuth();
  const displayName = user?.name || user?.full_name || user?.first_name || user?.email?.split('@')[0] || 'SwiftSend User';
  const email = user?.email || '—';
  const phone = user?.phone || user?.phone_number || user?.profile?.phone || 'Not provided';
  const country = user?.country || user?.profile?.country || 'Kenya';
  const username = user?.username || user?.email?.split('@')[0] || '—';
  const joined = user?.date_joined ? new Date(user.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently joined';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/20">
      <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">My Profile</h1>
          <p className="mt-2 text-lg text-slate-600">Manage your account information and preferences</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_2fr] gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-100 overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 relative">
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-white p-1 shadow-xl">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-[#0f766e] to-[#22d3ee] text-white flex items-center justify-center text-3xl font-bold">
                        {getInitials(displayName)}
                      </div>
                    </div>
                    <button className="absolute bottom-2 right-2 grid h-10 w-10 place-items-center rounded-full bg-white shadow-lg text-slate-700 hover:bg-slate-50 border border-slate-200">
                      <Camera size={18} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="pt-20 pb-6 px-6 text-center">
                <h2 className="text-2xl font-bold text-slate-900">{displayName}</h2>
                <p className="text-slate-600 mt-1">@{username}</p>
                <div className="flex items-center justify-center gap-2 mt-3 text-sm text-slate-500">
                  <Calendar size={16} />
                  <span>Member since {joined}</span>
                </div>
                <button className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition">
                  <Edit3 size={18} /> Edit Profile
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-100 p-6">
              <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2"><Shield size={20} className="text-emerald-600" /> Account Security</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl"><span className="text-emerald-800 font-medium">Email Verified</span><span className="text-emerald-600">✓</span></div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl"><span className="text-slate-700">Two-Factor Auth</span><span className="text-slate-400">Not enabled</span></div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-100 overflow-hidden">
              <div className="p-6 border-b bg-gradient-to-r from-slate-50 to-white">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2"><User size={22} className="text-violet-600" /> Personal Information</h3>
                <p className="text-sm text-slate-600 mt-1">Your account details</p>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><User size={16} /> Full Name</label>
                    <div className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900 font-medium border border-slate-200">{displayName}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Mail size={16} /> Email Address</label>
                    <div className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900 font-medium border border-slate-200">{email}</div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Phone size={16} /> Phone Number</label>
                    <div className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900 font-medium border border-slate-200">{phone}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><MapPin size={16} /> Country</label>
                    <div className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900 font-medium border border-slate-200">{country}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-100 p-6">
              <h3 className="font-bold text-lg text-slate-900 mb-4">Account Activity</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50"><p className="text-2xl font-bold text-emerald-700">Active</p><p className="text-xs text-emerald-600 mt-1">Account Status</p></div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50"><p className="text-2xl font-bold text-blue-700">Verified</p><p className="text-xs text-blue-600 mt-1">KYC Status</p></div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50"><p className="text-2xl font-bold text-violet-700">Premium</p><p className="text-xs text-violet-600 mt-1">Account Type</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
