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
  const phone = user?.phone || user?.phone_number || user?.profile?.phone || '—';
  const country = user?.country || user?.profile?.country || '—';
  const username = user?.username || user?.email?.split('@')[0] || '—';

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6">
      <h2 className="text-3xl font-bold text-[#2C3E50] mb-6">My Profile</h2>

      <div className="bg-white rounded-xl shadow-md p-6 max-w-xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[#2C3E50] text-white flex items-center justify-center text-xl font-semibold">
            {getInitials(displayName)}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#2C3E50]">{displayName}</h3>
            <p className="text-sm text-gray-600">{email}</p>
            <p className="text-xs text-gray-500 mt-1">Username: {username}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Full Name</label>
            <div className="mt-1 border rounded-lg px-4 py-2 bg-gray-50 text-gray-800">{displayName}</div>
          </div>

          <div>
            <label className="text-sm text-gray-500">Email Address</label>
            <div className="mt-1 border rounded-lg px-4 py-2 bg-gray-50 text-gray-800">{email}</div>
          </div>

          <div>
            <label className="text-sm text-gray-500">Phone Number</label>
            <div className="mt-1 border rounded-lg px-4 py-2 bg-gray-50 text-gray-800">{phone}</div>
          </div>

          <div>
            <label className="text-sm text-gray-500">Country</label>
            <div className="mt-1 border rounded-lg px-4 py-2 bg-gray-50 text-gray-800">{country}</div>
          </div>

          <div className="pt-4">
            <button className="bg-[#2C3E50] text-white px-6 py-2 rounded-lg hover:bg-[#1f2c3e]">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
