import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLineIcon from 'remixicon-react/DashboardLineIcon';
import FileTextLineIcon from 'remixicon-react/FileTextLineIcon';
import Message2LineIcon from 'remixicon-react/Message2LineIcon';
import MailCheckLineIcon from 'remixicon-react/MailCheckLineIcon';
import LogoutBoxRLineIcon from 'remixicon-react/LogoutBoxRLineIcon';
import SearchLineIcon from 'remixicon-react/SearchLineIcon';
import Notification3LineIcon from 'remixicon-react/Notification3LineIcon';
import EyeLineIcon from 'remixicon-react/EyeLineIcon';
import Chat3LineIcon from 'remixicon-react/Chat3LineIcon';
import Edit2LineIcon from 'remixicon-react/Edit2LineIcon';
import DeleteBin6LineIcon from 'remixicon-react/DeleteBin6LineIcon';
import { useAuth } from '../context/AuthContext';
import TiptapEditor from '../component/TiptapEditor';
import { uploadFileToImageKit } from '../utils/uploadToImageKit';

const CATEGORIES = [
  'Health',
  'Sports',
  'Politics',
  'Business',
  'Arts',
  'Science',
  'World',
];
const WEEK_DAYS = [
  { day: 'S', date: 8 },
  { day: 'M', date: 9 },
  { day: 'T', date: 10 },
  { day: 'W', date: 11 },
  { day: 'T', date: 12 },
  { day: 'F', date: 13 },
  { day: 'S', date: 14 },
];

const emptyForm = {
  title: '',
  category: 'Health',
  coverImage: '',
  coverImageFileId: '',
  excerpt: '',
  contentHtml: '<p style="outline:none;">Write your article story here...</p>',
  pullQuote: '',
  author: 'Nexus Admin',
  isFeatured: false,
};

