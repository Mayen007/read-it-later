import { useState, useEffect } from "react";
import {
  ExternalLink,
  Clock,
  Check,
  Trash2,
  User,
  Calendar,
} from "lucide-react";
import { formatDistance, parseISO } from "date-fns";

const ArticleCard = ({ article, onToggleRead, onDelete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for real-time timestamp updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second for more accurate timestamps

    return () => clearInterval(interval);
  }, []);

  // Force immediate update when article changes (new article added)
  useEffect(() => {
    setCurrentTime(new Date());
  }, [article.saved_date, article.id]); // Trigger when saved_date or id changes

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
      let dateObj;

      // If it's a number (timestamp), convert it
      if (typeof dateString === "number") {
        dateObj = new Date(dateString < 1e12 ? dateString * 1000 : dateString);
      } else if (/^\d+$/.test(String(dateString))) {
        // String of digits (timestamp)
        const timestamp = Number(dateString);
        dateObj = new Date(timestamp < 1e12 ? timestamp * 1000 : timestamp);
      } else {
        // Handle ISO format string
        // If it doesn't end with Z, assume it's UTC and add Z
        let isoString = dateString;
        if (
          !isoString.endsWith("Z") &&
          !isoString.includes("+") &&
          !isoString.includes("-", 10)
        ) {
          isoString = isoString + "Z";
        }
        dateObj = parseISO(isoString);
      }

      // Use currentTime state for real-time calculation
      return formatDistance(dateObj, currentTime, {
        addSuffix: true,
        includeSeconds: true,
      });
    } catch (error) {
      console.error(
        "Date parsing error:",
        error,
        "for dateString:",
        dateString
      );
      return dateString;
    }
  };

  return (
    <div className={`article-card ${article.is_read ? "read" : "unread"}`}>
      <div className="article-thumbnail">
        <img
          src={article.thumbnail_url || "/logo.png"}
          alt={article.title}
          onError={(e) => {
            if (e.target.src !== "/logo.png") {
              e.target.src = "/logo.png";
            }
          }}
        />
      </div>

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
