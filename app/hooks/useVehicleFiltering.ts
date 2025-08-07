import { useState, useCallback, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

export interface FilterState {
  make: string;
  model: string;
  year: string;
  minPrice: string;
  maxPrice: string;
  color: string;
  condition: string;
  countryId: string;
  bankId: string;
}

const initialFilterState: FilterState = {
  make: "",
  model: "",
  year: "",
  minPrice: "",
  maxPrice: "",
  color: "",
  condition: "",
  countryId: "",
  bankId: "",
};

export function useVehicleFiltering() {
  const [filterState, setFilterState] = useState<FilterState>(initialFilterState);
  const [isFiltering, setIsFiltering] = useState(false);

  // Get filter options from optimized query
  const filterOptions = useQuery(api.listingFilters.getFilterOptions, {
    countryId: filterState.countryId || undefined,
  });

  // Get filtered listing IDs using the high-performance query
  const filteredListingIds = useQuery(api.listingFilters.getFilteredListingsSimple, {
    make: filterState.make || undefined,
    model: filterState.model || undefined,
    year: filterState.year ? parseInt(filterState.year) : undefined,
    minPrice: filterState.minPrice ? parseFloat(filterState.minPrice) : undefined,
    maxPrice: filterState.maxPrice ? parseFloat(filterState.maxPrice) : undefined,
    color: filterState.color || undefined,
    condition: filterState.condition || undefined,
    countryId: filterState.countryId || undefined,
    bankId: filterState.bankId || undefined,
  });

  // Get full listing details for filtered results
  const filteredListings = useQuery(
    api.listings.getListingsWithMarketStats,
    filteredListingIds && filteredListingIds.length > 0
      ? {
          // We'll use the existing query but with specific filters that match our IDs
          // This is a fallback approach until we create a more optimized query
        }
      : "skip"
  );

  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    setFilterState(prev => ({
      ...prev,
      [key]: value,
      // Clear model when make changes
      ...(key === "make" ? { model: "" } : {}),
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilterState(initialFilterState);
  }, []);

  const applyFilters = useCallback(() => {
    setIsFiltering(true);
    // The filtering happens automatically through Convex reactivity
    // This is mainly for UI state management
    setTimeout(() => setIsFiltering(false), 300);
  }, []);

  // Count active filters
  const activeFiltersCount = Object.entries(filterState).filter(
    ([key, value]) => value && value !== ""
  ).length;

  return {
    filterState,
    filterOptions: filterOptions || {
      makes: [],
      models: [],
      years: [],
      colors: [],
      conditions: [],
      bodyTypes: [],
      driveTrains: [],
      fuelTypes: [],
    },
    filteredListingIds: filteredListingIds || [],
    filteredListings: filteredListings || [],
    isFiltering: isFiltering || !filterOptions,
    activeFiltersCount,
    handleFilterChange,
    clearFilters,
    applyFilters,
  };
}