const AdminDashboard = () => {
  const {
    apiUrl,
    token,
    user,
    adminNotifications,
    commentReadStates,
    clearNotifications,
    logout,
  } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'articles' | 'comments' | 'subscribers'
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState(11);

  const [blogs, setBlogs] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [comments, setComments] = useState([]);
  const [updatingComments, setUpdatingComments] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [coverUploadFeedback, setCoverUploadFeedback] = useState('');
  const [coverUploadFailed, setCoverUploadFailed] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [feedback, setFeedback] = useState('');

  const isCommentRead = comment => {
    const stateKey = `${comment.blogId}:${comment._id}`;
    return commentReadStates[stateKey] ?? comment.isRead ?? false;
  };
  const unreadComments = comments.filter(comment => !isCommentRead(comment)).length;

  const fetchAllAdminData = useCallback(async () => {
    if (!token) return;
    try {
      const [blogsRes, subsRes, cmtsRes] = await Promise.all([
        fetch(`${apiUrl}/api/blogs`),
        fetch(`${apiUrl}/api/subscribers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${apiUrl}/api/blogs/admin/comments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const blogsData = await blogsRes.json();
      if (blogsRes.ok) setBlogs(blogsData.blogs || []);

      if (subsRes.ok) {
        const subsData = await subsRes.json();
        setSubscribers(subsData.subscribers || []);
      }

      if (cmtsRes.ok) {
        const cmtsData = await cmtsRes.json();
        setComments(cmtsData.comments || []);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAllAdminData();
  }, [fetchAllAdminData]);

  // Refresh subscribers & comments automatically when real-time events arrive
  useEffect(() => {
    if (adminNotifications.length > 0 && token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchAllAdminData();
    }
  }, [adminNotifications.length, fetchAllAdminData, token]);

  const filteredBlogs = useMemo(() => {
    if (!searchQuery.trim()) return blogs;
    const q = searchQuery.toLowerCase();
    return blogs.filter(
      b =>
        b.title?.toLowerCase().includes(q) ||
        b.category?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q),
    );
  }, [blogs, searchQuery]);

  const openNewPostEditor = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFeedback('');
    setCoverUploadFeedback('');
    setCoverUploadFailed(false);
    setShowEditorModal(true);
  };

  const handleEditClick = post => {
    setEditingId(post._id);
    setForm({
      title: post.title || '',
      category: post.category || 'Health',
      coverImage: post.coverImage || '',
      coverImageFileId: post.coverImageFileId || '',
      excerpt: post.excerpt || '',
      contentHtml:
        post.contentHtml ||
        (post.paragraphs || []).map(p => `<p>${p}</p>`).join('') ||
        '<p></p>',
      pullQuote: post.pullQuote || '',
      author: post.author || 'Nexus Admin',
      isFeatured: Boolean(post.isFeatured),
    });
    setFeedback('');
    setCoverUploadFeedback('');
    setCoverUploadFailed(false);
    setShowEditorModal(true);
  };

  const handleCoverUpload = async e => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setFeedback('');
    setCoverUploadFeedback('Uploading cover image...');
    setCoverUploadFailed(false);
    try {
      const uploaded = await uploadFileToImageKit(file, token, apiUrl);
      if (typeof uploaded?.url !== 'string' || !uploaded.url) {
        throw new Error('ImageKit did not return a cover image URL.');
      }
      setForm(prev => ({
        ...prev,
        coverImage: uploaded.url,
        coverImageFileId: uploaded.fileId || '',
      }));
      setCoverUploadFeedback('Cover image uploaded. Its URL has been filled in.');
    } catch (err) {
      setCoverUploadFailed(true);
      setCoverUploadFeedback(err.message || 'Cover image upload failed.');
    } finally {
      setUploadingImage(false);
      input.value = '';
    }
  };

  const handleInlineImageInsert = async () => {
    return new Promise(resolve => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return resolve(null);
        setUploadingImage(true);
        try {
          const uploaded = await uploadFileToImageKit(file, token, apiUrl);
          resolve(uploaded.url);
        } catch {
          resolve(null);
        } finally {
          setUploadingImage(false);
        }
      };
      input.click();
    });
  };

  const handleSubmitPost = async e => {
    e.preventDefault();
    setSavingPost(true);
    setFeedback('');

    try {
      const endpoint = editingId
        ? `${apiUrl}/api/blogs/${editingId}`
        : `${apiUrl}/api/blogs`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setFeedback(
        editingId
          ? 'Article updated successfully!'
          : 'Article published & live notification broadcast to users!',
      );
      setForm(emptyForm);
      setEditingId(null);
      setShowEditorModal(false);
      await fetchAllAdminData();
    } catch (err) {
      setFeedback(err.message);
    } finally {
      setSavingPost(false);
    }
  };

  const handleDeletePost = async id => {
    if (!window.confirm('Delete this article permanently?')) return;
    const res = await fetch(`${apiUrl}/api/blogs/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setFeedback('Article deleted.');
      fetchAllAdminData();
    }
  };

  const handleDeleteComment = async (blogId, commentId) => {
    const res = await fetch(
      `${apiUrl}/api/blogs/${blogId}/comments/${commentId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (res.ok) {
      setComments(prev => prev.filter(c => c._id !== commentId));
    }
  };

  const handleToggleCommentRead = async comment => {
    const isRead = !isCommentRead(comment);
    setUpdatingComments(prev => ({ ...prev, [comment._id]: true }));
    setFeedback('');

    try {
      const res = await fetch(
        `${apiUrl}/api/blogs/${comment.blogId}/comments/${comment._id}/read`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isRead }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not update comment.');

      setComments(prev =>
        prev.map(item =>
          item._id === comment._id ? { ...item, isRead: data.comment.isRead } : item,
        ),
      );
    } catch (err) {
      setFeedback(err.message);
    } finally {
      setUpdatingComments(prev => ({ ...prev, [comment._id]: false }));
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardLineIcon },
    { id: 'articles', label: 'My Articles', icon: FileTextLineIcon },
    {
      id: 'comments',
      label: 'Inbox & Comments',
      icon: Message2LineIcon,
      badge: unreadComments,
    },
    {
      id: 'subscribers',
      label: 'Subscribers',
      icon: MailCheckLineIcon,
      badge: subscribers.length,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F6EE] p-2 sm:p-5 lg:p-7">
      <div className="max-w-[1440px] mx-auto bg-[#F8F9FC] rounded-3xl shadow-xl border border-slate-200/70 flex flex-col lg:flex-row min-h-[820px]">
        {/* LEFT DARK NAVY SIDEBAR */}
        <aside className="w-full lg:w-64 lg:sticky lg:top-7 lg:h-[calc(100vh-3.5rem)] lg:self-start bg-[#141937] text-white flex flex-col justify-between p-5 shrink-0 rounded-t-3xl lg:rounded-l-3xl lg:rounded-tr-none">
          <div>
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-3 px-2 py-2 mb-8">
              <div className="w-9 h-9 rounded-lg bg-[#F5C842] text-[#141937] font-black flex items-center justify-center text-base">
                NX
              </div>
              <div className="leading-tight">
                <div className="font-extrabold text-base tracking-tight">
                  NEXUS
                </div>
                <div className="text-[11px] text-slate-300 font-medium">
                  admin studio
                </div>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="space-y-1.5">
              {navItems.map(item => {
                const IconComp = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#F3C2C6] text-[#141937] font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <IconComp size={18} />
                      <span>{item.label}</span>
                    </span>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-[#141937] text-white'
                            : 'bg-[#D04A33] text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Version & Sign Out */}
          <div className="pt-8 mt-8 border-t border-white/10 px-2 space-y-3">
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center gap-2.5 text-xs font-medium text-slate-300 hover:text-[#F3C2C6] transition-colors cursor-pointer py-1.5"
            >
              <LogoutBoxRLineIcon size={16} />
              <span>Sign Out</span>
            </button>
            <p className="text-[11px] text-slate-400">
              Version 1.0.1 • JWT Verified
            </p>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden rounded-b-3xl lg:rounded-r-3xl lg:rounded-bl-none">
          {/* TOP BAR */}
          <header className="bg-white/80 backdrop-blur border-b border-slate-200/70 px-5 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="relative w-full sm:w-80">
              <SearchLineIcon
                size={17}
                className="text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search articles or categories..."
                className="w-full bg-[#ECEEF5] text-sm text-[#141937] placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-[#141937]/15"
              />
            </div>

            {/* Right Controls: Inbox Jump, Real-Time Notification Bell, Admin Profile */}
            <div className="flex items-center gap-3 ml-auto relative">
              <button
                type="button"
                onClick={() => setActiveTab('comments')}
                title="View Comments Inbox"
                className="w-10 h-10 rounded-xl bg-[#ECEEF5] hover:bg-slate-200 text-[#141937] flex items-center justify-center cursor-pointer relative"
              >
                <Message2LineIcon size={18} />
                {unreadComments > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[#D04A33] absolute top-2 right-2" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowNotifPopover(prev => !prev)}
                title="Real-Time Admin Notifications"
                className="w-10 h-10 rounded-xl bg-[#ECEEF5] hover:bg-slate-200 text-[#141937] flex items-center justify-center cursor-pointer relative"
              >
                <Notification3LineIcon size={18} />
                {adminNotifications.length > 0 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D04A33] absolute top-1.5 right-1.5 animate-pulse" />
                )}
              </button>

              <div className="flex items-center gap-2.5 pl-2">
                <span className="text-xs sm:text-sm font-semibold text-[#141937]">
                  {user?.name || 'Admin'}
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#F5C842] text-[#141937] font-bold flex items-center justify-center text-sm">
                  {(user?.name || 'A').charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Real-Time Notification Popover */}
              {showNotifPopover && (
                <div className="absolute right-0 top-14 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-30">
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#141937]">
                      Real-Time Alerts ({adminNotifications.length})
                    </span>
                    {adminNotifications.length > 0 && (
                      <button
                        type="button"
                        onClick={() => clearNotifications('admin')}
                        className="text-xs text-[#D04A33] hover:underline cursor-pointer"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  {adminNotifications.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">
                      No new live alerts yet. New comments and subscriptions
                      appear here instantly.
                    </p>
                  ) : (
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {adminNotifications.map(n => (
                        <div
                          key={n.id}
                          className="p-2.5 rounded-xl bg-[#F8F9FC] border border-slate-100 text-xs"
                        >
                          <p className="font-semibold text-[#141937]">
                            {n.title}
                          </p>
                          {n.subtitle && (
                            <p className="text-slate-600 mt-0.5 line-clamp-2">
                              {n.subtitle}
                            </p>
                          )}
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>

          {feedback && (
            <div className="mx-5 sm:mx-8 mt-4 px-4 py-2.5 rounded-xl bg-[#141937] text-white text-xs font-medium flex items-center justify-between">
              <span>{feedback}</span>
              <button
                type="button"
                onClick={() => setFeedback('')}
                className="text-slate-300 hover:text-white cursor-pointer ml-4"
              >
                ✕
              </button>
            </div>
          )}

          {/* TAB 1: OVERVIEW DASHBOARD (MATCHING REFERENCE COMPOSITION) */}
          {activeTab === 'dashboard' && (
            <div className="p-5 sm:p-8 grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Center Column (8 cols): Welcome Banner + Top Articles */}
              <div className="xl:col-span-8 space-y-6">
                {/* Yellow Welcome Banner */}
                <section className="bg-[#F5C842] rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden">
                  <div className="max-w-md z-10">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141937]">
                      Hello {user?.name?.split(' ')[0] || 'Admin'}!
                    </h1>
                    <p className="text-xs sm:text-sm text-[#141937]/80 mt-2 leading-relaxed">
                      Publish rich stories and monitor
                      subscribers, and moderate reader comments in real time.
                    </p>
                    <button
                      type="button"
                      onClick={openNewPostEditor}
                      className="mt-5 bg-[#141937] hover:bg-[#D04A33] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Write new post
                    </button>
                  </div>

                  <div className="hidden sm:flex items-center justify-center w-36 h-28 rounded-2xl bg-white/35 text-[#141937] font-extrabold text-xs tracking-wider uppercase shrink-0">
                    Nexus Studio
                  </div>
                </section>

                {/* Top Articles Leaderboard */}
                <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-2xs">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-[#141937]">
                      Top articles
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab('articles')}
                      className="text-xs font-semibold text-[#D04A33] hover:underline cursor-pointer"
                    >
                      Manage all ({filteredBlogs.length})
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {filteredBlogs.slice(0, 6).map((post, index) => (
                      <div
                        key={post._id}
                        className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className="text-xs font-semibold text-slate-400 w-5 shrink-0">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <Link
                              to={`/blog/${post.slug}`}
                              className="text-sm font-bold text-[#141937] hover:text-[#D04A33] truncate block"
                            >
                              {post.title}
                            </Link>
                            <span className="text-[11px] text-slate-400">
                              {post.category} •{' '}
                              {new Date(post.createdAt).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                },
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-600 shrink-0 pl-8 sm:pl-0">
                          <span className="flex items-center gap-1 font-semibold text-[#141937]">
                            <EyeLineIcon size={15} className="text-slate-400" />
                            {post.category}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-[#141937]">
                            <Chat3LineIcon
                              size={15}
                              className="text-slate-400"
                            />
                            {post.comments?.length || 0}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleEditClick(post)}
                            className="text-slate-500 hover:text-[#141937] cursor-pointer"
                            title="Edit post"
                          >
                            <Edit2LineIcon size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePost(post._id)}
                            className="text-slate-400 hover:text-red-600 cursor-pointer"
                            title="Delete post"
                          >
                            <DeleteBin6LineIcon size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Column (4 cols): Pastel Metric Cards + Weekly Activity Card */}
              <div className="xl:col-span-4 space-y-4">
                {/* Card 1: Mint / Subscribers */}
                <button
                  type="button"
                  onClick={() => setActiveTab('subscribers')}
                  className="w-full text-left bg-[#BEECE6] hover:brightness-98 transition rounded-2xl p-5 flex items-center gap-4 cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#141937] text-white flex items-center justify-center shrink-0">
                    <MailCheckLineIcon size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-[#141937]">
                      {subscribers.length}
                    </div>
                    <div className="text-xs font-medium text-[#141937]/75">
                      Total subscribers
                    </div>
                  </div>
                </button>

                {/* Card 2:  Comments */}
                <button
                  type="button"
                  onClick={() => setActiveTab('comments')}
                  className="w-full text-left bg-[#D7DCF2] hover:brightness-98 transition rounded-2xl p-5 flex items-center gap-4 cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#141937] text-white flex items-center justify-center shrink-0">
                    <Message2LineIcon size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-[#141937]">
                      {comments.length}
                    </div>
                    <div className="text-xs font-medium text-[#141937]/75">
                      Reader comments
                    </div>
                  </div>
                </button>

                {/* Card 3: Published Articles */}
                <button
                  type="button"
                  onClick={() => setActiveTab('articles')}
                  className="w-full text-left bg-[#F3C2C6] hover:brightness-98 transition rounded-2xl p-5 flex items-center gap-4 cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#141937] text-white flex items-center justify-center shrink-0">
                    <FileTextLineIcon size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-[#141937]">
                      {blogs.length}
                    </div>
                    <div className="text-xs font-medium text-[#141937]/75">
                      Published articles
                    </div>
                  </div>
                </button>

                {/* Card 4: Recent Activity */}
                <div className="bg-[#FFF5E4] rounded-2xl p-5 border border-amber-200/60">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-[#141937]">
                      Recent activity
                    </h3>
                    <span className="text-xs font-medium text-slate-600">
                      Live Feed
                    </span>
                  </div>

                  {/* Mini Week  */}
                  <div className="grid grid-cols-7 gap-1 text-center mb-4">
                    {WEEK_DAYS.map((d, idx) => {
                      const active = selectedDay === d.date;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedDay(d.date)}
                          className="flex flex-col items-center gap-1 cursor-pointer"
                        >
                          <span className="text-[10px] font-semibold text-slate-400">
                            {d.day}
                          </span>
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                              active
                                ? 'bg-[#141937] text-white'
                                : 'text-[#141937] hover:bg-amber-200/60'
                            }`}
                          >
                            {d.date}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Latest Comments & Subscribers Preview */}
                  <div className="space-y-3 divide-y divide-amber-200/70">
                    {comments.slice(0, 3).map(cmt => (
                      <div
                        key={cmt._id}
                        className={`pt-2.5 first:pt-0 text-xs ${
                          isCommentRead(cmt) ? '' : 'border-l-2 border-[#D04A33] pl-2'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-slate-400 font-semibold shrink-0">
                            {new Date(cmt.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-[#141937] truncate">
                              {!isCommentRead(cmt) && (
                                <span className="text-[#D04A33] mr-1">New</span>
                              )}
                              {cmt.content}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              By {cmt.name} on {cmt.blogTitle}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {comments.length === 0 && (
                      <p className="text-xs text-slate-500">
                        New reader comments will appear right here.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY ARTICLES (CREATE / EDIT / UPDATE / DELETE) */}
          {activeTab === 'articles' && (
            <div className="p-5 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-[#141937]">
                    My Articles
                  </h1>
                  <p className="text-xs text-slate-500">
                    Create, edit, update, or delete posts and publish online
                    
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewPostEditor}
                  className="bg-[#141937] hover:bg-[#D04A33] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  + Write new post
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] uppercase text-slate-400">
                      <th className="py-3.5 px-5">Article</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Comments</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBlogs.map(post => (
                      <tr key={post._id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-5 font-bold text-[#141937]">
                          <div className="flex items-center gap-3">
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="w-11 h-11 rounded-lg object-cover shrink-0"
                            />
                            <span>{post.title}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-bold text-[#D04A33]">
                          {post.category}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {post.comments?.length || 0}
                        </td>
                        <td className="py-3.5 px-5 text-right space-x-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleEditClick(post)}
                            className="text-xs font-semibold text-[#141937] hover:text-[#D04A33] cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePost(post._id)}
                            className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: INBOX & COMMENTS */}
          {activeTab === 'comments' && (
            <div className="p-5 sm:p-8 space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-[#141937]">
                  Inbox &amp; Reader Comments ({comments.length})
                </h1>
                <p className="text-xs text-slate-500">
                  {unreadComments} unread · comments sync live across admin sessions.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                {comments.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No reader comments yet.
                  </p>
                ) : (
                  comments.map(cmt => (
                    <div
                      key={cmt._id}
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isCommentRead(cmt)
                          ? 'bg-[#F8F9FC] border-slate-100'
                          : 'bg-rose-50 border-rose-200'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-[#141937]">
                          {cmt.name}{' '}
                          <span className="font-normal text-slate-500">
                            ({cmt.email})
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-[#D04A33] mt-0.5">
                          Article: {cmt.blogTitle}
                        </div>
                        <p className="text-sm text-slate-700 mt-2">
                          {cmt.content}
                        </p>
                        {!isCommentRead(cmt) && (
                          <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wide text-[#D04A33]">
                            Unread
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <button
                          type="button"
                          disabled={Boolean(updatingComments[cmt._id])}
                          onClick={() => handleToggleCommentRead(cmt)}
                          className="text-xs font-semibold text-[#141937] hover:text-[#D04A33] disabled:opacity-50 cursor-pointer"
                        >
                          {updatingComments[cmt._id]
                            ? 'Saving...'
                            : isCommentRead(cmt)
                              ? 'Mark unread'
                              : 'Mark read'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(cmt.blogId, cmt._id)}
                          className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SUBSCRIBERS */}
          {activeTab === 'subscribers' && (
            <div className="p-5 sm:p-8 space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-[#141937]">
                  Newsletter Subscribers ({subscribers.length})
                </h1>
                <p className="text-xs text-slate-500">
                  Emails collected from the footer, homepage card, or user
                  dashboard appear here in real time.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] uppercase text-slate-400">
                      <th className="py-3.5 px-6">Subscriber Email</th>
                      <th className="py-3.5 px-6 text-right">
                        Subscribed Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subscribers.map(sub => (
                      <tr key={sub._id}>
                        <td className="py-3.5 px-6 font-medium text-[#141937]">
                          {sub.email}
                        </td>
                        <td className="py-3.5 px-6 text-right text-xs text-slate-500">
                          {new Date(sub.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {subscribers.length === 0 && (
                      <tr>
                        <td
                          colSpan="2"
                          className="py-8 text-center text-slate-500"
                        >
                          No subscribers yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT POST */}
      {showEditorModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <h2 className="text-xl font-extrabold text-[#141937]">
                {editingId ? 'Edit & Update Article' : 'Create New Article'}
              </h2>
              <button
                type="button"
                onClick={() => setShowEditorModal(false)}
                className="text-slate-500 hover:text-[#141937] font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitPost} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Article Title"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="sm:col-span-2 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#141937]"
                />
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none bg-white"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center ">
                <div>
                  <label className="block text-base font-bold text-[#141937] ">
                    Upload cover image 
                    {/* UPLOADING IMAGE TO IMGEKIT */}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    disabled={uploadingImage}
                    className="text-xs text-slate-600"
                  />
                  {coverUploadFeedback && (
                    <p
                      role={coverUploadFailed ? 'alert' : 'status'}
                      className={`mt-1 text-xs ${
                        coverUploadFailed
                          ? 'text-red-600'
                          : 'text-emerald-700'
                      }`}
                    >
                      {coverUploadFeedback}
                    </p>
                  )}
                </div>
                <input
                  type="url"
                  required
                  aria-label="Cover image URL"
                  placeholder="Auto-filled after upload, or paste an image URL"
                  value={form.coverImage}
                  onChange={e => {
                    setForm({ ...form, coverImage: e.target.value })
                    setCoverUploadFeedback('');
                    setCoverUploadFailed(false);
                  }}
                  className="border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none"
                />
              </div>

              <input
                type="text"
                required
                placeholder="Short excerpt for blogs"
                value={form.excerpt}
                onChange={e => setForm({ ...form, excerpt: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none"
              />

              <div>
                <label className="block text-base font-bold text-[#141937] mb-1.5">
                  Descriptions 
                </label>
                
                <TiptapEditor
                  key={editingId || 'modal-editor'}
                  value={form.contentHtml}
                  onChange={html => setForm({ ...form, contentHtml: html })}
                  onRequestImageInsert={handleInlineImageInsert}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-[#141937] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={e =>
                      setForm({ ...form, isFeatured: e.target.checked })
                    }
                    className="accent-[#D04A33]"
                  />
                  <span>Feature on Homepage Hero</span>
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditorModal(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-[#141937] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingPost || uploadingImage}
                    className="bg-[#141937] hover:bg-[#D04A33] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    {savingPost
                      ? 'Saving...'
                      : editingId
                        ? 'Update Article'
                        : 'Publish Article'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;