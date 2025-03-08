import { X } from "lucide-react";
import React from "react";
import type { FormState } from "~/types/filters";

interface ActiveFiltersProps {
  searchParams: URLSearchParams;
  onRemoveFilter: (key: keyof FormState) => void;
  isLoading: boolean;
}

export function ActiveFilters({
  searchParams,
  onRemoveFilter,
  isLoading,
}: ActiveFiltersProps) {
  const hasActiveFilters =
    searchParams.get("make") ||
    searchParams.get("model") ||
    searchParams.get("year") ||
    searchParams.get("minPrice") ||
    searchParams.get("maxPrice") ||
    searchParams.get("bank") ||
    searchParams.get("color");

  if (!hasActiveFilters) return null;

  return (
    <div className="mb-6" role="region" aria-label="Active filters">
      <h3 className="text-slate-600 dark:text-slate-300 mb-2 font-medium">
        Active filters:
      </h3>
      <div className="flex flex-wrap gap-2">
        {searchParams.get("make") && (
          <FilterChip
            label="Make"
            value={searchParams.get("make") || ""}
            onRemove={() => onRemoveFilter("make")}
            isLoading={isLoading}
          />
        )}
        {searchParams.get("model") && (
          <FilterChip
            label="Model"
            value={searchParams.get("model") || ""}
            onRemove={() => onRemoveFilter("model")}
            isLoading={isLoading}
          />
        )}
        {searchParams.get("year") && (
          <FilterChip
            label="Year"
            value={searchParams.get("year") || ""}
            onRemove={() => onRemoveFilter("year")}
            isLoading={isLoading}
          />
        )}
        {searchParams.get("minPrice") && (
          <FilterChip
            label="Min Price"
            value={formatCurrency(searchParams.get("minPrice") || "")}
            onRemove={() => onRemoveFilter("minPrice")}
            isLoading={isLoading}
          />
        )}
        {searchParams.get("maxPrice") && (
          <FilterChip
            label="Max Price"
            value={formatCurrency(searchParams.get("maxPrice") || "")}
            onRemove={() => onRemoveFilter("maxPrice")}
            isLoading={isLoading}
          />
        )}
        {searchParams.get("bank") && (
          <FilterChip
            label="Bank"
            value={searchParams.get("bank") || ""}
            onRemove={() => onRemoveFilter("bank")}
            isLoading={isLoading}
          />
        )}
        {searchParams.get("color") && (
          <FilterChip
            label="Color"
            value={searchParams.get("color") || ""}
            onRemove={() => onRemoveFilter("color")}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}

interface FilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
  isLoading: boolean;
}

function FilterChip({ label, value, onRemove, isLoading }: FilterChipProps) {
  return (
    <button
      onClick={onRemove}
      className="bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full flex items-center gap-2 hover:bg-blue-200 dark:hover:bg-blue-600/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      disabled={isLoading}
      aria-label={`Remove ${label.toLowerCase()} filter: ${value}`}
    >
      {label}: {value}
      <span className="text-lg" aria-hidden="true">
        <X size={16} />
      </span>
    </button>
  );
}

function formatCurrency(value: string): string {
  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "JMD",
    maximumFractionDigits: 0,
  }).format(Number(value));
}
