import ArticleCardSkeleton from "./ArticleCardSkeleton";

const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen py-4 sm:py-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto">
      {/* Header skeleton */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
      </div>

      {/* Article skeletons */}
      <div className="space-y-4">
        <ArticleCardSkeleton />
        <ArticleCardSkeleton />
        <ArticleCardSkeleton />
      </div>
    </div>
  );
};

export default LoadingSkeleton;
