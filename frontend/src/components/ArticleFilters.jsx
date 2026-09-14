import {
  Search,
  Filter,
  CheckCircle,
  Circle,
  BookOpen,
  Tag,
} from "lucide-react";
import SearchBar from "./SearchBar";

const ArticleFilters = ({
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  totalCount,
  readCount,
  unreadCount,
  categories = [],
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-3 sm:gap-4">
      <div className="relative flex items-center">
        <SearchBar
          value={searchTerm}
          onChange={onSearchChange}
          onSubmit={() => {
            /* optionally trigger immediate search */
          }}
        />
      </div>

      <div
        className="flex gap-2 flex-wrap"
        role="group"
        aria-label="Filter articles"
      >
        <button
          onClick={() => onFilterChange("all")}
          aria-pressed={filter === "all"}
          aria-label={`Show all articles (${totalCount})`}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border-2 rounded-lg cursor-pointer transition-[background-color,border-color,color,transform] text-xs sm:text-sm font-medium active:scale-95 ${
            filter === "all"
              ? "bg-blue-500 border-blue-500 text-white"
              : "bg-white border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-500"
          }`}
        >
          <BookOpen size={16} aria-hidden="true" className="shrink-0" />
          <span className="whitespace-nowrap">All ({totalCount})</span>
        </button>

        <button
          onClick={() => onFilterChange("unread")}
          aria-pressed={filter === "unread"}
          aria-label={`Show unread articles (${unreadCount})`}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border-2 rounded-lg cursor-pointer transition-[background-color,border-color,color,transform] text-xs sm:text-sm font-medium active:scale-95 ${
            filter === "unread"
              ? "bg-blue-500 border-blue-500 text-white"
              : "bg-white border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-500"
          }`}
        >
          <Circle size={16} aria-hidden="true" className="shrink-0" />
          <span className="whitespace-nowrap">Unread ({unreadCount})</span>
        </button>

        <button
          onClick={() => onFilterChange("read")}
          aria-pressed={filter === "read"}
          aria-label={`Show read articles (${readCount})`}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border-2 rounded-lg cursor-pointer transition-[background-color,border-color,color,transform] text-xs sm:text-sm font-medium active:scale-95 ${
            filter === "read"
              ? "bg-blue-500 border-blue-500 text-white"
              : "bg-white border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-500"
          }`}
        >
          <CheckCircle size={16} aria-hidden="true" className="shrink-0" />
          <span className="whitespace-nowrap">Read ({readCount})</span>
        </button>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="border-t border-gray-200 pt-3 sm:pt-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Tag size={16} aria-hidden="true" className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Filter by Category
              </span>
            </div>
            {selectedCategory && (
              <button
                onClick={() => onCategoryChange(null)}
                className="text-sm text-blue-700 font-semibold hover:text-blue-800 hover:underline hover:cursor-pointer transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => onCategoryChange(null)}
              aria-pressed={selectedCategory === null}
              aria-label="Show all categories"
              className={`px-3 sm:px-4 py-2 border-2 rounded-lg cursor-pointer transition-[background-color,border-color,color,transform] text-xs sm:text-sm font-medium active:scale-95 ${
                selectedCategory === null
                  ? "bg-gray-800 border-gray-800 text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-800 hover:text-gray-800"
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => onCategoryChange(category._id)}
                aria-pressed={selectedCategory === category._id}
                aria-label={`Filter by ${category.name}`}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 border-2 rounded-lg cursor-pointer transition-[background-color,border-color,color,transform] text-xs sm:text-sm font-medium active:scale-95 ${
                  selectedCategory === category._id
                    ? "border-gray-800 text-white"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
                style={{
                  backgroundColor:
                    selectedCategory === category._id
                      ? category.color || "#1f2937"
                      : "white",
                  borderColor:
                    selectedCategory === category._id
                      ? category.color || "#1f2937"
                      : "#e5e7eb",
                }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      selectedCategory === category._id
                        ? "white"
                        : category.color || "#3b82f6",
                  }}
                />
                <span className="whitespace-nowrap">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleFilters;
