import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SaveArticleButton from './SaveArticleButton';

const BlogCardDetails = () => {
  const { slug } = useParams();
  const { apiUrl } = useAuth();

  const [blog, setBlog] = useState(null);
  const [adjacent, setAdjacent] = useState({ prev: null, next: null });
  const [mustRead, setMustRead] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Comment Form State
  const [commentForm, setCommentForm] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_commenter');
      const parsed = saved ? JSON.parse(saved) : null;
      return {
        content: '',
        name: parsed?.name || '',
        email: parsed?.email || '',
        website: parsed?.website || '',
      };
    } catch {
      return { content: '', name: '', email: '', website: '' };
    }
  });
  const [saveInfo, setSaveInfo] = useState(() => {
    try {
      return Boolean(localStorage.getItem('nexus_commenter'));
    } catch {
      return false;
    }
  });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentFeedback, setCommentFeedback] = useState('');

  // Fetch article details, previous/next articles, Must Read, and comments
  useEffect(() => {
    const fetchArticleData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/blogs/${slug}`);
        const data = await res.json();

        if (res.ok) {
          setBlog(data.blog);
          setAdjacent({ prev: data.prevBlog || null, next: data.nextBlog || null });
          setMustRead(data.mustRead || []);
          setComments(data.blog.comments || []);
        }
      } catch (error) {
        console.error('Error loading article:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticleData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug, apiUrl]);

  const handleCommentChange = (e) => {
    const { name, value } = e.target;
    setCommentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentForm.content.trim() || !commentForm.name.trim() || !commentForm.email.trim()) {
      return;
    }

    setSubmittingComment(true);
    setCommentFeedback('');

    if (saveInfo) {
      localStorage.setItem(
        'nexus_commenter',
        JSON.stringify({
          name: commentForm.name,
          email: commentForm.email,
          website: commentForm.website,
        })
      );
    } else {
      localStorage.removeItem('nexus_commenter');
    }

    try {
      const res = await fetch(`${apiUrl}/api/blogs/${blog._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not post comment');

      setComments((prev) => [data.comment, ...prev]);
      setCommentForm((prev) => ({ ...prev, content: '' }));
      setCommentFeedback('Your comment has been posted.');
    } catch (err) {
      setCommentFeedback(err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F6F6F6]">
        <div className="w-8 h-8 border-4 border-[#D04A33] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#F6F6F6] px-4">
        <h2 className="text-2xl font-bold text-[#1E1E1E]">Article not found</h2>
        <Link to="/" className="mt-4 text-sm text-[#D04A33] hover:underline">
          ← Return to Home
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <main className="bg-[#F6F6F6] py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* 1. MAIN ARTICLE CONTAINER */}
        <article className="bg-white p-6 sm:p-12 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-medium text-[#1E1E1E] leading-10">
              {blog.title}
            </h1>
            <SaveArticleButton blogId={blog._id} className="shrink-0 mt-1" />
          </div>

          {/* Author & Date Metadata */}
          <div className="text-xs text-[#D04A33] font-medium mt-3 mb-7">
            <span>By {blog.author || 'kalpeshb'}</span>
            <span className="mx-1.5 text-gray-400">/</span>
            <time className="text-[#D04A33]">{formattedDate}</time>
          </div>

          {/* Featured Image */}
          {blog.coverImage && (
            <div className="w-full overflow-hidden mb-8">
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full max-h-[460px] object-cover"
              />
            </div>
          )}

          {/* Article Body Paragraphs & Pull Quote */}
          <div className="space-y-6 text-[#333333] text-[15px] leading-[1.8]">
            {blog.contentHtml ? (
              <div
                className="[&_p]:mb-5 [&_p:last-child]:mb-0"
                dangerouslySetInnerHTML={{ __html: blog.contentHtml }}
              />
            ) : Array.isArray(blog.paragraphs) ? (
              blog.paragraphs.map((para, idx) => <p key={idx}>{para}</p>)
            ) : (
              <p>{blog.content}</p>
            )}

            {blog.pullQuote && (
              <blockquote className="my-8 px-6 py-2 italic text-[#4A4A4A] text-base leading-relaxed">
                {blog.pullQuote}
              </blockquote>
            )}
          </div>
        </article>

        {/* 2. PREVIOUS / NEXT POST NAVIGATION */}
        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 text-xs">
          <div>
            {adjacent.prev && (
              <Link
                to={`/blog/${adjacent.prev.slug || adjacent.prev._id}`}
                className="group block"
              >
                <span className="font-bold uppercase tracking-wider text-[#1E1E1E] group-hover:text-[#D04A33] transition-colors">
                  ← PREVIOUS
                </span>
                <p className="text-gray-600 mt-1 truncate">{adjacent.prev.title}</p>
              </Link>
            )}
          </div>

          <div className="sm:text-right">
            {adjacent.next && (
              <Link
                to={`/blog/${adjacent.next.slug || adjacent.next._id}`}
                className="group block"
              >
                <span className="font-bold uppercase tracking-wider text-[#1E1E1E] group-hover:text-[#D04A33] transition-colors">
                  NEXT →
                </span>
                <p className="text-gray-600 mt-1 truncate">{adjacent.next.title}</p>
              </Link>
            )}
          </div>
        </nav>

        {/* 3. MUST READ SECTION */}
        {mustRead.length > 0 && (
          <section className="bg-white p-6 sm:p-10 shadow-xs">
            <h2 className="text-xl font-bold text-[#1E1E1E] mb-6">Must Read</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {mustRead.map((item) => (
                <div key={item._id} className="group">
                  <Link
                    to={`/blog/${item.slug || item._id}`}
                    className="block overflow-hidden mb-3 aspect-[16/10] bg-gray-100"
                  >
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <Link to={`/blog/${item.slug || item._id}`}>
                    <h3 className="text-base font-bold text-[#1E1E1E] group-hover:text-[#D04A33] transition-colors leading-snug">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-[11px] text-[#D04A33] font-medium mt-1.5">
                    {item.category} |{' '}
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. EXISTING COMMENTS LIST (If any) */}
        {comments.length > 0 && (
          <section className="bg-white p-6 sm:p-10 shadow-xs space-y-6">
            <h3 className="text-lg font-bold text-[#1E1E1E]">
              {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
            </h3>
            <div className="divide-y divide-gray-100">
              {comments.map((c, idx) => (
                <div key={c._id || idx} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-[#1E1E1E]">{c.name}</span>
                    <span className="text-xs text-gray-400">
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleDateString()
                        : ''}
                    </span>
                  </div>
                  <p className="text-sm text-[#4A4A4A] mt-2 leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. LEAVE A COMMENT FORM */}
        <section className="bg-white p-6 sm:p-10 shadow-xs">
          <h2 className="text-xl font-bold text-[#1E1E1E]">Leave a Comment</h2>
          <p className="text-xs text-gray-500 mt-1.5 mb-6">
            Your email address will not be published. Required fields are marked *
          </p>

          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <div>
              <textarea
                name="content"
                rows="6"
                required
                value={commentForm.content}
                onChange={handleCommentChange}
                placeholder="Type here.."
                className="w-full border border-gray-200 focus:border-[#D04A33] p-3.5 text-sm text-[#1E1E1E] placeholder-gray-400 outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                name="name"
                required
                value={commentForm.name}
                onChange={handleCommentChange}
                placeholder="Name*"
                className="w-full border border-gray-200 focus:border-[#D04A33] px-3.5 py-2.5 text-sm text-[#1E1E1E] placeholder-gray-400 outline-none transition-colors"
              />
              <input
                type="email"
                name="email"
                required
                value={commentForm.email}
                onChange={handleCommentChange}
                placeholder="Email*"
                className="w-full border border-gray-200 focus:border-[#D04A33] px-3.5 py-2.5 text-sm text-[#1E1E1E] placeholder-gray-400 outline-none transition-colors"
              />
              <input
                type="url"
                name="website"
                value={commentForm.website}
                onChange={handleCommentChange}
                placeholder="Website"
                className="w-full border border-gray-200 focus:border-[#D04A33] px-3.5 py-2.5 text-sm text-[#1E1E1E] placeholder-gray-400 outline-none transition-colors"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={saveInfo}
                onChange={(e) => setSaveInfo(e.target.checked)}
                className="accent-[#D04A33]"
              />
              <span>
                Save my name, email, and website in this browser for the next time I comment.
              </span>
            </label>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submittingComment}
                className="bg-[#D04A33] hover:bg-[#b83d28] text-white text-xs sm:text-sm font-medium px-6 py-3 transition-colors cursor-pointer disabled:opacity-60"
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </div>

            {commentFeedback && (
              <p className="text-xs text-[#D04A33] font-medium pt-1">{commentFeedback}</p>
            )}
          </form>
        </section>
      </div>
    </main>
  );
};

export default BlogCardDetails;