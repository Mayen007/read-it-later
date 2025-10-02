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

  // Load articles on component mount
  useEffect(() => {
    loadArticles();
  }, []);

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

  const handleAddArticle = async (url) => {
    const response = await articlesAPI.add(url);
    const newArticle = response.data;
    setArticles((prev) => [newArticle, ...prev]);
  };

  const handleToggleRead = async (id, isRead) => {
    await articlesAPI.update(id, { is_read: isRead });
    setArticles((prev) =>
      prev.map((article) =>
        article.id === id ? { ...article, is_read: isRead } : article
      )
    );
  };

  const handleDeleteArticle = async (id) => {
    await articlesAPI.delete(id);
    setArticles((prev) => prev.filter((article) => article.id !== id));
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
