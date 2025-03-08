import React from "react";
import type { FormState } from "~/types/filters";

export interface FilterFormProps {
  formState: FormState;
  isLoading: boolean;
  onUpdateFilter: (
    key: keyof FormState,
    value: string,
    isBlur?: boolean
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
}

export function FilterForm({
  formState,
  isLoading,
  onUpdateFilter,
  onSubmit,
  onClear,
}: FilterFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-blue-50 dark:bg-slate-800 p-6 rounded-lg mb-8"
      aria-label="Vehicle search filters"
    >
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        role="group"
        aria-label="Filter options"
      >
        <div>
          <label
            htmlFor="make"
            className="block text-slate-600 dark:text-slate-300 mb-2 font-bold"
          >
            Make
          </label>
          <input
            type="text"
            id="make"
            name="make"
            value={formState.make}
            onChange={(e) => onUpdateFilter("make", e.target.value)}
            onBlur={(e) => onUpdateFilter("make", e.target.value, true)}
            className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded px-3 py-2 border-[1.5px] border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            placeholder="e.g. Toyota"
            disabled={isLoading}
            aria-label="Vehicle make"
          />
        </div>

        <div>
          <label
            htmlFor="model"
            className="block text-slate-600 dark:text-slate-300 mb-2 font-bold"
          >
            Model
          </label>
          <input
            type="text"
            id="model"
            name="model"
            value={formState.model}
            onChange={(e) => onUpdateFilter("model", e.target.value)}
            onBlur={(e) => onUpdateFilter("model", e.target.value, true)}
            className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded px-3 py-2 border-[1.5px] border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            placeholder="e.g. Corolla"
            disabled={isLoading}
            aria-label="Vehicle model"
          />
        </div>

        <div>
          <label
            htmlFor="year"
            className="block text-slate-600 dark:text-slate-300 mb-2 font-bold"
          >
            Year
          </label>
          <input
            type="number"
            id="year"
            name="year"
            value={formState.year}
            onChange={(e) => onUpdateFilter("year", e.target.value)}
            onBlur={(e) => onUpdateFilter("year", e.target.value, true)}
            className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded px-3 py-2 border-[1.5px] border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            placeholder="e.g. 2020"
            min="1900"
            max={new Date().getFullYear() + 1}
            disabled={isLoading}
            aria-label="Vehicle year"
          />
        </div>

        <div>
          <label
            htmlFor="minPrice"
            className="block text-slate-600 dark:text-slate-300 mb-2 font-bold"
          >
            Min Price (JMD)
          </label>
          <input
            type="number"
            id="minPrice"
            name="minPrice"
            value={formState.minPrice}
            onChange={(e) => onUpdateFilter("minPrice", e.target.value)}
            onBlur={(e) => onUpdateFilter("minPrice", e.target.value, true)}
            className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded px-3 py-2 border-[1.5px] border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            placeholder="Minimum price"
            min="0"
            step="1000"
            disabled={isLoading}
            aria-label="Minimum price in Jamaican dollars"
          />
        </div>

        <div>
          <label
            htmlFor="maxPrice"
            className="block text-slate-600 dark:text-slate-300 mb-2 font-bold"
          >
            Max Price (JMD)
          </label>
          <input
            type="number"
            id="maxPrice"
            name="maxPrice"
            value={formState.maxPrice}
            onChange={(e) => onUpdateFilter("maxPrice", e.target.value)}
            onBlur={(e) => onUpdateFilter("maxPrice", e.target.value, true)}
            className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded px-3 py-2 border-[1.5px] border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            placeholder="Maximum price"
            min="0"
            step="1000"
            disabled={isLoading}
            aria-label="Maximum price in Jamaican dollars"
          />
        </div>

        <div>
          <label
            htmlFor="bank"
            className="block text-slate-600 dark:text-slate-300 mb-2 font-bold"
          >
            Bank
          </label>
          <select
            id="bank"
            name="bank"
            value={formState.bank}
            onChange={(e) => onUpdateFilter("bank", e.target.value)}
            className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded px-3 py-2 border-[1.5px] border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            disabled={isLoading}
            aria-label="Select bank"
          >
            <option value="">All Banks</option>
            <option value="NCB">NCB</option>
            <option value="CIBC">CIBC</option>
            <option value="JMMB">JMMB</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="color"
            className="block text-slate-600 dark:text-slate-300 mb-2 font-bold"
          >
            Color
          </label>
          <select
            id="color"
            name="color"
            value={formState.color}
            onChange={(e) => onUpdateFilter("color", e.target.value)}
            className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded px-3 py-2 border-[1.5px] border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            disabled={isLoading}
            aria-label="Select vehicle color"
          >
            <option value="">All Colors</option>
            <option value="Black">Black</option>
            <option value="White">White</option>
            <option value="Red">Red</option>
            <option value="Blue">Blue</option>
            <option value="Green">Green</option>
            <option value="Yellow">Yellow</option>
            <option value="Orange">Orange</option>
            <option value="Purple">Purple</option>
            <option value="Gray">Gray</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex gap-2 justify-end">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={isLoading}
          aria-label={isLoading ? "Applying filters..." : "Apply filters"}
        >
          {isLoading ? "Applying..." : "Apply All Filters"}
        </button>
        <button
          type="button"
          onClick={onClear}
          className="bg-slate-200 dark:bg-slate-700 text-gray-900 dark:text-white px-4 py-2 rounded hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={isLoading}
          aria-label="Clear all filters"
        >
          Clear All Filters
        </button>
      </div>
    </form>
  );
}
