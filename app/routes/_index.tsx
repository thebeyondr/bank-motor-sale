import { SearchX } from "lucide-react";
import { useNavigation, useSearchParams } from "react-router";
import { useIsMobile } from "~/hooks/useMediaQuery";
import FilterModal from "~/vehicles/components/VehicleFilters/FilterModal";
import { VehicleCard } from "~/vehicles/components/VehicleCard";
import { ActiveFilters } from "~/vehicles/components/VehicleFilters/ActiveFilters";
import { FilterForm } from "~/vehicles/components/VehicleFilters/FilterForm";
import type { Route } from "./+types/_index";
import { useEffect, useState } from "react";
import {
  useQuery,
  Authenticated,
  Unauthenticated,
  AuthLoading,
} from "convex/react";
import { api } from "../../convex/_generated/api";
import { useBankMappings } from "~/hooks/useBankMappings";
import { VehicleGridSkeleton } from "~/components/LoadingSkeleton";
import { authClient } from "~/lib/auth-client";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "LIMBO - Find Your Next Vehicle" },
    {
      name: "description",
      content: "Find your next vehicle from the repossessed bank inventory",
    },
  ];
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="text-red-500 dark:text-red-400">
          <span className="text-4xl">⚠️</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Something went wrong
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          We encountered an error while loading vehicles. Please try refreshing
          the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  // We'll handle data loading in the component with Convex queries
  return {};
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const isMobile = useIsMobile();
  const [isHydrated, setIsHydrated] = useState(false);

  // Get current user
  const user = useQuery(api.auth.getCurrentUser);
  console.log({ user });

  // Get dynamic bank mappings first
  const { bankNames, bankIds } = useBankMappings();

  // Get filter values from URL params
  const make = searchParams.get("make") || undefined;
  const model = searchParams.get("model") || undefined;
  const year = searchParams.get("year")
    ? Number(searchParams.get("year"))
    : undefined;
  const minPrice = searchParams.get("minPrice")
    ? Number(searchParams.get("minPrice"))
    : undefined;
  const maxPrice = searchParams.get("maxPrice")
    ? Number(searchParams.get("maxPrice"))
    : undefined;
  const bankId = searchParams.get("bank")
    ? bankIds[searchParams.get("bank")!]
    : undefined;
  const color = searchParams.get("color") || undefined;

  // Use Convex queries
  const vehicles = useQuery(api.vehicles.getVehicles, {
    make,
    model,
    year,
    minPrice,
    maxPrice,
    bankId,
    color,
  });

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
        if (value === "all") {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
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

  const isLoading = navigation.state === "loading" || vehicles === undefined;
  const isFirstLoad = !vehicles?.length && navigation.state === "loading";

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <div className={isFirstLoad ? "opacity-60 pointer-events-none" : ""}>
        <h2 className="text-3xl xl:text-5xl font-bold mb-2 tracking-tight">
          LIMBO
        </h2>
        <p className="text-base xl:text-lg mb-6">
          Find your next vehicle from the repossessed bank inventory
        </p>

        {/* User Info Section */}
        <div className="mb-6">
          <AuthLoading>
            <div className="text-sm text-gray-500">Loading...</div>
          </AuthLoading>
          <Unauthenticated>
            <div className="text-sm text-gray-500">
              <a
                href="/listings/new"
                className="text-blue-500 hover:text-blue-600"
              >
                Sign in to manage listings
              </a>
            </div>
          </Unauthenticated>
          <Authenticated>
            {user && (
              <div className="inline-flex items-center gap-4 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
                <div className="text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    Signed in as{" "}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {user.name || user.email}
                  </span>
                  {user.role && (
                    <span className="text-gray-500 dark:text-gray-400 ml-2">
                      ({user.role})
                    </span>
                  )}
                </div>
                <button
                  onClick={() => authClient.signOut()}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Sign out
                </button>
              </div>
            )}
          </Authenticated>
        </div>

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

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-5">
          {isLoading ? (
            <VehicleGridSkeleton />
          ) : vehicles?.length === 0 ? (
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
            vehicles?.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={{
                  id: vehicle.id,
                  make: vehicle.make,
                  model: vehicle.model,
                  year: vehicle.year,
                  prices: vehicle.listings.map((listing) => ({
                    id: listing.id,
                    vehicleId: listing.vehicleId,
                    bankId: listing.bankId,
                    price: listing.price,
                    amount: listing.amount,
                    color: listing.color || undefined,
                  })),
                }}
                bankNames={bankNames}
              />
            ))
          )}
        </section>
      </div>
    </div>
  );
}
