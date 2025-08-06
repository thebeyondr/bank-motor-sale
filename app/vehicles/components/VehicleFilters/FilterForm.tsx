import React, { useState } from "react";
import type { FormState } from "~/types/filters";
import { useBankMappings } from "~/hooks/useBankMappings";
import { SearchSuggestions } from "~/components/SearchSuggestions";
import { Input } from "~/shadcn/ui/Input";
import { Label } from "~/shadcn/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/shadcn/ui/Select";
import { Button } from "~/shadcn/ui/Button";
import { Car, Palette, Calendar, DollarSign, Star } from "lucide-react";

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
  const { bankIds } = useBankMappings();
  const [showMakeSuggestions, setShowMakeSuggestions] = useState(false);
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);
  return (
    <form onSubmit={onSubmit} aria-label="Vehicle search filters">
      <div
        className="w-full flex gap-3 flex-wrap justify-center"
        role="group"
        aria-label="Filter options"
      >
        <div className="relative">
          <Label
            htmlFor="make"
            className="mb-2 flex items-center gap-2 font-medium"
          >
            <Car className="w-4 h-4" /> Make
          </Label>
          <Input
            id="make"
            value={formState.make}
            onChange={(e) => onUpdateFilter("make", e.target.value)}
            onFocus={() => setShowMakeSuggestions(true)}
            onBlur={(e) => {
              onUpdateFilter("make", e.target.value, true);
              setTimeout(() => setShowMakeSuggestions(false), 150);
            }}
            placeholder="e.g. Toyota"
            disabled={isLoading}
            aria-label="Vehicle make"
            className="max-w-sm"
          />
          <SearchSuggestions
            value={formState.make}
            onSelect={(value) => {
              onUpdateFilter("make", value, true);
              setShowMakeSuggestions(false);
            }}
            type="make"
            isVisible={showMakeSuggestions}
            onClose={() => setShowMakeSuggestions(false)}
          />
        </div>

        <div className="relative">
          <Label
            htmlFor="model"
            className="mb-2 flex items-center gap-2 font-medium"
          >
            <Car className="w-4 h-4" /> Model
          </Label>
          <Input
            id="model"
            value={formState.model}
            onChange={(e) => onUpdateFilter("model", e.target.value)}
            onFocus={() => setShowModelSuggestions(true)}
            onBlur={(e) => {
              onUpdateFilter("model", e.target.value, true);
              setTimeout(() => setShowModelSuggestions(false), 150);
            }}
            placeholder="e.g. Corolla"
            disabled={isLoading}
            aria-label="Vehicle model"
            className="max-w-sm"
          />
          <SearchSuggestions
            value={formState.model}
            onSelect={(value) => {
              onUpdateFilter("model", value, true);
              setShowModelSuggestions(false);
            }}
            type="model"
            isVisible={showModelSuggestions}
            onClose={() => setShowModelSuggestions(false)}
          />
        </div>

        <div>
          <Label
            htmlFor="year"
            className="mb-2 flex items-center gap-2 font-medium"
          >
            <Calendar className="w-4 h-4" /> Year
          </Label>
          <Input
            type="number"
            id="year"
            value={formState.year}
            onChange={(e) => onUpdateFilter("year", e.target.value)}
            onBlur={(e) => onUpdateFilter("year", e.target.value, true)}
            placeholder="e.g. 2020"
            min="1900"
            max={new Date().getFullYear() + 1}
            disabled={isLoading}
            aria-label="Vehicle year"
            className="w-28"
          />
        </div>

        <div>
          <Label
            htmlFor="minPrice"
            className="mb-2 flex items-center gap-2 font-medium"
          >
            <DollarSign className="w-4 h-4" /> Min Price (JMD)
          </Label>
          <Input
            type="number"
            id="minPrice"
            value={formState.minPrice}
            onChange={(e) => onUpdateFilter("minPrice", e.target.value)}
            onBlur={(e) => onUpdateFilter("minPrice", e.target.value, true)}
            placeholder="Minimum price"
            min="0"
            step="1000"
            disabled={isLoading}
            aria-label="Minimum price in Jamaican dollars"
            className="max-w-sm"
          />
        </div>

        <div>
          <Label
            htmlFor="maxPrice"
            className="mb-2 flex items-center gap-2 font-medium"
          >
            <DollarSign className="w-4 h-4" /> Max Price (JMD)
          </Label>
          <Input
            type="number"
            id="maxPrice"
            value={formState.maxPrice}
            onChange={(e) => onUpdateFilter("maxPrice", e.target.value)}
            onBlur={(e) => onUpdateFilter("maxPrice", e.target.value, true)}
            placeholder="Maximum price"
            min="0"
            step="1000"
            disabled={isLoading}
            aria-label="Maximum price in Jamaican dollars"
          />
        </div>
        <div>
          <Label
            htmlFor="color"
            className="mb-2 flex items-center gap-2 font-medium"
          >
            <Palette className="w-4 h-4" /> Color
          </Label>
          <Select
            value={formState.color}
            onValueChange={(value: string) => onUpdateFilter("color", value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Colors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Colors</SelectItem>
              <SelectItem value="Black">Black</SelectItem>
              <SelectItem value="White">White</SelectItem>
              <SelectItem value="Red">Red</SelectItem>
              <SelectItem value="Blue">Blue</SelectItem>
              <SelectItem value="Green">Green</SelectItem>
              <SelectItem value="Yellow">Yellow</SelectItem>
              <SelectItem value="Orange">Orange</SelectItem>
              <SelectItem value="Purple">Purple</SelectItem>
              <SelectItem value="Gray">Gray</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label
            htmlFor="condition"
            className="mb-2 flex items-center gap-2 font-medium"
          >
            <Star className="w-4 h-4" /> Condition
          </Label>
          <Select
            value={formState.condition}
            onValueChange={(value: string) =>
              onUpdateFilter("condition", value)
            }
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Conditions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              <SelectItem value="Excellent">Excellent</SelectItem>
              <SelectItem value="Good">Good</SelectItem>
              <SelectItem value="Fair">Fair</SelectItem>
              <SelectItem value="Unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="link"
          type="button"
          className="text-blue-500 hover:text-blue-600 text-base self-center"
          onClick={onClear}
          disabled={isLoading}
          aria-label="Reset filters"
        >
          Reset filters
        </Button>
      </div>

      <section className="flex flex-row gap-2 overflow-x-auto my-3 justify-center">
        {Object.entries(bankIds).map(([name, id]) => (
          <button
            key={id}
            onClick={() =>
              onUpdateFilter("bank", name === formState.bank ? "" : name)
            }
            className={`flex flex-col items-center justify-between gap-3 px-3 py-2 md:px-5 rounded-lg cursor-pointer border-3 border-blue-100 hover:border-blue-300 ${
              name === formState.bank ? "border-blue-500" : "border-blue-100"
            }`}
          >
            <div className="relative w-20 h-10 flex items-center justify-center">
              <img
                src={`/bank-logos/${name.toLowerCase()}-logo.png`}
                alt={name}
                className={`w-auto h-8 object-contain`}
              />
            </div>
            <p className="text-sm">{name}</p>
          </button>
        ))}
      </section>
    </form>
  );
}
