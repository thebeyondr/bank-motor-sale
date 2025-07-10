import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";

interface SearchSuggestionsProps {
  value: string;
  onSelect: (value: string) => void;
  type: "make" | "model";
  isVisible: boolean;
  onClose: () => void;
}

export function SearchSuggestions({
  value,
  onSelect,
  type,
  isVisible,
  onClose,
}: SearchSuggestionsProps) {
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const filters = useQuery(api.vehicles.getVehicleFilters);

  useEffect(() => {
    if (!filters || !value.trim()) {
      setFilteredSuggestions([]);
      return;
    }

    const suggestions = type === "make" ? filters.makes : filters.models;
    const filtered = suggestions
      .filter((item) => item.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 8); // Limit to 8 suggestions

    setFilteredSuggestions(filtered);
    setSelectedIndex(-1);
  }, [value, type, filters]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isVisible || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          onSelect(filteredSuggestions[selectedIndex]);
        }
        break;
      case "Escape":
        onClose();
        break;
    }
  };

  if (!isVisible || filteredSuggestions.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
    >
      {filteredSuggestions.map((suggestion, index) => (
        <button
          key={suggestion}
          type="button"
          className={`w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
            index === selectedIndex
              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
              : "text-slate-900 dark:text-slate-100"
          }`}
          onClick={() => onSelect(suggestion)}
          onKeyDown={handleKeyDown}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
