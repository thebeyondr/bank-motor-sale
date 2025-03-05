import { Link, useSearchParams } from "react-router";
import type { Route } from "./+types/_index";
import { getVehicles } from "~/utils/db";
import type { VehicleFilters } from "~/utils/db";
import React from "react";

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
    bank: searchParams.bank,
  };

  const vehicles = await getVehicles(filters);
  return { vehicles };
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { vehicles } = loaderData;

  // Local state for form inputs
  const [formState, setFormState] = React.useState({
    make: searchParams.get("make") || "",
    model: searchParams.get("model") || "",
    year: searchParams.get("year") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    bank: searchParams.get("bank") || "",
  });

  // Update form state without applying filters
  const updateFormState = (key: string, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  // Apply filters from form state
  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    Object.entries(formState).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams);
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
    setSearchParams(newParams);
  };

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
              className="w-full bg-slate-700 text-white rounded px-3 py-2"
              placeholder="e.g. Toyota"
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
              className="w-full bg-slate-700 text-white rounded px-3 py-2"
              placeholder="e.g. Corolla"
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
              className="w-full bg-slate-700 text-white rounded px-3 py-2"
              placeholder="e.g. 2020"
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
              className="w-full bg-slate-700 text-white rounded px-3 py-2"
              placeholder="Minimum price"
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
              className="w-full bg-slate-700 text-white rounded px-3 py-2"
              placeholder="Maximum price"
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
              className="w-full bg-slate-700 text-white rounded px-3 py-2"
            >
              <option value="">All Banks</option>
              <option value="NCB">NCB</option>
              <option value="CIBC">CIBC</option>
              <option value="JMMB">JMMB</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex gap-2 justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Apply Filters
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
              });
              setSearchParams(new URLSearchParams());
            }}
            className="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-600"
          >
            Clear Filters
          </button>
        </div>
      </form>

      {/* Active Filters */}
      {(searchParams.get("make") ||
        searchParams.get("model") ||
        searchParams.get("year") ||
        searchParams.get("minPrice") ||
        searchParams.get("maxPrice") ||
        searchParams.get("bank")) && (
        <div className="mb-6">
          <h3 className="text-slate-300 mb-2">Active filters:</h3>
          <div className="flex flex-wrap gap-2">
            {searchParams.get("make") && (
              <button
                onClick={() => removeFilter("make")}
                className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full flex items-center gap-2 hover:bg-blue-600/30"
              >
                Make: {searchParams.get("make")}
                <span className="text-lg">×</span>
              </button>
            )}
            {searchParams.get("model") && (
              <button
                onClick={() => removeFilter("model")}
                className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full flex items-center gap-2 hover:bg-blue-600/30"
              >
                Model: {searchParams.get("model")}
                <span className="text-lg">×</span>
              </button>
            )}
            {searchParams.get("year") && (
              <button
                onClick={() => removeFilter("year")}
                className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full flex items-center gap-2 hover:bg-blue-600/30"
              >
                Year: {searchParams.get("year")}
                <span className="text-lg">×</span>
              </button>
            )}
            {searchParams.get("minPrice") && (
              <button
                onClick={() => removeFilter("minPrice")}
                className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full flex items-center gap-2 hover:bg-blue-600/30"
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
                className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full flex items-center gap-2 hover:bg-blue-600/30"
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
                className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full flex items-center gap-2 hover:bg-blue-600/30"
              >
                Bank: {searchParams.get("bank")}
                <span className="text-lg">×</span>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <Link
            to={`/vehicle/${vehicle.id}`}
            key={vehicle.id}
            className="bg-slate-800 shadow-md rounded-lg p-6"
          >
            <h2 className="text-lg font-bold mb-2 text-white">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h2>
            <p className="text-slate-300 mb-2 flex items-center">
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
                  }[vehicle.color] || "bg-slate-300"
                }`}
              ></span>
              {vehicle.color === "Unknown"
                ? "Color undisclosed"
                : vehicle.color}
            </p>
            <p className="text-slate-100 mb-2 text-lg">
              {Object.entries(vehicle.pricesBySource).map(
                ([key, priceBySource]) => (
                  <p key={key}>
                    🏦 {priceBySource.source} |{" "}
                    {priceBySource.price
                      ? `💰 ${Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "JMD",
                          currencySign: "standard",
                          maximumFractionDigits: 0,
                        }).format(priceBySource.price)}`
                      : "Price undisclosed"}
                  </p>
                )
              )}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
