import { SearchX } from "lucide-react";
import { useNavigation, useSearchParams } from "react-router";
import { useIsMobile } from "~/hooks/useMediaQuery";
import type { VehicleFilters } from "~/utils/db";
import { getVehicles } from "~/utils/db";
import { initializeDatabase } from "~/utils/initializeData";
import FilterModal from "~/vehicles/components/shared/FilterModal";
import { VehicleCard } from "~/vehicles/components/VehicleCard";
import { ActiveFilters } from "~/vehicles/components/VehicleFilters/ActiveFilters";
import { FilterForm } from "~/vehicles/components/VehicleFilters/FilterForm";
import type { Route } from "./+types/_index";
import { useEffect, useState } from "react";

// Bank ID to name mapping
const BANK_NAMES: Record<string, string> = {
  "8fc8081e-32cf-4f27-90ec-8e440ea6dcd4": "JMMB",
  "cf984f5d-4bf8-405d-93f4-c518e258f7fe": "NCB",
  "33ff7536-112c-4a40-9b16-a60666ac7d4f": "CIBC",
};

// Bank name to ID mapping
const BANK_IDS: Record<string, string> = {
  JMMB: "8fc8081e-32cf-4f27-90ec-8e440ea6dcd4",
  NCB: "cf984f5d-4bf8-405d-93f4-c518e258f7fe",
  CIBC: "33ff7536-112c-4a40-9b16-a60666ac7d4f",
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Bankomoto - Find Your Next Vehicle" },
    {
      name: "description",
      content: "Find your next vehicle from the repossessed bank inventory",
    },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams);

  const filters: VehicleFilters = {
    make: searchParams.make,
    model: searchParams.model,
    year: searchParams.year ? Number(searchParams.year) : undefined,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    bank: searchParams.bank ? BANK_IDS[searchParams.bank] : undefined,
    color: searchParams.color,
  };

  const vehicles = await getVehicles(filters);
  return { vehicles };
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const { vehicles } = loaderData;
  const isMobile = useIsMobile();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize database
  useEffect(() => {
    const initialize = async () => {
      try {
        const result = await initializeDatabase();
        if (!result.success) {
          setInitError(result.error || "Failed to initialize database");
        }
      } catch (error) {
        setInitError("Unexpected error during initialization");
      } finally {
        setIsInitializing(false);
      }
    };
    initialize();
  }, []);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Local state for form inputs
  const [formState, setFormState] = useState({
    make: searchParams.get("make") || "",
    model: searchParams.get("model") || "",
    year: searchParams.get("year") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    bank: searchParams.get("bank") || "",
    color: searchParams.get("color") || "",
  });

  // Track if we're in a batch update
  const [isBatchUpdate, setIsBatchUpdate] = useState(false);

  // Update form state and trigger URL update
  const updateFormState = (
    key: string,
    value: string,
    isBlur: boolean = false
  ) => {
    if (formState[key as keyof typeof formState] === value) return;

    setFormState((prev) => ({ ...prev, [key]: value }));

    if (!isBatchUpdate && (isBlur || key === "bank" || key === "color")) {
      const currentValue = searchParams.get(key);
      if (currentValue !== value) {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
        setSearchParams(newParams, { replace: true });
      }
    }
  };

  // Apply filters from form state (batch update)
  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBatchUpdate(true);
    const newParams = new URLSearchParams();
    Object.entries(formState).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams, { replace: true });
    setTimeout(() => setIsBatchUpdate(false), 100);
  };

  // Remove a single filter
  const removeFilter = (key: keyof typeof formState) => {
    const newFormState = { ...formState, [key]: "" };
    setFormState(newFormState);

    const newParams = new URLSearchParams();
    Object.entries(newFormState).forEach(([k, v]) => {
      if (v) {
        newParams.set(k, v);
      }
    });
    setSearchParams(newParams, { replace: true });
  };

  const clearAllFilters = () => {
    setFormState({
      make: "",
      model: "",
      year: "",
      minPrice: "",
      maxPrice: "",
      bank: "",
      color: "",
    });
    setSearchParams(new URLSearchParams());
  };

  const isLoading = navigation.state === "loading";
  const isFirstLoad = !vehicles.length && navigation.state === "loading";

  if (isInitializing || initError) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-white dark:bg-gray-950">
        <div className="max-w-md w-full space-y-4 text-center">
          {isInitializing ? (
            <>
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mx-auto" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mx-auto" />
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Loading vehicle database...
              </p>
            </>
          ) : (
            <>
              <div className="text-red-500 dark:text-red-400">
                <span className="text-4xl">⚠️</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Failed to Load Database
              </h2>
              <p className="text-slate-600 dark:text-slate-400">{initError}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className={isFirstLoad ? "opacity-60 pointer-events-none" : ""}>
        <h2 className="text-3xl xl:text-5xl font-bold mb-2 tracking-tight">
          Bankomoto
        </h2>
        <p className="text-base xl:text-lg mb-6">
          Find your next vehicle from the repossessed bank inventory
        </p>

        {isMobile ? (
          <FilterModal
            onUpdateFilter={updateFormState}
            formState={formState}
            isLoading={isLoading}
            onSubmit={applyFilters}
            onClear={clearAllFilters}
            className={isHydrated ? "opacity-100" : "opacity-0"}
          />
        ) : (
          <FilterForm
            formState={formState}
            isLoading={isLoading}
            onUpdateFilter={updateFormState}
            onSubmit={applyFilters}
            onClear={clearAllFilters}
          />
        )}

        <ActiveFilters
          searchParams={searchParams}
          onRemoveFilter={removeFilter}
          isLoading={isLoading}
        />

        {isFirstLoad && (
          <div className="fixed inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
              <p className="mt-4 text-center text-slate-600 dark:text-slate-300">
                Loading vehicles...
              </p>
            </div>
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.length === 0 && !isLoading ? (
            <div className="col-span-full py-12 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <SearchX className="w-12 h-12 mx-auto text-slate-400" />
                <h3 className="text-xl font-semibold">No Vehicles Found</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Try adjusting your filters or clearing them to see more
                  results
                </p>
                <button
                  onClick={clearAllFilters}
                  className="text-blue-500 hover:text-blue-600"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          ) : (
            vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                bankNames={BANK_NAMES}
              />
            ))
          )}
        </section>
      </div>
    </div>
  );
}
