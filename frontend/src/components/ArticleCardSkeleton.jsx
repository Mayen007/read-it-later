const ArticleCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail skeleton */}
        <div className="w-full sm:w-48 h-40 sm:h-48 bg-gray-200"></div>

        {/* Content skeleton */}
        <div className="flex-1 p-4 sm:p-6">
          {/* Title skeleton */}
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>

          {/* Excerpt skeleton */}
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>

          {/* Metadata row skeleton */}
          <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>

          {/* Categories skeleton */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            <div className="h-6 bg-gray-200 rounded-full w-24"></div>
          </div>

          {/* Action buttons skeleton */}
          <div className="flex gap-2">
            <div className="h-9 bg-gray-200 rounded w-24"></div>
            <div className="h-9 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCardSkeleton;
