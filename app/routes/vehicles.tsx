import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { FilterSection } from "~/vehicles/components/VehicleFilters/FilterSection";
import { VehicleGridResponsive } from "~/vehicles/components/VehicleGrid/VehicleGridResponsive";
import { useVehicleFiltering } from "~/hooks/useVehicleFiltering";
import { Badge } from "~/shadcn/ui/Badge";
import { Separator } from "~/shadcn/ui/Separator";

export const meta: MetaFunction = () => {
  return [
    { title: "Browse Vehicles | Caribbean Vehicle Listings" },
    {
      name: "description",
      content: "Find repossessed vehicles from banks across the Caribbean with advanced filtering and market insights.",
    },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Basic loader - main data comes from Convex queries
  return json({
    timestamp: Date.now(),
  });
};

export default function VehiclesPage() {
  const {
    filterState,
    filterOptions,
    filteredListingIds,
    filteredListings,
    isFiltering,
    activeFiltersCount,
    handleFilterChange,
    clearFilters,
    applyFilters,
  } = useVehicleFiltering();

  const resultCount = filteredListingIds.length;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Find Your Perfect Vehicle
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Browse repossessed vehicles from trusted Caribbean banks with advanced filtering 
          and real-time market insights to help you make informed decisions.
        </p>
      </div>

      {/* Filters */}
      <FilterSection
        filterState={filterState}
        filterOptions={filterOptions}
        isLoading={isFiltering}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onApplyFilters={applyFilters}
        className="sticky top-4 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      />

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold">
            Search Results
          </h2>
          <Badge variant="secondary" className="px-3 py-1">
            {isFiltering ? "Filtering..." : `${resultCount} vehicles`}
          </Badge>
          {activeFiltersCount > 0 && (
            <Badge variant="outline" className="px-3 py-1">
              {activeFiltersCount} active filters
            </Badge>
          )}
        </div>

        {/* Sort Options - Future Enhancement */}
        <div className="text-sm text-muted-foreground">
          Sorted by relevance
        </div>
      </div>

      <Separator />

      {/* Results Grid */}
      <VehicleGridResponsive
        listings={filteredListings}
        isLoading={isFiltering}
        emptyStateMessage={
          activeFiltersCount > 0
            ? "No vehicles match your current filters. Try adjusting your search criteria."
            : "No vehicles are currently available. Check back soon for new listings."
        }
      />

      {/* Load More - Future Enhancement */}
      {resultCount > 0 && (
        <div className="text-center pt-8">
          <p className="text-muted-foreground">
            Showing all {resultCount} results
          </p>
        </div>
      )}
    </div>
  );
}