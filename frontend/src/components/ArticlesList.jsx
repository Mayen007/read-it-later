import { useState, useMemo } from "react";
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

  const counts = {
    total: articles.length,
    read: articles.filter((a) => a.is_read).length,
    unread: articles.filter((a) => !a.is_read).length,
  };

  if (isLoading) {
    return (
      <div className="articles-loading">
        <div className="loading-spinner"></div>
        <p>Loading articles...</p>
      </div>
    );
  }

  return (
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
        <div className="empty-state">
          <BookOpen size={48} />
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
            <ArticleCard
              key={article.id}
              article={article}
              onToggleRead={onToggleRead}
              onDelete={onDeleteArticle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticlesList;
