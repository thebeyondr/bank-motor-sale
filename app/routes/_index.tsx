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
import type { Id } from "convex/_generated/dataModel";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "LIMBO - Find Your Next Vehicle" },
    {
      name: "description",
      content: "Find your next vehicle from the repossessed bank inventory",
    },
  ];
}

export function ErrorBoundary() {
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

export default function Index() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const isMobile = useIsMobile();
  const [isHydrated, setIsHydrated] = useState(false);

  // Get current user
  const user = useQuery(api.auth.getCurrentUser);
  console.log({ user });

  // Get dynamic bank mappings for filtering
  const { bankIds } = useBankMappings();

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
  const bankParam = searchParams.get("bank");
  const bankId =
    bankParam && bankParam !== "all" && bankIds[bankParam]
      ? bankIds[bankParam]
      : undefined;
  const colorParam = searchParams.get("color");
  const color = colorParam && colorParam !== "all" ? colorParam : undefined;
  const conditionParam = searchParams.get("condition");
  const condition =
    conditionParam && conditionParam !== "all"
      ? (conditionParam as "excellent" | "good" | "fair" | "poor" | "unknown")
      : undefined;

  // Use Convex queries - now using listings with market stats
  const listings = useQuery(api.listings.getListingsWithMarketStats, {
    make,
    model,
    year,
    minPrice,
    maxPrice,
    bankId: bankId as Id<"banks"> | undefined,
    color,
    condition,
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
    condition: searchParams.get("condition") || "",
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

    if (
      !isBatchUpdate &&
      (isBlur || key === "bank" || key === "color" || key === "condition")
    ) {
      const currentValue = searchParams.get(key);
      if (currentValue !== value) {
        const newParams = new URLSearchParams(searchParams);
        if (value === "all" || value === "") {
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
      if (value && value !== "all" && value !== "") {
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
      if (v && v !== "all" && v !== "") {
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
      condition: "",
    });
    setSearchParams(new URLSearchParams());
  };

  const isLoading = navigation.state === "loading" || listings === undefined;
  const isFirstLoad = !listings?.length && navigation.state === "loading";

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <div className={isFirstLoad ? "opacity-60 pointer-events-none" : ""}>
        <h2 className="text-3xl xl:text-5xl font-bold mb-2 tracking-tight">
          LIMBO
        </h2>
        <p className="text-base xl:text-lg mb-6">
          Find your next vehicle from the repossessed bank inventory
        </p>

        {/* Header Actions */}
        <div className="mb-6">
          <AuthLoading>
            <div className="text-sm text-gray-500">Loading...</div>
          </AuthLoading>
          <Unauthenticated>
            <div className="text-sm text-gray-500">
              <a
                href="/dashboard"
                className="text-blue-500 hover:text-blue-600"
              >
                Bank Login →
              </a>
            </div>
          </Unauthenticated>
          <Authenticated>
            {user && (
              <div className="inline-flex items-center gap-4 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
                <div className="text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    Welcome back,{" "}
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
                <a
                  href="/dashboard"
                  className="text-xs text-blue-500 hover:text-blue-600"
                >
                  Dashboard
                </a>
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
          ) : listings?.length === 0 ? (
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
            listings?.map((listing) => (
              <VehicleCard
                key={listing._id}
                listing={{
                  id: listing._id,
                  vehicleId: listing.vehicleId,
                  bankId: listing.bankId,
                  price: listing.price ?? null,
                  mileage: listing.mileage,
                  color: listing.color,
                  condition: (listing.condition as any) || "unknown",
                  images: listing.imageUrls.map((url, index) => ({
                    url,
                    isCover: index === 0,
                    rank: index,
                  })),
                  createdAt: listing._creationTime,
                  vehicle: {
                    id: listing.vehicle._id,
                    make: listing.vehicle.make,
                    model: listing.vehicle.model,
                    year: listing.vehicle.year,
                    slug: listing.vehicle.slug,
                    fuelType: listing.vehicle.fuelType,
                    bodyType: listing.vehicle.bodyType,
                    driveTrain: listing.vehicle.driveTrain,
                    transmission: listing.vehicle.transmission,
                  },
                  bank: {
                    id: listing.bank._id,
                    name: listing.bank.name,
                  },
                  // Market stats
                  medianPrice: listing.medianPrice,
                  priceDelta: listing.priceDelta,
                  sampleSize: listing.sampleSize,
                }}
              />
            ))
          )}
        </section>
      </div>
    </div>
  );
}
