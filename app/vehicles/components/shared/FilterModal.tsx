import { banks } from "data/banks";
import { LucideFilter } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/shadcn/ui/Sheet";
import type { FilterFormProps } from "../VehicleFilters/FilterForm";

const FilterModal = ({
  onUpdateFilter,
  formState,
  isLoading,
  onSubmit,
  onClear,
}: FilterFormProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="cursor-pointer transition-transform active:scale-90 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full fixed bottom-2 right-2 z-50">
          <LucideFilter className="w-8 h-8" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[90vh] overflow-y-auto rounded-t-xl"
      >
        <SheetHeader>
          <SheetTitle>Filter Vehicles</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4">
          <section className="flex flex-row gap-2 mt-4">
            {banks.map((bank) => (
              <button
                key={bank.id}
                onClick={() => onUpdateFilter("bank", bank.name)}
                className={`flex flex-col items-center justify-between gap-3 px-3 py-2 md:px-5 rounded-lg cursor-pointer border-3 border-blue-100 hover:border-blue-300 ${
                  bank.name === formState.bank
                    ? "border-blue-500"
                    : "border-blue-100"
                }`}
              >
                <div className="relative w-20 h-10 flex items-center justify-center">
                  <img
                    src={`/bank-logos/${bank.name.toLowerCase()}-logo.png`}
                    alt={bank.name}
                    className={`w-auto h-8 object-contain`}
                  />
                </div>
                <p className="text-sm">{bank.name}</p>
              </button>
            ))}
          </section>
          <div>
            <label
              htmlFor="make"
              className="block text-slate-600 dark:text-slate-300 mb-2 font-semibold text-sm"
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
              className="block text-slate-600 dark:text-slate-300 mb-2 font-semibold text-sm"
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
              className="block text-slate-600 dark:text-slate-300 mb-2 font-semibold text-sm"
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
          <section className="flex flex-row gap-2 mt-4">
            <div>
              <label
                htmlFor="minPrice"
                className="block text-slate-600 dark:text-slate-300 mb-2 font-semibold text-sm"
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

            <div id="maxPrice">
              <label
                htmlFor="maxPrice"
                className="block text-slate-600 dark:text-slate-300 mb-2 font-semibold text-sm"
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
          </section>
          <div>
            <label
              htmlFor="color"
              className="block text-slate-600 dark:text-slate-300 mb-2 font-semibold text-sm"
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
              <option value="Purple">Purple</option>
              <option value="Grey">Grey</option>
            </select>
          </div>
        </div>

        <section className="flex flex-col gap-2 mt-4">
          <SheetClose asChild>
            <button
              className="bg-blue-500 dark:bg-blue-600 w-full text-white px-4 py-3 rounded-lg"
              onClick={(e) => {
                e.preventDefault();
                onSubmit(e);
              }}
            >
              Apply filters
            </button>
          </SheetClose>
          <SheetClose asChild>
            <button
              className="bg-slate-200 dark:bg-slate-700 w-full text-slate-600 dark:text-slate-300 px-4 py-3 rounded-lg"
              onClick={(e) => {
                e.preventDefault();
                onClear();
              }}
            >
              Clear filters
            </button>
          </SheetClose>
        </section>
      </SheetContent>
    </Sheet>
  );
};

export default FilterModal;
