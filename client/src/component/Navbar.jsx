import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import InstagramLineIcon from 'remixicon-react/InstagramLineIcon';
import FacebookFillIcon from 'remixicon-react/FacebookFillIcon';
import LinkedinFillIcon from 'remixicon-react/LinkedinFillIcon';
import PinterestLineIcon from 'remixicon-react/PinterestLineIcon';
import MenuLineIcon from 'remixicon-react/MenuLineIcon';
import CloseLineIcon from 'remixicon-react/CloseLineIcon';
import UserLineIcon from 'remixicon-react/UserLineIcon';
import { useAuth } from '../context/AuthContext';
import 'animate.css';

const NAV_LINKS = [
  { name: 'Health', path: '/category/health' },
  { name: 'Sports', path: '/category/sports' },
  { name: 'Politics', path: '/category/politics' },
  { name: 'Business', path: '/category/business' },
  { name: 'Arts', path: '/category/arts' },
  { name: 'Science', path: '/category/science' },
  { name: 'World', path: '/category/world' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const Navbar = ({ onOpenSubscribe }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdminPage = useLocation().pathname.startsWith('/admin');
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const accountPath = isAdmin ? '/admin/dashboard' : '/user/dashboard';

  const toggleMenu = () => setMobileMenuOpen(prev => !prev);

  return (
    <header className="w-full bg-white border-b border-slate-950 sticky top-0 z-40">
      {/* Top Bar: Socials, Brand Logo, Subscribe CTA */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between border-b border-black">
        {/* Left: Social Media Icons */}
        <div className="hidden md:flex items-center space-x-4 text-[#1E1E1E]">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="hover:text-[#D04A33] transition-colors"
          >
            <InstagramLineIcon size={18} />
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
            className="hover:text-[#D04A33] transition-colors"
          >
            <FacebookFillIcon size={18} />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="hover:text-[#D04A33] transition-colors"
          >
            <LinkedinFillIcon size={18} />
          </a>
          <a
            href="https://pinterest.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Pinterest"
            className="hover:text-[#D04A33] transition-colors"
          >
            <PinterestLineIcon size={18} />
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 text-[#1E1E1E] hover:text-[#D04A33]"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? (
            <CloseLineIcon size={24} />
          ) : (
            <MenuLineIcon size={24} />
          )}
        </button>

        {/* Center: Dual-Tone Logo */}
        <Link
          to="/"
          className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase select-none"
        >
          <span className="text-[#1E1E1E] font-lexend font-extrabold mr-1 tracking-wide">
            NEXUS{' '}
          </span>
          <span className="text-[#D04A33] font-lexend font-extrabold mr-1 tracking-wide">
            NEWS
          </span>
        </Link>

        {/* Right: Subscribe and Sign In Buttons */}
        <div className="flex items-center space-x-4">
          {!isAdminPage && isAuthenticated && (
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to={accountPath}
                className="text-[#1E1E1E] hover:text-[#D04A33] transition-colors"
                aria-label="Open dashboard"
                title="Open dashboard"
              >
                <UserLineIcon size={20} />
              </Link>
              <button
                type="button"
                onClick={logout}
                className="text-xs font-semibold text-[#1E1E1E] hover:text-[#D04A33] cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
          {!isAdminPage && !isAuthenticated && (
            <Link
              to="/login"
              className="hidden sm:inline-block hover:bg-[#000000] transition-colors bg-[#D04A33] text-white px-2 py-2 rounded-full animate__animated animate__pulse animate__infinite	infinite"
              aria-label="Sign In"
            >
              <UserLineIcon size={20} />
            </Link>
          )}
          <button
            onClick={onOpenSubscribe}
            className="bg-[#1E1E1E] hover:bg-[#D04A33] text-white text-xs sm:text-sm font-medium px-5 py-2.5 transition-colors duration-200 cursor-pointer"
          >
            Subscribe
          </button>
        </div>
      </div>

      {/* Bottom Bar: Desktop Category Navigation */}
      <nav className="hidden md:flex justify-center items-center space-x-8 h-16 max-w-7xl mx-auto px-4">
        {NAV_LINKS.map(link => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'text-[#D04A33] font-semibold'
                  : 'text-[#1E1E1E] hover:text-[#D04A33]'
              }`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>

      {/* Mobile Navigation Drawer (Slides smoothly from the right) */}
      <div
        className={`fixed inset-y-0 right-0 w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <span className="text-lg font-extrabold tracking-tight uppercase">
            <span className="text-[#1E1E1E]">NEXUS </span>
            <span className="text-[#D04A33]">NEWS</span>
          </span>
          <button
            onClick={toggleMenu}
            className="p-1.5 text-gray-600 hover:text-[#D04A33]"
            aria-label="Close Menu"
          >
            <CloseLineIcon size={22} />
          </button>
        </div>

        <div className="flex flex-col py-4 px-6 space-y-4">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={toggleMenu}
              className={({ isActive }) =>
                `text-base font-medium border-b border-gray-100 pb-2 ${
                  isActive ? 'text-[#D04A33]' : 'text-[#1E1E1E]'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
          {!isAdminPage && isAuthenticated && (
            <>
              <NavLink
                to={accountPath}
                onClick={toggleMenu}
                className="text-base font-medium border-b border-gray-100 pb-2 flex items-center gap-3 text-[#1E1E1E]"
              >
                <UserLineIcon size={20} />
                <span>Dashboard</span>
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  logout();
                  toggleMenu();
                }}
                className="text-left text-base font-medium border-b border-gray-100 pb-2 text-[#1E1E1E]"
              >
                Sign Out
              </button>
            </>
          )}
          {!isAdminPage && !isAuthenticated && (
            <NavLink
              to="/login"
              onClick={toggleMenu}
              className="text-base font-medium border-b border-gray-100 pb-2 flex items-center gap-3 text-[#1E1E1E]"
            >
              <UserLineIcon size={20} />
              <span>Sign In</span>
            </NavLink>
          )}
        </div>
      </div>

      {/* Backdrop Overlay for Mobile Menu */}
      {mobileMenuOpen && (
        <div
          onClick={toggleMenu}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}
    </header>
  );
};

export default Navbar;