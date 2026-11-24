import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import BlogCard from '../component/BlogCard';
import { useAuth } from '../context/AuthContext';

const ALL_CATEGORIES = [
  'Arts',
  'Business',
  'Health',
  'Politics',
  'Science',
  'Sports',
  'World',
];

const CategoryArchive = () => {
  const { apiUrl } = useAuth();
  const { categoryName } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [allBlogs, setAllBlogs] = useState([]);
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(true);

  const activeSearch = searchParams.get('q') || '';

  useEffect(() => {
    const fetchAllBlogs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/blogs`);
        const data = await res.json();
        if (res.ok) {
          setAllBlogs(data.blogs || data);
        }
      } catch (err) {
        console.error('Error fetching archive blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllBlogs();
  }, [categoryName, apiUrl]);

  const handleSearchSubmit = e => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    } else {
      setSearchParams({});
    }
  };

  // Filter posts by active category and optional search term
  const filteredBlogs = allBlogs.filter(blog => {
    const matchesCategory = categoryName
      ? blog.category?.toLowerCase() === categoryName.toLowerCase()
      : true;

    const matchesSearch = activeSearch
      ? blog.title?.toLowerCase().includes(activeSearch.toLowerCase()) ||
        blog.excerpt?.toLowerCase().includes(activeSearch.toLowerCase())
      : true;

    return matchesCategory && matchesSearch;
  });

  // Recent 5 posts for Sidebar
  const recentPosts = [...allBlogs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Compute dynamic post counts per category
  const getCategoryCount = cat =>
    allBlogs.filter(b => b.category?.toLowerCase() === cat.toLowerCase())
      .length;

  const formattedHeading = categoryName
    ? categoryName.charAt(0).toUpperCase() + categoryName.slice(1)
    : 'All Articles';

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LEFT COLUMN: Category Title & 3-Column Post Grid */}
        <div className="lg:col-span-8 lg:pr-8 lg:border-r lg:border-gray-200">
          <div className="border-b border-gray-200 pb-4 mb-8 flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1E1E1E]">
              {activeSearch
                ? `Search results for "${activeSearch}" in ${formattedHeading}`
                : formattedHeading}
            </h1>
            {activeSearch && (
              <button
                onClick={() => setSearchParams({})}
                className="text-xs text-[#D04A33] hover:underline cursor-pointer"
              >
                Clear search
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-8 h-8 border-4 border-[#D04A33] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
              {filteredBlogs.map(blog => (
                <BlogCard
                  key={blog._id}
                  blog={blog}
                  variant="standard"
                  showExcerpt={true}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-gray-50 px-4">
              <p className="text-base font-medium text-[#1E1E1E]">
                No articles found in {formattedHeading}.
              </p>
              <Link
                to="/"
                className="inline-block mt-3 text-xs font-semibold text-[#D04A33] hover:underline"
              >
                ← Back to Home
              </Link>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR: Search, Recent Posts, Categories */}
        <aside className="lg:col-span-4 space-y-10">
          {/* 1. Search Widget */}
          <div>
            <label
              htmlFor="archive-search"
              className="block text-xs font-medium text-[#1E1E1E] mb-2"
            >
              Search
            </label>
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                id="archive-search"
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="w-full border border-gray-300 focus:border-[#D04A33] px-3 py-2 text-sm text-[#1E1E1E] outline-none transition-colors"
              />
              <button
                type="submit"
                className="bg-[#1E1E1E] hover:bg-[#D04A33] text-white text-xs sm:text-sm font-medium px-5 py-2 transition-colors cursor-pointer shrink-0"
              >
                Search
              </button>
            </form>
          </div>

          {/* 2. Recent Posts Widget */}
          <div>
            <h3 className="text-xl font-bold text-[#1E1E1E] mb-4">
              Recent Posts
            </h3>
            <ul className="space-y-3.5">
              {recentPosts.map(post => (
                <li key={post._id}>
                  <Link
                    to={`/blog/${post.slug || post._id}`}
                    className="text-sm text-[#D04A33] hover:underline leading-snug block"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Categories Widget */}
          <div>
            <h3 className="text-xl font-bold text-[#1E1E1E] mb-4">
              Categories
            </h3>
            <ul className="space-y-2.5 text-sm">
              {ALL_CATEGORIES.map(cat => {
                const isCurrent =
                  categoryName?.toLowerCase() === cat.toLowerCase();
                return (
                  <li key={cat} className="flex items-center gap-1.5">
                    <Link
                      to={`/category/${cat.toLowerCase()}`}
                      className={`text-[#D04A33] hover:underline ${
                        isCurrent ? 'font-bold' : ''
                      }`}
                    >
                      {cat}
                    </Link>
                    <span className="text-gray-500 text-xs">
                      ({getCategoryCount(cat)})
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default CategoryArchive;
