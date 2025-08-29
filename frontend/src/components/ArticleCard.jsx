import { useState } from "react";
import {
  ExternalLink,
  Clock,
  Check,
  Trash2,
  User,
  Calendar,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ArticleCard = ({ article, onToggleRead, onDelete }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleRead = async () => {
    setIsLoading(true);
    try {
      await onToggleRead(article.id, !article.is_read);
    } catch (error) {
      console.error("Error toggling read status:", error);
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      try {
        await onDelete(article.id);
      } catch (error) {
        console.error("Error deleting article:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  return (
    <div className={`article-card ${article.is_read ? "read" : "unread"}`}>
      {article.thumbnail_url && (
        <div className="article-thumbnail">
          <img src={article.thumbnail_url} alt={article.title} />
        </div>
      )}

      <div className="article-content">
        <h3 className="article-title">
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            {article.title || "Untitled Article"}
            <ExternalLink size={14} />
          </a>
        </h3>

        {article.excerpt && (
          <p className="article-excerpt">{article.excerpt}</p>
        )}

        <div className="article-meta">
          {article.author && (
            <span className="meta-item">
              <User size={12} />
              {article.author}
            </span>
          )}
          {article.published_date && (
            <span className="meta-item">
              <Calendar size={12} />
              {formatDate(article.published_date)}
            </span>
          )}
          {article.saved_date && (
            <span className="meta-item">
              <Clock size={12} />
              Saved {formatDate(article.saved_date)}
            </span>
          )}
        </div>

        <div className="article-actions">
          <button
            onClick={handleToggleRead}
            disabled={isLoading}
            className={`btn-toggle-read ${article.is_read ? "read" : "unread"}`}
            title={article.is_read ? "Mark as unread" : "Mark as read"}
          >
            <Check size={16} />
            {article.is_read ? "Mark Unread" : "Mark Read"}
          </button>

          <button
            onClick={handleDelete}
            className="btn-delete"
            title="Delete article"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
