import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import InstagramLineIcon from 'remixicon-react/InstagramLineIcon';
import FacebookFillIcon from 'remixicon-react/FacebookFillIcon';
import LinkedinFillIcon from 'remixicon-react/LinkedinFillIcon';
import PinterestLineIcon from 'remixicon-react/PinterestLineIcon';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'Health',
  'Sports',
  'Politics',
  'Business',
  'Arts',
  'Science',
  'World',
];

const Footer = () => {
  const { apiUrl } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async e => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch(`${apiUrl}/api/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Subscription failed');

      setStatus({ type: 'success', message: 'Subscribed successfully!' });
      setEmail('');
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#141414] text-white border-t-4 border-[#D04A33] mt-16">
      {/* Top Row: Logo & Category Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-tight uppercase"
        >
          <span className="text-white">NEXUS </span>
          <span className="text-[#D04A33]">NEWS</span>
        </Link>

        <div className="flex flex-wrap gap-6 text-sm font-medium">
          {CATEGORIES.map(cat => (
            <NavLink
              key={cat}
              to={`/category/${cat.toLowerCase()}`}
              className={({ isActive }) =>
                `transition-colors ${
                  isActive
                    ? 'text-[#D04A33]'
                    : 'text-gray-200 hover:text-[#D04A33]'
                }`
              }
            >
              {cat}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Middle Row: Newsletter Form, Company Links, Social Media */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Newsletter Column */}
        <div className="md:col-span-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
            SUBSCRIBE TODAY!
          </h4>
          <form onSubmit={handleSubscribe} className="max-w-sm space-y-4">
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email *"
                className="w-full bg-transparent border border-neutral-700 focus:border-[#D04A33] text-sm text-white placeholder-neutral-500 px-4 py-3 outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#D04A33] hover:bg-[#b83d28] text-white text-sm font-medium px-6 py-2.5 transition-colors cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
            {status.message && (
              <p
                className={`text-xs mt-2 ${
                  status.type === 'success'
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }`}
              >
                {status.message}
              </p>
            )}
          </form>
        </div>

        {/* Company Column */}
        <div className="md:col-span-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
            COMPANY
          </h4>
          <ul className="space-y-3 text-sm text-gray-300">
            <li>
              <Link to="/" className="hover:text-[#D04A33] transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="hover:text-[#D04A33] transition-colors"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="hover:text-[#D04A33] transition-colors"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Media Column */}
        <div className="md:col-span-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
            SOCIAL MEDIA
          </h4>
          <ul className="space-y-3 text-sm text-gray-300">
            <li>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 hover:text-[#D04A33] transition-colors"
              >
                <InstagramLineIcon size={16} />
                <span>Instagram</span>
              </a>
            </li>
            <li>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 hover:text-[#D04A33] transition-colors"
              >
                <FacebookFillIcon size={16} />
                <span>Facebook</span>
              </a>
            </li>
            <li>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 hover:text-[#D04A33] transition-colors"
              >
                <LinkedinFillIcon size={16} />
                <span>LinkedIn</span>
              </a>
            </li>
            <li>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 hover:text-[#D04A33] transition-colors"
              >
                <PinterestLineIcon size={16} />
                <span>Pinterest</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright Row */}
      <div className="border-t border-neutral-800 py-6 text-center text-xs text-gray-400">
        Copyright © {new Date().getFullYear()} Nexus News
      </div>
    </footer>
  );
};

export default Footer;
