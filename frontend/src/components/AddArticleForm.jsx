import { useState } from "react";
import { Plus, Link } from "lucide-react";

const AddArticleForm = ({ onAddArticle }) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await onAddArticle(url.trim());
      setUrl("");
    } catch (error) {
      console.error("Error adding article:", error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("Failed to add article. Please try again.");
      }
    }

    setIsLoading(false);
  };

  return (
    <>
      <div className="add-article-form">
        <h2>
          <Link size={20} />
          Add New Article
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter article URL..."
              disabled={isLoading}
              className="url-input"
            />
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="btn-add"
            >
              <Plus size={16} />
              {isLoading ? "Adding..." : "Add Article"}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
    </>
  );
};

export default AddArticleForm;
