import { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import { Plus, Link } from "lucide-react";
import { articlesAPI } from "../services/api";

const AddArticleForm = ({ onAddArticle }) => {
  const [url, setUrl] = useState("");
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState([]);
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
      const categoryIds = (selected || []).map((s) => s.value).filter(Boolean);
      await onAddArticle(url.trim(), categoryIds);
      setUrl("");
      setSelected([]);
      // No longer setting isLoading to false immediately, as background processing continues
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error adding article:", error);
      }
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("Failed to add article. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    articlesAPI
      .getCategories()
      .then((res) => {
        if (!mounted) return;
        const opts = (res.data || []).map((c) => ({
          value: c._id,
          label: c.name,
          color: c.color,
        }));
        setOptions(opts);
      })
      .catch(() => {
        // ignore
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleCreateCategory = async (inputValue) => {
    try {
      const res = await articlesAPI.createCategory(inputValue);
      const cat = res.data;
      const option = { value: cat._id, label: cat.name, color: cat.color };
      setOptions((prev) => [...prev, option]);
      setSelected((prev) => [...(prev || []), option]);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Failed to create category:", err);
      }
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-sm border border-gray-200">
      <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-900">
        <Link size={20} className="shrink-0" />
        <span className="truncate">Add New Article</span>
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 mb-4">
          <input
            id="article-url"
            name="article-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter article URL..."
            disabled={isLoading}
            aria-label="Article URL"
            className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg text-sm sm:text-base transition-all focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-gray-50 disabled:opacity-60"
          />
          <div className="w-full lg:min-w-[220px] lg:max-w-[280px] lg:shrink-0">
            <CreatableSelect
              isMulti
              options={options}
              value={selected}
              onChange={(val) => setSelected(val)}
              onCreateOption={handleCreateCategory}
              placeholder="Categories..."
              isDisabled={isLoading}
              aria-label="Categories"
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "42px",
                  borderColor: "#e5e7eb",
                }),
                container: (base) => ({
                  ...base,
                  width: "100%",
                }),
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            aria-label="Add article"
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 text-white rounded-lg text-sm sm:text-base font-medium cursor-pointer transition-all hover:bg-blue-600 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap lg:shrink-0"
          >
            <Plus size={16} className="shrink-0" />
            <span className="hidden sm:inline">
              {isLoading ? "Adding..." : "Add Article"}
            </span>
            <span className="sm:hidden">{isLoading ? "Adding..." : "Add"}</span>
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="text-red-500 text-xs sm:text-sm mt-2 p-2 sm:p-3 bg-red-50 border border-red-200 rounded"
          >
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default AddArticleForm;
