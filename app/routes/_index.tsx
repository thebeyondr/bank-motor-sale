import React from "react";
import { Link, useSearchParams, useNavigation } from "react-router";
import type { VehicleFilters } from "~/utils/db";
import { getVehicles } from "~/utils/db";
import type { Route } from "./+types/_index";

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

// Skeleton loader component
function VehicleCardSkeleton() {
  return (
    <div className="bg-slate-800 shadow-md rounded-lg p-6 animate-pulse">
      <div className="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        <div className="h-4 bg-slate-700 rounded w-2/3"></div>
      </div>
      <div className="space-y-2">
        <div className="h-5 bg-slate-700 rounded w-3/4"></div>
        <div className="h-5 bg-slate-700 rounded w-2/3"></div>
      </div>
    </div>
  );
}

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

  // Local state for form inputs
  const [formState, setFormState] = React.useState({
    make: searchParams.get("make") || "",
    model: searchParams.get("model") || "",
    year: searchParams.get("year") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    bank: searchParams.get("bank") || "",
    color: searchParams.get("color") || "",
  });

  // Track if we're in a batch update
  const [isBatchUpdate, setIsBatchUpdate] = React.useState(false);

  // Update form state and trigger URL update
  const updateFormState = (
    key: string,
    value: string,
    isBlur: boolean = false
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }));

    // Only update URL params on blur for text/number inputs
    // Update immediately for dropdowns
    if (!isBatchUpdate && (isBlur || key === "bank" || key === "color")) {
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
      setSearchParams(newParams, { replace: true });
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
    // Reset batch update flag after a short delay
    setTimeout(() => setIsBatchUpdate(false), 100);
  };

  // Remove a single filter and reapply
  const removeFilter = (key: string) => {
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

  const isLoading = navigation.state === "loading";

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-4 text-white">
        Bankomoto - Find Your Next Vehicle
      </h2>
      <p className="text-slate-300 mb-4">
        Find your next vehicle from the repossessed bank inventory
      </p>

      <form
        onSubmit={applyFilters}
        className="bg-slate-800 p-6 rounded-lg mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="make" className="block text-slate-300 mb-2">
              Make
            </label>
            <input
              type="text"
              id="make"
              name="make"
              value={formState.make}
              onChange={(e) => updateFormState("make", e.target.value)}
              onBlur={(e) => updateFormState("make", e.target.value, true)}
              className="w-full bg-slate-700 text-white rounded px-3 py-2"
              placeholder="e.g. Toyota"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="model" className="block text-slate-300 mb-2">
              Model
            </label>
            <input
              type="text"
              id="model"
              name="model"
              value={formState.model}
              onChange={(e) => updateFormState("model", e.target.value)}
              onBlur={(e) => updateFormState("model", e.target.value, true)}
              className="w-full bg-slate-700 text-white rounded px-3 py-2"
              placeholder="e.g. Corolla"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="year" className="block text-slate-300 mb-2">
              Year
            </label>
            <input
              type="number"
              id="year"
              name="year"
              value={formState.year}
              onChange={(e) => updateFormState("year", e.target.value)}
              onBlur={(e) => updateFormState("year", e.target.value, true)}
              className="w-full bg-slate-700 text-white rounded px-3 py-2"
              placeholder="e.g. 2020"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="minPrice" className="block text-slate-300 mb-2">
              Min Price (JMD)
            </label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              value={formState.minPrice}
              onChange={(e) => updateFormState("minPrice", e.target.value)}
              onBlur={(e) => updateFormState("minPrice", e.target.value, true)}
              className="w-full bg-slate-700 text-white rounded px-3 py-2"
              placeholder="Minimum price"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="maxPrice" className="block text-slate-300 mb-2">
              Max Price (JMD)
            </label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={formState.maxPrice}
              onChange={(e) => updateFormState("maxPrice", e.target.value)}
              onBlur={(e) => updateFormState("maxPrice", e.target.value, true)}
              className="w-full bg-slate-700 text-white rounded px-3 py-2"
              placeholder="Maximum price"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="bank" className="block text-slate-300 mb-2">
              Bank
            </label>
            <select
              id="bank"
              name="bank"
              value={formState.bank}
              onChange={(e) => updateFormState("bank", e.target.value)}
              onBlur={(e) => updateFormState("bank", e.target.value, true)}
              className="w-full bg-slate-700 text-white rounded px-3 py-2"
              disabled={isLoading}
            >
              <option value="">All Banks</option>
              <option value="NCB">NCB</option>
              <option value="CIBC">CIBC</option>
              <option value="JMMB">JMMB</option>
            </select>
          </div>
          <div>
            <label htmlFor="color" className="block text-slate-300 mb-2">
              Color
            </label>
            <select
              id="color"
              name="color"
              value={formState.color}
              onChange={(e) => updateFormState("color", e.target.value)}
              onBlur={(e) => updateFormState("color", e.target.value, true)}
              className="w-full bg-slate-700 text-white rounded px-3 py-2"
              disabled={isLoading}
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
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Applying..." : "Apply All Filters"}
          </button>
          <button
            type="button"
            onClick={() => {
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
            }}
            className="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Clear All Filters
          </button>
        </div>
      </form>

      {/* Active Filters */}
      {(searchParams.get("make") ||
        searchParams.get("model") ||
        searchParams.get("year") ||
        searchParams.get("minPrice") ||
        searchParams.get("maxPrice") ||
        searchParams.get("bank") ||
        searchParams.get("color")) && (
        <div className="mb-6">
          <h3 className="text-slate-300 mb-2">Active filters:</h3>
          <div className="flex flex-wrap gap-2">
            {searchParams.get("make") && (
              <button
                onClick={() => removeFilter("make")}
                className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full flex items-center gap-2 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Make: {searchParams.get("make")}
                <span className="text-lg">×</span>
              </button>
            )}
            {searchParams.get("model") && (
              <button
                onClick={() => removeFilter("model")}
                className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full flex items-center gap-2 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Model: {searchParams.get("model")}
                <span className="text-lg">×</span>
              </button>
            )}
            {searchParams.get("year") && (
              <button
                onClick={() => removeFilter("year")}
                className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full flex items-center gap-2 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Year: {searchParams.get("year")}
                <span className="text-lg">×</span>
              </button>
            )}
            {searchParams.get("minPrice") && (
              <button
                onClick={() => removeFilter("minPrice")}
                className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full flex items-center gap-2 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Min Price:{" "}
                {Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "JMD",
                  maximumFractionDigits: 0,
                }).format(Number(searchParams.get("minPrice")))}
                <span className="text-lg">×</span>
              </button>
            )}
            {searchParams.get("maxPrice") && (
              <button
                onClick={() => removeFilter("maxPrice")}
                className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full flex items-center gap-2 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Max Price:{" "}
                {Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "JMD",
                  maximumFractionDigits: 0,
                }).format(Number(searchParams.get("maxPrice")))}
                <span className="text-lg">×</span>
              </button>
            )}
            {searchParams.get("bank") && (
              <button
                onClick={() => removeFilter("bank")}
                className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full flex items-center gap-2 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Bank: {searchParams.get("bank")}
                <span className="text-lg">×</span>
              </button>
            )}
            {searchParams.get("color") && (
              <button
                onClick={() => removeFilter("color")}
                className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full flex items-center gap-2 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Color: {searchParams.get("color")}
                <span className="text-lg">×</span>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Show skeleton loaders while loading
          <>
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
          </>
        ) : vehicles.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-300 text-lg">
              No vehicles found matching your criteria
            </p>
          </div>
        ) : (
          vehicles.map((vehicle) => (
            <Link
              to={`/vehicle/${vehicle.id}`}
              key={vehicle.id}
              className="bg-slate-800 shadow-md rounded-lg p-6 hover:bg-slate-750 transition-colors"
            >
              <h2 className="text-lg font-bold mb-2 text-white">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h2>
              <p className="text-slate-300 mb-2">
                {vehicle.prices.map((price) => (
                  <p key={price.id} className="flex items-center">
                    <span
                      className={`h-4 w-4 mr-2 inline-block rounded-full border border-slate-300 ${
                        {
                          Unknown: "bg-gray-700",
                          Black: "bg-black",
                          White: "bg-white",
                          Red: "bg-red-500",
                          Blue: "bg-blue-500",
                          Green: "bg-green-500",
                          Yellow: "bg-yellow-500",
                          Orange: "bg-orange-500",
                          Purple: "bg-purple-500",
                          Gray: "bg-gray-500",
                        }[price.color || "Unknown"] || "bg-slate-300"
                      }`}
                    ></span>
                    {price.color === "Unknown"
                      ? "Color undisclosed"
                      : price.color}
                  </p>
                ))}
              </p>
              <p className="text-slate-100 mb-2 text-lg">
                {vehicle.prices.map((price) => (
                  <p key={price.id}>
                    🏦 {BANK_NAMES[price.bankId]} |{" "}
                    {price.price
                      ? `💰 ${Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "JMD",
                          currencySign: "standard",
                          maximumFractionDigits: 0,
                        }).format(price.price)}`
                      : "Price undisclosed"}
                    {price.amount > 1 && ` (${price.amount} available)`}
                  </p>
                ))}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
