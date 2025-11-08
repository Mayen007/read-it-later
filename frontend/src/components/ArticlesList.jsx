import { useState, useMemo, useRef, useEffect } from "react";
import ArticleCard from "./ArticleCard";
import ArticleFilters from "./ArticleFilters";
import { BookOpen } from "lucide-react";

const ArticlesList = ({
  articles,
  onToggleRead,
  onDeleteArticle,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const articleRefs = useRef({});

  const filteredArticles = useMemo(() => {
    let filtered = articles;

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
          article.url?.toLowerCase().includes(term)
      );
    }

    // Sort by saved date (newest first)
    return filtered.sort(
      (a, b) => new Date(b.saved_date) - new Date(a.saved_date)
    );
  }, [articles, searchTerm, filter]);

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
      <>
        <div className="articles-loading">
          <div className="loading-spinner"></div>
          <p>Loading articles...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="articles-list">
        <ArticleFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filter={filter}
          onFilterChange={setFilter}
          totalCount={counts.total}
          readCount={counts.read}
          unreadCount={counts.unread}
        />

        {filteredArticles.length === 0 ? (
          <div className="empty-state flex justify-center items-center flex-col">
            <BookOpen size={48} className="flex justify-center items-center"/>
            {articles.length === 0 ? (
              <>
                <h3>No articles saved yet</h3>
                <p>Start by adding your first article using the form above!</p>
              </>
            ) : (
              <>
                <h3>No articles match your search</h3>
                <p>Try adjusting your search terms or filters.</p>
              </>
            )}
          </div>
        ) : (
          <div className="articles-grid">
            {filteredArticles.map((article) => (
              <div
                key={article._id}
                ref={(el) => (articleRefs.current[article._id] = el)}
              >
                <ArticleCard
                  article={article}
                  onToggleRead={onToggleRead}
                  onDelete={onDeleteArticle}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ArticlesList;
