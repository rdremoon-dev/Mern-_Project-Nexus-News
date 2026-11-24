import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './component/Navbar';
import Footer from './component/Footer';
import { ProtectedRoute } from './component/ProtectedRoute';
import Home from './pages/Home';
import CategoryArchive from './pages/CategoryArchive';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import VerifyEmailPage from './pages/VerifyEmailPage';
import BlogCardDetails from './component/BlogCardDetails.jsx';
import { AuthProvider } from './context/AuthContext';
import About from './pages/About';
import Contact from './pages/Contact';
import ScrollToTop from './component/ScrollToTop';
import API_URL from './utils/api.js';

function App() {
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-white text-[#1E1E1E]">
          <Navbar onOpenSubscribe={() => setSubscribeModalOpen(true)} />

          <div className="flex-grow">
            <Routes>
              <Route
                path="/"
                element={
                  <Home onOpenSubscribe={() => setSubscribeModalOpen(true)} />
                }
              />
              <Route
                path="/category/:categoryName"
                element={<CategoryArchive />}
              />
              <Route path="/blog/:slug" element={<BlogCardDetails />} />
              <Route path="/login" element={<LoginPage portalRole="user" />} />
              <Route
                path="/admin/login"
                element={<LoginPage portalRole="admin" />}
              />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route
                path="/user/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </div>

          <Footer />
          <ScrollToTop />

          {/* Optional Subscribe Modal triggered by Header/Home CTA */}
          {subscribeModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white max-w-md w-full p-8 relative shadow-xl">
                <button
                  onClick={() => setSubscribeModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-[#1E1E1E] text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#D04A33]">
                  NEXUS NEWS DAILY
                </span>
                <h3 className="text-2xl font-bold text-[#1E1E1E] mt-1 mb-2">
                  Subscribe to our newsletter
                </h3>
                <p className="text-sm text-gray-600 mb-5">
                  Get breaking headlines and deep-dive stories delivered to your
                  inbox.
                </p>
                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    const email = e.target.email.value;
                    await fetch(`${API_URL}/api/subscribers`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email }),
                    });
                    setSubscribeModalOpen(false);
                  }}
                  className="space-y-3"
                >
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Enter your email *"
                    className="w-full border border-gray-300 focus:border-[#D04A33] px-4 py-2.5 text-sm outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full bg-[#D04A33] hover:bg-[#b83d28] text-white text-sm font-medium py-2.5 transition-colors cursor-pointer"
                  >
                    Subscribe Now
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;