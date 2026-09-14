import { useState, useEffect } from "react";
import { Search } from "lucide-react";

export default function SearchBar({
  value = "",
  onChange = () => {},
  onDebouncedChange = () => {},
  onSubmit = () => {},
  placeholder = "Search articles…",
  debounceMs = 300,
}) {
  const [local, setLocal] = useState(value);

  useEffect(() => setLocal(value), [value]);

  useEffect(() => {
    const t = setTimeout(() => onDebouncedChange(local.trim()), debounceMs);
    return () => clearTimeout(t);
  }, [local, debounceMs, onDebouncedChange]);

  return (
    <div className="relative flex items-center w-full">
      <Search
        size={18}
        aria-hidden="true"
        className="absolute left-3 text-gray-400 pointer-events-none"
      />
      <input
        type="search"
        name="search"
        aria-label="Search articles"
        value={local}
        placeholder={placeholder}
        onChange={(e) => {
          setLocal(e.target.value);
          onChange(e.target.value);
        }}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        className="w-full pl-10 pr-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg text-sm sm:text-base transition-[border-color,box-shadow] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      />
    </div>
  );
}
