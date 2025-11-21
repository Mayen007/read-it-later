import { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";
import AddArticleForm from "./components/AddArticleForm";
import ArticlesList from "./components/ArticlesList";
import { articlesAPI } from "./services/api";
import "./App.css";

function App() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [pollingIntervals, setPollingIntervals] = useState({}); // To store interval IDs for polling

  // Load articles on component mount
  useEffect(() => {
    loadArticles();

    // Cleanup polling intervals on unmount
    return () => {
      Object.values(pollingIntervals).forEach(clearInterval);
    };
  }, [pollingIntervals]);

  const loadArticles = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await articlesAPI.getAll();
      setArticles(response.data);
    } catch (error) {
      console.error("Error loading articles:", error);
      const isDev = import.meta.env.DEV;
      if (isDev) {
        setError(
          "Failed to load articles. Make sure the backend server is running on port 5000."
        );
      } else {
        setError(
          "Failed to load articles. The service might be temporarily unavailable. Please try again in a moment."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateArticle = (updatedArticle) => {
    setArticles((prev) =>
      prev.map((article) =>
        article._id === updatedArticle._id ? updatedArticle : article
      )
    );
  };

  const startPolling = (articleId) => {
    // Clear existing interval if any for this article
    if (pollingIntervals[articleId]) {
      clearInterval(pollingIntervals[articleId]);
    }

    const intervalId = setInterval(async () => {
      try {
        const response = await articlesAPI.get(articleId); // Assuming you add a get by ID to your API
        const fetchedArticle = response.data;

        if (
          fetchedArticle.status === "completed" ||
          fetchedArticle.status === "failed"
        ) {
          handleUpdateArticle(fetchedArticle);
          clearInterval(intervalId); // Stop polling once completed or failed
          setPollingIntervals((prev) => {
            const newIntervals = { ...prev };
            delete newIntervals[articleId];
            return newIntervals;
          });
        }
      } catch (error) {
        console.error(`Error polling for article ${articleId}:`, error);
        // Consider stopping polling after a few errors or specific error types
      }
    }, 5000); // Poll every 5 seconds

    setPollingIntervals((prev) => ({
      ...prev,
      [articleId]: intervalId,
    }));
  };

  const handleAddArticle = async (url) => {
    const response = await articlesAPI.add(url);
    const newArticle = response.data.article; // Extract the article from the 'article' property
    setArticles((prev) => [newArticle, ...prev]);

    // Start polling for this specific article's status
    startPolling(newArticle._id);
  };

  const handleToggleRead = async (id, isRead) => {
    await articlesAPI.update(id, { is_read: isRead });
    setArticles((prev) =>
      prev.map((article) =>
        article._id === id ? { ...article, is_read: isRead } : article
      )
    );
  };

  const handleDeleteArticle = async (id) => {
    try {
      await articlesAPI.delete(id);
    } catch (err) {
      // If the article was already deleted on the server, treat as success and remove locally.
      if (err?.response?.status === 404) {
        console.warn(
          `Article ${id} was not found on server; removing locally.`
        );
      } else {
        // Re-throw other errors so callers can show feedback
        throw err;
      }
    } finally {
      // Always remove the article locally to keep UI in sync and avoid repeated delete calls
      setArticles((prev) => prev.filter((article) => article._id !== id));
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <BookOpen size={32} />
          Read It Later
        </h1>
        <p>Save and organize articles to read later</p>
      </header>

      <main className="app-main">
        <AddArticleForm onAddArticle={handleAddArticle} />

        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button onClick={loadArticles}>Retry</button>
          </div>
        )}

        <ArticlesList
          articles={articles}
          onToggleRead={handleToggleRead}
          onDeleteArticle={handleDeleteArticle}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}

export default App;
