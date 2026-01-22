import { useState, useMemo, useRef, useEffect } from "react";
import ArticleCard from "./ArticleCard";
import ArticleFilters from "./ArticleFilters";
import { BookOpen } from "lucide-react";

const ArticlesList = ({
  articles,
  onToggleRead,
  onDeleteArticle,
  isLoading,
  categories = [],
  onUpdateArticle,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const articleRefs = useRef({});

  const filteredArticles = useMemo(() => {
    let filtered = articles;

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((article) =>
        article.categories?.some((cat) => cat._id === selectedCategory),
      );
    }

    // Apply read/unread filter
    if (filter === "read") {
      filtered = filtered.filter((article) => article.is_read);
    } else if (filter === "unread") {
      filtered = filtered.filter((article) => !article.is_read);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (article) =>
          article.title?.toLowerCase().includes(term) ||
          article.excerpt?.toLowerCase().includes(term) ||
          article.author?.toLowerCase().includes(term) ||
          article.url?.toLowerCase().includes(term),
      );
    }

    // Sort by saved date (newest first)
    return filtered.sort(
      (a, b) => new Date(b.saved_date) - new Date(a.saved_date),
    );
  }, [articles, searchTerm, filter, selectedCategory]);

  // Scroll to first match when searchTerm changes
  useEffect(() => {
    if (searchTerm.trim() && filteredArticles.length > 0) {
      const firstId = filteredArticles[0]._id;
      const ref = articleRefs.current[firstId];
      if (ref && ref.scrollIntoView) {
        ref.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [searchTerm, filteredArticles]);

  const counts = {
    total: articles.length,
    read: articles.filter((a) => a.is_read).length,
    unread: articles.filter((a) => !a.is_read).length,
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-600">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p>Loading articles...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ArticleFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filter={filter}
        onFilterChange={setFilter}
        totalCount={counts.total}
        readCount={counts.read}
        unreadCount={counts.unread}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {filteredArticles.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
          {articles.length === 0 ? (
            <>
              <h3 className="text-xl mb-2 text-gray-900">
                No articles saved yet
              </h3>
              <p>Start by adding your first article using the form above!</p>
            </>
          ) : selectedCategory ? (
            <>
              <h3 className="text-xl mb-2 text-gray-900">
                No articles in this category
              </h3>
              <p>
                Try selecting a different category or clear the category filter
                to see all articles.
              </p>
              <button
                onClick={() => setSelectedCategory(null)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Clear Category Filter
              </button>
            </>
          ) : (
            <>
              <h3 className="text-xl mb-2 text-gray-900">
                No articles match your filters
              </h3>
              <p>
                Try adjusting your search terms or filters to see more results.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredArticles.map((article) => (
            <div
              key={article._id}
              ref={(el) => (articleRefs.current[article._id] = el)}
              className="h-full"
            >
              <ArticleCard
                article={article}
                onToggleRead={onToggleRead}
                onDelete={onDeleteArticle}
                categories={categories}
                onUpdateArticle={onUpdateArticle}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticlesList;
