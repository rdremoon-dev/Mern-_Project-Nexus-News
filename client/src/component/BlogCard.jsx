import { Link } from 'react-router-dom';
import SaveArticleButton from './SaveArticleButton';

const BlogCard = ({ blog, variant = 'standard', showExcerpt = false }) => {
  if (!blog) return null;

  const { _id, slug, title, category, coverImage, excerpt, createdAt } = blog;

  const articleUrl = `/blog/${slug || _id}`;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  // 1. OVERLAY VARIANT (Hero Feature, Top Stories, Business Section)
  if (variant === 'overlay') {
    return (
      <article className="group relative w-full h-full max-h-107.25  overflow-hidden bg-neutral-900">
        <Link to={articleUrl} className="block w-full h-full">
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-85"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex flex-col items-start">
            <span className="bg-[#D04A33] text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 mb-3">
              {category}
            </span>
            <h3 className="text-white text-xl sm:text-2xl font-bold leading-snug group-hover:text-gray-200 transition-colors">
              {title}
            </h3>
            <time className="text-gray-300 text-xs mt-2">{formattedDate}</time>
          </div>
        </Link>
        <SaveArticleButton
          blogId={_id}
          className="absolute top-4 right-4 z-10"
        />
      </article>
    );
  }

  // 2. HORIZONTAL VARIANT (Hero Right Side Stack)
  if (variant === 'horizontal') {
    return (
      <article className="group relative flex flex-col sm:flex-row gap-5 items-start">
        <Link
          to={articleUrl}
          className="w-full sm:w-73.75 h-50.5 shrink-0 overflow-hidden bg-gray-100 block relative"
        >
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        <SaveArticleButton
          blogId={_id}
          className="absolute top-2 left-2 z-10"
        />

        <div className="flex flex-col items-start pt-1">
          <span className="bg-[#D04A33] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 mb-2.5">
            {category}
          </span>
          <Link to={articleUrl}>
            <h3 className="text-[#1E1E1E] text-lg font-bold leading-snug group-hover:text-[#D04A33] transition-colors">
              {title}
            </h3>
          </Link>
          <time className="text-[#666666] text-xs mt-2">{formattedDate}</time>
        </div>
      </article>
    );
  }

  // 3. STANDARD EDITORIAL VARIANT (Category Grids, Archives, Science/Politics/Arts)
  return (
    <article className="group flex flex-col">
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100 mb-4">
        <Link to={articleUrl} className="block h-full">
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        <SaveArticleButton
          blogId={_id}
          className="absolute top-2 right-2 z-10"
        />
      </div>

      <Link
        to={`/category/${category?.toLowerCase()}`}
        className="text-[#D04A33] text-[11px] font-bold uppercase tracking-wider mb-1.5 hover:underline"
      >
        {category}
      </Link>

      <Link to={articleUrl}>
        <h3 className="text-[#1E1E1E] text-lg font-bold leading-snug group-hover:text-[#D04A33] transition-colors">
          {title}
        </h3>
      </Link>

      <time className="text-[#666666] text-xs mt-2">{formattedDate}</time>

      {showExcerpt && excerpt && (
        <p className="text-[#4A4A4A] text-sm leading-relaxed mt-3 line-clamp-4">
          {excerpt}
        </p>
      )}
    </article>
  );
};

export default BlogCard;