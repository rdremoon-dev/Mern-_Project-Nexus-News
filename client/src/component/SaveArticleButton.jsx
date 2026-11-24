import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SaveArticleButton = ({ blogId, className = '' }) => {
  const { apiUrl, token, user, isAuthenticated, updateBookmarks } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isSaved = (user?.bookmarks || []).some(bookmark => {
    const bookmarkId =
      typeof bookmark === 'object' ? bookmark?._id : bookmark;
    return String(bookmarkId) === String(blogId);
  });

  const handleClick = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch(`${apiUrl}/api/auth/bookmarks/${blogId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not save article.');
      updateBookmarks(data.bookmarks);
    } catch (requestError) {
      setError(requestError.message || 'Could not update saved article.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={saving}
        aria-label={
          saving
            ? 'Saving article'
            : isSaved
              ? 'Remove article from saved articles'
              : 'Save article'
        }
        aria-pressed={isSaved}
        title={
          saving
            ? 'Saving article'
            : isAuthenticated
              ? isSaved
                ? 'Remove from saved articles'
                : 'Save article'
              : 'Sign in to save this article'
        }
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#1E1E1E] shadow hover:text-[#D04A33] disabled:opacity-60 cursor-pointer"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill={isSaved ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-4-6 4V4.75Z"
          />
        </svg>
      </button>
      {error && (
        <span
          role="alert"
          className="mt-1 block w-max max-w-56 rounded bg-white px-2 py-1 text-[11px] text-red-700 shadow"
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default SaveArticleButton;
