import { Search, Filter, CheckCircle, Circle, BookOpen } from "lucide-react";

const ArticleFilters = ({
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  totalCount,
  readCount,
  unreadCount,
}) => {
  return (
    <>
      <div className="article-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button
            onClick={() => onFilterChange("all")}
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
          >
            <BookOpen size={16} />
            All ({totalCount})
          </button>

          <button
            onClick={() => onFilterChange("unread")}
            className={`filter-btn ${filter === "unread" ? "active" : ""}`}
          >
            <Circle size={16} />
            Unread ({unreadCount})
          </button>

          <button
            onClick={() => onFilterChange("read")}
            className={`filter-btn ${filter === "read" ? "active" : ""}`}
          >
            <CheckCircle size={16} />
            Read ({readCount})
          </button>
        </div>
      </div>
    </>
  );
};

export default ArticleFilters;
