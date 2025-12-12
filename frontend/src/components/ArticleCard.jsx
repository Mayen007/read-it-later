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
import ConfirmDialog from "./ConfirmDialog";

const ArticleCard = ({ article, onToggleRead, onDelete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
      await onToggleRead(article._id, !article.is_read);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error toggling read status:", error);
      }
    }
    setIsLoading(false);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteDialog(false);
    setIsLoading(true);
    try {
      await onDelete(article._id);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error deleting article:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
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
      if (import.meta.env.DEV) {
        console.error(
          "Date parsing error:",
          error,
          "for dateString:",
          dateString
        );
      }
      return dateString;
    }
  };

  return (
    <article
      className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md flex flex-col h-full ${
        article.is_read ? "border-gray-200 opacity-75" : "border-gray-200"
      } ${
        article.status === "pending" ? "border-yellow-200 bg-yellow-50/30" : ""
      } ${article.status === "failed" ? "border-red-200 bg-red-50/30" : ""}`}
    >
      <div className="w-full aspect-video overflow-hidden rounded-t-xl bg-gray-100">
        {article.status === "pending" ? (
          <div className="w-full h-full flex items-center justify-center bg-yellow-50">
            <Clock size={48} className="text-yellow-500 animate-pulse" />
          </div>
        ) : article.status === "failed" ? (
          <div className="w-full h-full flex items-center justify-center bg-red-50">
            <Trash2 size={48} className="text-red-500" />
          </div>
        ) : (
          <picture>
            <source
              srcSet={
                article.thumbnail_url ? article.thumbnail_url : "/logo.webp"
              }
              type="image/webp"
            />
            <img
              src={article.thumbnail_url || "/logo-optimized.png"}
              alt={article.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform hover:scale-105"
              onError={(e) => {
                if (!e.target.src.includes("logo-optimized.png")) {
                  e.target.src = "/logo-optimized.png";
                }
              }}
            />
          </picture>
        )}
      </div>

      <div className="p-4 sm:p-6 flex flex-col gap-2 sm:gap-3 flex-1">
        {article.status === "pending" ? (
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight">
            Processing Article...
          </h3>
        ) : article.status === "failed" ? (
          <h3 className="text-lg sm:text-xl font-semibold text-red-600 leading-tight">
            Failed to Load Article
          </h3>
        ) : (
          <h3 className="text-lg sm:text-xl font-semibold leading-tight">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 hover:text-blue-600 transition-colors inline-flex items-center gap-1 sm:gap-2 group"
              aria-label={`Read article: ${
                article.title || "Untitled Article"
              }`}
            >
              <span className="line-clamp-2">
                {article.title || "Untitled Article"}
              </span>
              <ExternalLink
                size={14}
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              />
            </a>
          </h3>
        )}

        {article.status === "pending" ? (
          <p className="text-gray-600 text-sm line-clamp-3">
            Metadata extraction in progress.
          </p>
        ) : article.status === "failed" ? (
          <p className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
            Error: {article.error_message || "Unknown error"}
          </p>
        ) : (
          article.excerpt && (
            <p className="text-gray-600 text-sm line-clamp-3">
              {article.excerpt}
            </p>
          )
        )}

        <div className="flex flex-col gap-1 text-xs text-gray-500">
          {article.author &&
            article.status !== "pending" &&
            article.status !== "failed" && (
              <span className="flex items-center gap-1.5">
                <User size={12} className="shrink-0" />
                {article.author}
              </span>
            )}
          {article.published_date &&
            article.status !== "pending" &&
            article.status !== "failed" && (
              <span className="flex items-center gap-1.5">
                <Calendar size={12} className="shrink-0" />
                {formatDate(article.published_date)}
              </span>
            )}
          {article.saved_date &&
            article.status !== "pending" &&
            article.status !== "failed" && (
              <span className="flex items-center gap-1.5">
                <Clock size={12} className="shrink-0" />
                Saved {formatDate(article.saved_date)}
              </span>
            )}
        </div>

        {article.categories && article.categories.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2 mb-2">
            {article.categories.map((c) => (
              <span
                key={c._id || c}
                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium tracking-wide transition-all hover:-translate-y-0.5 hover:shadow-sm"
                style={{
                  backgroundColor: c.color || "#eef2ff",
                  color: c.color ? "#ffffff" : "#4f46e5",
                }}
              >
                {c.name || c}
              </span>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center">
          <button
            onClick={handleToggleRead}
            disabled={
              isLoading ||
              article.status === "pending" ||
              article.status === "failed"
            }
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              article.is_read
                ? "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                : "bg-green-500 text-white hover:bg-green-600"
            } disabled:opacity-60 disabled:cursor-not-allowed`}
            title={article.is_read ? "Mark as unread" : "Mark as read"}
          >
            <Check size={16} />
            {article.is_read ? "Mark Unread" : "Mark Read"}
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium transition-all hover:bg-red-100 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isLoading || article.status === "pending"}
            title="Delete article"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {showDeleteDialog && (
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          title="Delete Article"
          message={`Are you sure you want to delete "${
            article.title || "this article"
          }"?`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      )}
    </article>
  );
};

export default ArticleCard;
