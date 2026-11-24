// src/pages/LoginPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = ({ portalRole = 'user' }) => {
  const { apiUrl, saveSession } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isAdminPortal = portalRole === 'admin';
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  // Support verification links that still point to /login?token=...
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token || isAdminPortal) return;

    let ignore = false;
    const verifyEmailToken = async () => {
      setLoading(true);
      setError('');
      setInfo('Verifying your email address...');
      try {
        const res = await fetch(`${apiUrl}/api/auth/verify/${token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        if (ignore) return;

        // Remove the token from the URL and let the user sign in explicitly.
        setSearchParams({}, { replace: true });
        setInfo(
          'Email confirmed successfully! Please sign in to access your account.',
        );
      } catch (err) {
        if (!ignore) {
          setInfo('');
          setError(err.message || 'Verification link is invalid or expired.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    verifyEmailToken();
    return () => {
      ignore = true;
    };
  }, [
    searchParams,
    apiUrl,
    isAdminPortal,
    navigate,
    setSearchParams,
  ]);

  const handleResendVerification = async () => {
    if (!form.email) {
      setError('Please enter your email address first.');
      return;
    }
    setResending(true);
    setError('');
    setInfo('');

    try {
      const res = await fetch(`${apiUrl}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setInfo(data.message);
      setCanResend(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setInfo('');
    setCanResend(false);
    setLoading(true);

    try {
      if (!isAdminPortal && mode === 'register') {
        const res = await fetch(`${apiUrl}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setInfo(data.message);
        setCanResend(true);
        setMode('login');
        setForm(prev => ({ ...prev, name: '', password: '' }));
        return;
      }

      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          expectedRole: isAdminPortal ? 'admin' : 'user',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.needsVerification) setCanResend(true);
        throw new Error(data.message);
      }

      saveSession(data.token, data.user);
      const redirectTo = searchParams.get('redirect');
      const safeRedirect =
        redirectTo?.startsWith('/') && !redirectTo.startsWith('//')
          ? redirectTo
          : '/user/dashboard';
      navigate(isAdminPortal ? '/admin/dashboard' : safeRedirect);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[70vh] bg-[#F6F6F6] flex items-center justify-center px-4 py-12">
      <div className="bg-white max-w-md w-full p-8 border border-gray-200">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#D04A33]">
          {isAdminPortal ? 'VERIFIED ADMIN ACCESS' : 'VERIFIED READER PORTAL'}
        </span>
        <h1 className="text-2xl font-bold text-[#1E1E1E] mt-1 mb-6">
          {isAdminPortal
            ? 'Admin Sign In'
            : mode === 'login'
              ? 'User Sign In'
              : 'Create Verified User Account'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isAdminPortal && mode === 'register' && (
            <input
              type="text"
              required
              placeholder="Full Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 focus:border-[#D04A33] px-3.5 py-2.5 text-sm outline-none"
            />
          )}

          <input
            type="email"
            required
            placeholder="Email Address"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full border border-gray-300 focus:border-[#D04A33] px-3.5 py-2.5 text-sm outline-none"
          />

          <input
            type="password"
            required
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full border border-gray-300 focus:border-[#D04A33] px-3.5 py-2.5 text-sm outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1E1E1E] hover:bg-[#D04A33] text-white text-sm font-medium py-2.5 transition-colors cursor-pointer disabled:opacity-60"
          >
            {loading
              ? 'Please wait...'
              : isAdminPortal
                ? 'Sign In to Admin Dashboard'
                : mode === 'login'
                  ? 'Sign In to User Dashboard'
                  : 'Create Account & Send Verification'}
          </button>
        </form>

        {error && <p className="text-xs text-red-600 mt-4">{error}</p>}

        {info && (
          <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 mt-4 leading-relaxed">
            {info}
          </div>
        )}

        {!isAdminPortal && canResend && (
          <button
            type="button"
            disabled={resending}
            onClick={handleResendVerification}
            className="mt-3 text-xs font-semibold text-[#D04A33] hover:underline cursor-pointer disabled:opacity-60"
          >
            {resending
              ? 'Sending new verification link...'
              : "Didn't receive the email? Resend verification link"}
          </button>
        )}

        {!isAdminPortal && (
          <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-600 flex justify-between">
            <span>
              {mode === 'login'
                ? 'Need an account?'
                : 'Already have an account?'}
            </span>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
                setInfo('');
                setCanResend(false);
              }}
              className="text-[#D04A33] font-semibold hover:underline cursor-pointer"
            >
              {mode === 'login' ? 'Register' : 'Sign In'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default LoginPage;
