import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
  const { apiUrl, token, user, userNotifications, clearNotifications, logout } =
    useAuth();

  const [profile, setProfile] = useState(user);
  const [subEmail, setSubEmail] = useState(user?.email || '');
  const [subMsg, setSubMsg] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setProfileLoading(true);
      setProfileError('');
      try {
        const res = await fetch(`${apiUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Could not load your saved articles.');
        }
        if (!data.user) throw new Error('Your profile could not be loaded.');
        setProfile(data.user);
      } catch (error) {
        console.error('Failed to load user dashboard profile:', error);
        setProfileError(error.message);
      } finally {
        setProfileLoading(false);
      }
    };

    if (token) fetchProfile();
  }, [apiUrl, token]);

  const handleSubscribe = async e => {
    e.preventDefault();
    setSubMsg('');
    const res = await fetch(`${apiUrl}/api/subscribers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: subEmail, name: profile?.name }),
    });
    const data = await res.json();
    setSubMsg(data.message || 'Updated subscription');
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#D04A33]">
            VERIFIED USER DASHBOARD
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E1E1E] mt-1">
            Welcome, {profile?.name}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {profile?.email} • Role:{' '}
            <strong className="uppercase">{profile?.role}</strong> •{' '}
            <span className="text-emerald-600 font-semibold">Verified</span>
          </p>
        </div>

        <button
          onClick={logout}
          className="border border-gray-300 hover:border-[#D04A33] px-4 py-2 text-xs font-semibold cursor-pointer"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Real-Time New Post Notifications */}
        <section className="lg:col-span-7 bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1E1E1E]">
              Recent Post Alerts ({userNotifications.length})
            </h2>
            {userNotifications.length > 0 && (
              <button
                onClick={() => clearNotifications('user')}
                className="text-xs text-[#D04A33] hover:underline cursor-pointer"
              >
                Clear alerts
              </button>
            )}
          </div>

          {userNotifications.length === 0 ? (
            <p className="text-sm text-gray-500">
              Listening live for new articles published by the admin...
            </p>
          ) : (
            <ul className="space-y-3">
              {userNotifications.map(n => (
                <li
                  key={n.id}
                  className="p-3.5 bg-[#F6F6F6] border-l-4 border-[#D04A33] flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#1E1E1E]">
                      {n.title}
                    </p>
                    <span className="text-[11px] text-gray-500">
                      {new Date(n.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  {n.slug && (
                    <Link
                      to={`/blog/${n.slug}`}
                      className="text-xs font-semibold text-[#D04A33] hover:underline shrink-0"
                    >
                      Read →
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Newsletter Subscription Card */}
        <section className="lg:col-span-5 bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-[#1E1E1E] mb-2">
            Email Subscription
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Subscribe your email to receive headline digests and appear in the
            admin subscriber list.
          </p>
          <form onSubmit={handleSubscribe} className="space-y-3">
            <input
              type="email"
              required
              value={subEmail}
              onChange={e => setSubEmail(e.target.value)}
              className="w-full border border-gray-300 focus:border-[#D04A33] px-3.5 py-2 text-sm outline-none"
            />
            <button
              type="submit"
              className="bg-[#D04A33] hover:bg-[#b83d28] text-white text-xs font-semibold px-5 py-2.5 cursor-pointer"
            >
              Subscribe Email
            </button>
          </form>
          {subMsg && <p className="text-xs text-emerald-700 mt-3">{subMsg}</p>}
        </section>
      </div>

      {/* Saved Articles */}
      <section className="bg-white border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-[#1E1E1E] mb-4">
          Saved Articles
        </h2>
        {profileLoading ? (
          <p className="text-sm text-gray-500">Loading saved articles...</p>
        ) : profileError ? (
          <p role="alert" className="text-sm text-red-600">
            {profileError}
          </p>
        ) : !profile?.bookmarks || profile.bookmarks.length === 0 ? (
          <p className="text-sm text-gray-500">No bookmarked articles yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {profile.bookmarks.map(b => (
              <Link
                key={b._id}
                to={`/blog/${b.slug}`}
                className="border border-gray-100 p-3 hover:border-[#D04A33] block"
              >
                <p className="text-[11px] font-bold uppercase text-[#D04A33]">
                  {b.category}
                </p>
                <h3 className="text-sm font-bold text-[#1E1E1E] mt-1">
                  {b.title}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default UserDashboard;
