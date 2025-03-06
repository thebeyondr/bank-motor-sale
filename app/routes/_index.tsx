import React from "react";
import { useSearchParams, useNavigation } from "react-router";
import type { VehicleFilters } from "~/utils/db";
import { getVehicles } from "~/utils/db";
import type { Route } from "./+types/_index";
import { VehicleTable } from "~/vehicles/components/VehicleTable";
import { FilterForm } from "~/vehicles/components/VehicleFilters/FilterForm";
import { ActiveFilters } from "~/vehicles/components/VehicleFilters/ActiveFilters";

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl xl:text-5xl font-bold mb-2 tracking-tight">
        Bankomoto
      </h2>
      <p className="text-base xl:text-lg mb-6">
        Find your next vehicle from the repossessed bank inventory
      </p>

      <FilterForm
        formState={formState}
        isLoading={isLoading}
        onUpdateFilter={updateFormState}
        onSubmit={applyFilters}
        onClear={clearAllFilters}
      />

      <ActiveFilters
        searchParams={searchParams}
        onRemoveFilter={removeFilter}
        isLoading={isLoading}
      />

      <VehicleTable
        vehicles={vehicles}
        isLoading={isLoading}
        bankNames={BANK_NAMES}
      />
    </div>
  );
}
