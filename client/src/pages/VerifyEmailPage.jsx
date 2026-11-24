// src/pages/VerifyEmailPage.jsx
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const { apiUrl } = useAuth();
  const token = searchParams.get('token');
  const [status, setStatus] = useState(
    token ? 'Verifying your account...' : 'Missing verification token.',
  );
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    let ignore = false;

    fetch(`${apiUrl}/api/auth/verify/${token}`)
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Verification failed.');
        if (ignore) return;

        setVerified(true);
        setStatus(
          'Email confirmed successfully! Please sign in to access your account.',
        );
      })
      .catch(err => {
        if (!ignore) {
          setVerified(prev => {
            if (!prev) {
              setStatus(
                err.message || 'Invalid or expired verification token.',
              );
            }
            return prev;
          });
        }
      });

    return () => {
      ignore = true;
    };
  }, [searchParams, token, apiUrl]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center bg-[#F6F6F6] px-4">
      <div className="bg-white max-w-md w-full p-8 border border-gray-200 text-center">
        <h1 className="text-xl font-bold text-[#1E1E1E] mb-3">
          Account Verification
        </h1>
        <p
          className={`text-sm mb-6 ${
            verified ? 'text-emerald-700' : 'text-gray-700'
          }`}
        >
          {status}
        </p>
        <Link
          to="/login"
          className="inline-block bg-[#D04A33] hover:bg-[#b83d28] text-white text-xs font-semibold px-5 py-2.5 transition-colors"
        >
          {verified ? 'Go to Sign In' : 'Back to Sign In'}
        </Link>
      </div>
    </main>
  );
};

export default VerifyEmailPage;
