import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ArrowRightLineIcon from 'remixicon-react/ArrowRightLineIcon';
import BlogCard from '../component/BlogCard';
import { useAuth } from '../context/AuthContext';

// Reusable Section Header with Left Coral Accent Bar & "View All ->" Link
const SectionHeader = ({ title, categorySlug }) => (
  <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-6">
    <div className="flex items-center gap-2.5">
      <span className="w-0.5 h-4 bg-[#D04A33] inline-block" />
      <h2 className="text-base sm:text-lg font-bold text-[#1E1E1E]">{title}</h2>
    </div>
    {categorySlug && (
      <Link
        to={`/category/${categorySlug}`}
        className="flex items-center gap-1 text-xs font-semibold text-[#D04A33] hover:underline"
      >
        <span>View All</span>
        <ArrowRightLineIcon size={14} />
      </Link>
    )}
  </div>
);

const Home = ({ onOpenSubscribe }) => {
  const { apiUrl } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/blogs`);
        const data = await res.json();
        if (res.ok) {
          setBlogs(data.blogs || data);
        }
      } catch (err) {
        console.error('Failed to fetch blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [apiUrl]);

  // Helper to filter blogs by category
  const getByCategory = (cat, limit) => {
    const filtered = blogs.filter(
      b => b.category?.toLowerCase() === cat.toLowerCase(),
    );
    return limit ? filtered.slice(0, limit) : filtered;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-9 h-9 border-4 border-[#D04A33] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Hero Posts (1 main featured + 2 side posts)
  const featuredHero = blogs.find(b => b.isFeatured) || blogs[0];
  const sideHeroPosts = blogs
    .filter(b => b._id !== featuredHero?._id)
    .slice(0, 2);

  // Category Slices
  const healthPosts = getByCategory('Health', 4);
  const topStoryMain = getByCategory('Science', 1)[0] || blogs[3];
  const topStorySub = [
    getByCategory('World', 1)[0],
    getByCategory('Arts', 1)[0],
  ].filter(Boolean);
  const businessPosts = getByCategory('Business', 2);
  const worldPosts = getByCategory('World', 3);
  const scienceFeatured =
    getByCategory('Science', 2)[1] || getByCategory('Science', 1)[0];
  const politicsFeatured =
    getByCategory('Politics', 2)[1] || getByCategory('Politics', 1)[0];
  const artsPosts = getByCategory('Arts', 3);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* 1. HERO SECTION */}
      {featuredHero && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-6 min-h-100 lg:min-h-110">
            <BlogCard blog={featuredHero} variant="overlay" />
          </div>

          <div className="lg:col-span-6 flex flex-col justify-start gap-6">
            {sideHeroPosts.map(post => (
              <BlogCard key={post._id} blog={post} variant="horizontal" />
            ))}
          </div>
        </section>
      )}

      {/* 2. HEALTH SECTION */}
      {healthPosts.length > 0 && (
        <section>
          <SectionHeader title="Health" categorySlug="health" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {healthPosts.map(post => (
              <BlogCard key={post._id} blog={post} variant="standard" />
            ))}
          </div>
        </section>
      )}

      {/* 3. TOP STORIES + NEWSLETTER CALLOUT */}
      <section>
        <SectionHeader title="Top Stories" />

        {/* Top Row: 8-col Overlay Story + 4-col Coral Newsletter Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          <div className="lg:col-span-8 min-h-107.25">
            {topStoryMain && <BlogCard blog={topStoryMain} variant="overlay" />}
          </div>

          <div
            onClick={onOpenSubscribe}
            className="lg:col-span-4 bg-[#D04A33] text-white p-8 sm:p-10 flex flex-col justify-center cursor-pointer hover:bg-[#bf412b] transition-colors"
          >
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/90 mb-3">
              NEVER MISS A HEADLINE!
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold leading-tight mb-4">
              Subscribe to our newsletter for daily updates.
            </h3>
            <p className="text-sm text-white/90 leading-relaxed">
              Get the latest stories delivered straight to your inbox.
            </p>
          </div>
        </div>

        {/* Bottom Row: 2 Standard Cards */}
        {topStorySub.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {topStorySub.map(post => (
              <BlogCard key={post._id} blog={post} variant="standard" />
            ))}
          </div>
        )}
      </section>

      {/* 4. BUSINESS SECTION */}
      {businessPosts.length > 0 && (
        <section>
          <SectionHeader title="Business" categorySlug="business" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5 bg-white">
            {businessPosts.map(post => (
              <div key={post._id} className="min-h-85">
                <BlogCard blog={post} variant="overlay" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. WORLD SECTION */}
      {worldPosts.length > 0 && (
        <section>
          <SectionHeader title="World" categorySlug="world" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {worldPosts.map(post => (
              <BlogCard key={post._id} blog={post} variant="standard" />
            ))}
          </div>
        </section>
      )}

      {/* 6. JOIN OUR COMMUNITY OF INNOVATORS BANNER */}
      <section className="relative py-6">
        <div className="relative flex flex-col lg:flex-row items-center">
          {/* Left Overlapping Image */}
          <div className="w-full lg:w-5/12 z-10 lg:-mr-16 shadow-md">
            <img
              src="https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=80"
              alt="Writer taking notes"
              className="w-full h-72 sm:h-80 object-cover"
            />
          </div>

          {/* Right Terracotta Content Box */}
          <div className="w-full lg:w-9/12 bg-[#D04A33] text-white py-12 px-8 sm:px-14 lg:pl-28 lg:pr-16">
            <div className="max-w-md">
              <h2 className="text-2xl sm:text-3xl font-bold leading-snug mb-3">
                Join Our Community of Innovators
              </h2>
              <p className="text-sm text-white/90 leading-relaxed mb-6">
                Share your insights and expertise on various topics with our
                global audience.
              </p>
              <Link
                to="/contact"
                className="inline-block bg-white text-[#1E1E1E] hover:bg-gray-100 text-xs sm:text-sm font-semibold px-6 py-3 transition-colors"
              >
                Contribute Your Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SPLIT SCIENCE & POLITICS SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {scienceFeatured && (
          <div>
            <SectionHeader title="Science" categorySlug="science" />
            <BlogCard
              blog={scienceFeatured}
              variant="standard"
              showExcerpt={true}
            />
          </div>
        )}

        {politicsFeatured && (
          <div>
            <SectionHeader title="Politics" categorySlug="politics" />
            <BlogCard
              blog={politicsFeatured}
              variant="standard"
              showExcerpt={true}
            />
          </div>
        )}
      </section>

      {/* 8. ARTS SECTION */}
      {artsPosts.length > 0 && (
        <section>
          <SectionHeader title="Arts" categorySlug="arts" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {artsPosts.map(post => (
              <BlogCard key={post._id} blog={post} variant="standard" />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default Home;