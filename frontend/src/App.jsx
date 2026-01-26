import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { BookOpen, LogOut, User, Tag, X } from "lucide-react";
import AddArticleForm from "./components/AddArticleForm";
import ArticlesList from "./components/ArticlesList";
import CategoryManager from "./components/CategoryManager";
import LoadingSkeleton from "./components/LoadingSkeleton";
import Spinner from "./components/Spinner";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { useAuth } from "./hooks/useAuth";
import { articlesAPI } from "./services/api";

// Lazy load auth components - only loaded when needed
const Landing = lazy(() => import("./components/Landing"));
const Login = lazy(() => import("./components/Login"));
const Register = lazy(() => import("./components/Register"));

function AppContent() {
  const { isAuthenticated, loading: authLoading, logout, user } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [showLanding, setShowLanding] = useState(
    !localStorage.getItem("hasVisited"),
  );
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [pollingIntervals, setPollingIntervals] = useState({}); // To store interval IDs for polling
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 12,
  });

  const handleGetStarted = () => {
    localStorage.setItem("hasVisited", "true");
    setShowLanding(false);
  };

  const loadArticles = useCallback(
    async (page = pagination.currentPage) => {
      try {
        setIsLoading(true);
        setError("");
        const response = await articlesAPI.getAll({
          page,
          limit: pagination.limit,
        });

        // Handle both old format (array) and new format (object with articles and pagination)
        if (Array.isArray(response.data)) {
          // Old format - backward compatibility
          setArticles(response.data);
        } else {
          // New format with pagination
          setArticles(response.data.articles);
          setPagination(response.data.pagination);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error loading articles:", error);
        }
        const isDev = import.meta.env.DEV;
        if (isDev) {
          setError(
            "Failed to load articles. Make sure the backend server is running on port 5000.",
          );
        } else {
          // More informative error message about cold starts
          const isTimeout =
            error.code === "ECONNABORTED" || error.message?.includes("timeout");
          if (isTimeout) {
            setError(
              "The server is waking up from sleep (this can take 30-60 seconds on first load). Please wait a moment and try again.",
            );
          } else {
            setError(
              "Failed to load articles. The service might be waking up. Please try again in a moment.",
            );
          }
        }
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.currentPage, pagination.limit],
  );

  const loadCategories = useCallback(async () => {
    try {
      const response = await articlesAPI.getCategories();
      // Filter out any null or invalid categories
      const validCategories = (response.data || []).filter(
        (cat) => cat && cat._id,
      );
      setCategories(validCategories);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error loading categories:", error);
      }
      // Silently fail - categories are optional
    }
  }, []);

  // Load articles and categories on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadArticles();
      loadCategories();
    }

    // Cleanup polling intervals on unmount
    return () => {
      Object.values(pollingIntervals).forEach(clearInterval);
    };
  }, [pollingIntervals, isAuthenticated, loadArticles, loadCategories]);

  const handleUpdateArticle = async (idOrArticle, data = null) => {
    // If called with an article object (from polling), just update state
    if (typeof idOrArticle === "object" && idOrArticle._id) {
      setArticles((prev) =>
        prev.map((article) =>
          article._id === idOrArticle._id ? idOrArticle : article,
        ),
      );
    } else {
      // If called with id and data (from category editing), make API call
      const response = await articlesAPI.update(idOrArticle, data);
      setArticles((prev) =>
        prev.map((article) =>
          article._id === idOrArticle
            ? { ...article, ...response.data }
            : article,
        ),
      );
    }
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
        if (import.meta.env.DEV) {
          console.error(`Error polling for article ${articleId}:`, error);
        }
        // Consider stopping polling after a few errors or specific error types
      }
    }, 5000); // Poll every 5 seconds

    setPollingIntervals((prev) => ({
      ...prev,
      [articleId]: intervalId,
    }));
  };

  const handleAddArticle = async (url, categories = []) => {
    const response = await articlesAPI.addWithCategories(url, categories);
    const newArticle = response.data.article; // Extract the article from the 'article' property

    // Reset to page 1 and reload articles when adding new article
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    await loadArticles(1);

    // Start polling for this specific article's status
    startPolling(newArticle._id);
  };

  const handleToggleRead = async (id, isRead) => {
    await articlesAPI.update(id, { is_read: isRead });
    setArticles((prev) =>
      prev.map((article) =>
        article._id === id ? { ...article, is_read: isRead } : article,
      ),
    );
  };

  const handleDeleteArticle = async (id) => {
    try {
      await articlesAPI.delete(id);
    } catch (err) {
      // If the article was already deleted on the server, treat as success and remove locally.
      if (err?.response?.status === 404) {
        if (import.meta.env.DEV) {
          console.warn(
            `Article ${id} was not found on server; removing locally.`,
          );
        }
      } else {
        // Re-throw other errors so callers can show feedback
        throw err;
      }
    } finally {
      // Always remove the article locally to keep UI in sync and avoid repeated delete calls
      setArticles((prev) => prev.filter((article) => article._id !== id));
    }
  };

  // Category handlers
  const handleCreateCategory = async (name, color) => {
    try {
      const response = await articlesAPI.createCategory(name, color);
      if (import.meta.env.DEV) {
        console.log("Create category response:", response.data);
      }
      // Validate that we received a valid category object
      if (response.data && response.data._id) {
        setCategories((prev) => [...prev, response.data]);
      } else {
        console.error("Invalid category data:", response.data);
        throw new Error("Invalid category data received from server");
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error creating category:", error);
      }
      throw error; // Re-throw so CategoryManager can handle it
    }
  };

  const handleUpdateCategory = async (id, data) => {
    try {
      const response = await articlesAPI.updateCategory(id, data);
      // Validate that we received a valid category object
      if (response.data && response.data._id) {
        setCategories((prev) =>
          prev.map((cat) => (cat && cat._id === id ? response.data : cat)),
        );
      } else {
        throw new Error("Invalid category data received from server");
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error updating category:", error);
      }
      throw error; // Re-throw so CategoryManager can handle it
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await articlesAPI.deleteCategory(id);
      setCategories((prev) => prev.filter((cat) => cat && cat._id !== id));
      // Reload articles to update category references
      await loadArticles();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error deleting category:", error);
      }
      throw error; // Re-throw so CategoryManager can handle it
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
    loadArticles(newPage);
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Show spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner text="Loading..." />
      </div>
    );
  }

  // Show login/register screen if not authenticated
  if (!isAuthenticated) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Spinner text="Loading..." />
          </div>
        }
      >
        {showLanding ? (
          <Landing onGetStarted={handleGetStarted} />
        ) : showRegister ? (
          <Register onSwitchToLogin={() => setShowRegister(false)} />
        ) : (
          <Login onSwitchToRegister={() => setShowRegister(true)} />
        )}
      </Suspense>
    );
  }

  return (
    <>
      <div className="min-h-screen py-4 sm:py-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto">
        <header className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-4 gap-2">
            {/* Mobile: compact layout */}
            <div className="flex sm:hidden items-center gap-2">
              <BookOpen size={24} className="text-blue-500 shrink-0" />
              <h1 className="text-2xl font-bold text-blue-500 truncate">
                Read It Later
              </h1>
            </div>

            {/* Desktop: centered with side elements */}
            <div className="hidden sm:flex flex-1"></div>
            <h1 className="hidden sm:flex items-center justify-center gap-2 sm:gap-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-500">
              <BookOpen size={32} className="sm:w-10 sm:h-10" />
              Read It Later
            </h1>

            <div className="flex flex-1 justify-end items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowCategoryManager(!showCategoryManager)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-sm rounded-lg cursor-pointer transition-all ${
                  showCategoryManager
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
                title={
                  showCategoryManager ? "Hide Categories" : "Manage Categories"
                }
              >
                {showCategoryManager ? (
                  <X size={18} className="shrink-0" />
                ) : (
                  <Tag size={18} className="shrink-0" />
                )}
                <span className="hidden sm:inline">
                  {showCategoryManager ? "Close" : "Categories"}
                </span>
              </button>
              <div
                className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
                title={user?.email}
              >
                <User size={20} className="sm:w-5 sm:h-5" />
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-sm text-gray-600 hover:text-red-600 cursor-pointer transition-colors rounded-lg hover:bg-gray-50"
                title="Logout"
              >
                <LogOut size={18} className="shrink-0" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
          <p className="text-left sm:text-center text-gray-600 text-sm sm:text-base">
            Save and organize articles to read later
          </p>
        </header>

        <main className="flex flex-col gap-6 sm:gap-8">
          {/* Category Manager - Collapsible */}
          {showCategoryManager && (
            <CategoryManager
              categories={categories}
              onCreateCategory={handleCreateCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          <AddArticleForm onAddArticle={handleAddArticle} />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <p className="text-sm sm:text-base">{error}</p>
              <button
                onClick={loadArticles}
                className="px-4 py-2 bg-red-500 text-white rounded text-sm cursor-pointer hover:bg-red-600 transition-colors whitespace-nowrap shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          <ArticlesList
            articles={articles}
            onToggleRead={handleToggleRead}
            onDeleteArticle={handleDeleteArticle}
            onUpdateArticle={handleUpdateArticle}
            categories={categories}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </main>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
