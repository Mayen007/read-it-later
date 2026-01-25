import { useState, lazy, Suspense } from "react";
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Folder,
  AlertCircle,
} from "lucide-react";

const ConfirmDialog = lazy(() => import("./ConfirmDialog"));

const DEFAULT_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
  "#6366f1", // indigo
  "#14b8a6", // teal
];

const CategoryManager = ({
  categories = [],
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  isLoading = false,
}) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(DEFAULT_COLORS[0]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [localLoading, setLocalLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!newCategoryName.trim()) {
      setError("Category name is required");
      return;
    }

    // Check for duplicate names
    if (
      categories.some(
        (cat) =>
          cat && cat.name.toLowerCase() === newCategoryName.trim().toLowerCase(),
      )
    ) {
      setError("A category with this name already exists");
      return;
    }

    setLocalLoading(true);
    setError("");

    try {
      await onCreateCategory(newCategoryName.trim(), newCategoryColor);
      setNewCategoryName("");
      setNewCategoryColor(DEFAULT_COLORS[0]);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to create category. Please try again.",
      );
    } finally {
      setLocalLoading(false);
    }
  };

  const handleStartEdit = (category) => {
    setEditingId(category._id);
    setEditName(category.name);
    setEditColor(category.color || DEFAULT_COLORS[0]);
    setError("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditColor("");
    setError("");
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) {
      setError("Category name is required");
      return;
    }

    // Check for duplicate names (excluding current category)
    if (
      categories.some(
        (cat) =>
          cat && cat._id !== id &&
          cat.name.toLowerCase() === editName.trim().toLowerCase(),
      )
    ) {
      setError("A category with this name already exists");
      return;
    }

    setLocalLoading(true);
    setError("");

    try {
      await onUpdateCategory(id, { name: editName.trim(), color: editColor });
      setEditingId(null);
      setEditName("");
      setEditColor("");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to update category. Please try again.",
      );
    } finally {
      setLocalLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setError("");
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    setLocalLoading(true);
    setError("");

    try {
      await onDeleteCategory(deletingId);
      setDeletingId(null);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to delete category. Please try again.",
      );
      setDeletingId(null);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeletingId(null);
  };

  const deletingCategory = categories.find((cat) => cat && cat._id === deletingId);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Tag size={20} />
          Manage Categories
        </h3>
        <p className="text-blue-100 text-sm mt-1">
          Organize your articles with custom categories
        </p>
      </div>

      <div className="p-6">
        {/* Create New Category Form */}
        <form onSubmit={handleCreate} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name..."
              disabled={localLoading || isLoading}
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-gray-50 disabled:opacity-60"
              aria-label="New category name"
            />
            <div className="flex gap-2">
              <div className="relative">
                <input
                  type="color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  disabled={localLoading || isLoading}
                  className="w-12 h-[42px] rounded-lg border-2 border-gray-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  aria-label="Category color"
                  title="Choose category color"
                />
              </div>
              <button
                type="submit"
                disabled={localLoading || isLoading || !newCategoryName.trim()}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium transition-all hover:bg-blue-600 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <Plus size={16} />
                Add
              </button>
            </div>
          </div>

          {/* Quick Color Presets */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <span className="text-xs text-gray-500 mr-2 self-center">
              Quick colors:
            </span>
            {DEFAULT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setNewCategoryColor(color)}
                className={`w-6 h-6 rounded-md border-2 transition-all hover:scale-110 ${
                  newCategoryColor === color
                    ? "border-gray-900 shadow-md"
                    : "border-gray-200"
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select ${color} color`}
                title={color}
              />
            ))}
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-600 text-sm"
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Categories List */}
        <div className="space-y-2">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <Folder size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 mb-1">No categories yet</p>
              <p className="text-sm text-gray-400">
                Create your first category to start organizing articles
              </p>
            </div>
          ) : (
            categories.filter(cat => cat).map((category) => (
              <div
                key={category._id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-all"
              >
                {editingId === category._id ? (
                  // Edit Mode
                  <>
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      disabled={localLoading}
                      className="w-10 h-10 rounded-md border-2 border-gray-200 cursor-pointer disabled:opacity-60"
                      aria-label="Edit category color"
                    />
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      disabled={localLoading}
                      className="flex-1 px-3 py-2 border-2 border-blue-500 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                      aria-label="Edit category name"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(category._id)}
                      disabled={localLoading || !editName.trim()}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      title="Save changes"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={localLoading}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-60"
                      title="Cancel editing"
                    >
                      <X size={18} />
                    </button>
                  </>
                ) : (
                  // View Mode
                  <>
                    <div
                      className="w-10 h-10 rounded-md shrink-0"
                      style={{
                        backgroundColor: category.color || DEFAULT_COLORS[0],
                      }}
                      aria-hidden="true"
                    />
                    <span className="flex-1 text-gray-900 font-medium">
                      {category.name}
                    </span>
                    <button
                      onClick={() => handleStartEdit(category)}
                      disabled={localLoading || isLoading}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      title="Edit category"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(category._id)}
                      disabled={localLoading || isLoading}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      title="Delete category"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Categories Count */}
        {categories.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
            {categories.length}{" "}
            {categories.length === 1 ? "category" : "categories"}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deletingId && (
        <Suspense fallback={null}>
          <ConfirmDialog
            isOpen={!!deletingId}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            title="Delete Category"
            message={`Are you sure you want to delete "${
              deletingCategory?.name || "this category"
            }"? Articles with this category will not be deleted, but the category will be removed from them.`}
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
          />
        </Suspense>
      )}
    </div>
  );
};

export default CategoryManager;
