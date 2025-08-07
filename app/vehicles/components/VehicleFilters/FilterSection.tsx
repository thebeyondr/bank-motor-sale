import React, { useState } from "react";
import { Button } from "~/shadcn/ui/Button";
import { 
  Card,
  CardContent,
  CardDescription, 
  CardHeader,
  CardTitle
} from "~/shadcn/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/shadcn/ui/Select";
import { Input } from "~/shadcn/ui/Input";
import { Label } from "~/shadcn/ui/Label";
import { Badge } from "~/shadcn/ui/Badge";
import { X, Filter, Search, DollarSign, Calendar, Car, Palette, Star } from "lucide-react";

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

export interface FilterOptions {
  makes: string[];
  models: string[];
  years: number[];
  colors: string[];
  conditions: string[];
  bodyTypes: string[];
  driveTrains: string[];
  fuelTypes: string[];
}

interface FilterSectionProps {
  filterState: FilterState;
  filterOptions: FilterOptions;
  isLoading?: boolean;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  className?: string;
}

export function FilterSection({
  filterState,
  filterOptions,
  isLoading = false,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
  className = "",
}: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Count active filters
  const activeFiltersCount = Object.entries(filterState).filter(
    ([key, value]) => value && value !== "all" && value !== ""
  ).length;

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-lg">Filter Vehicles</CardTitle>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm"
            >
              {isExpanded ? "Show Less" : "Show More"}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-destructive hover:text-destructive"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          Find the perfect vehicle with advanced filtering options
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Primary Filters - Always Visible */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Make */}
          <div className="space-y-2">
            <Label htmlFor="make" className="flex items-center gap-2 text-sm font-medium">
              <Car className="h-3 w-3" />
              Make
            </Label>
            <Select
              value={filterState.make}
              onValueChange={(value) => onFilterChange("make", value)}
              disabled={isLoading}
            >
              <SelectTrigger id="make">
                <SelectValue placeholder="Any Make" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Make</SelectItem>
                {filterOptions.makes.map((make) => (
                  <SelectItem key={make} value={make}>
                    {make}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model */}
          <div className="space-y-2">
            <Label htmlFor="model" className="flex items-center gap-2 text-sm font-medium">
              <Car className="h-3 w-3" />
              Model
            </Label>
            <Select
              value={filterState.model}
              onValueChange={(value) => onFilterChange("model", value)}
              disabled={isLoading || !filterState.make}
            >
              <SelectTrigger id="model">
                <SelectValue placeholder="Any Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Model</SelectItem>
                {filterOptions.models.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year */}
          <div className="space-y-2">
            <Label htmlFor="year" className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-3 w-3" />
              Year
            </Label>
            <Select
              value={filterState.year}
              onValueChange={(value) => onFilterChange("year", value)}
              disabled={isLoading}
            >
              <SelectTrigger id="year">
                <SelectValue placeholder="Any Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Year</SelectItem>
                {filterOptions.years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Apply/Clear Buttons */}
          <div className="flex items-end gap-2">
            <Button
              onClick={onApplyFilters}
              disabled={isLoading}
              className="flex-1 gap-2"
            >
              <Search className="h-4 w-4" />
              Apply
            </Button>
          </div>
        </div>

        {/* Secondary Filters - Collapsible */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            {/* Price Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minPrice" className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="h-3 w-3" />
                  Min Price (JMD)
                </Label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="0"
                  value={filterState.minPrice}
                  onChange={(e) => onFilterChange("minPrice", e.target.value)}
                  disabled={isLoading}
                  min="0"
                  step="10000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPrice" className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="h-3 w-3" />
                  Max Price (JMD)
                </Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="10,000,000"
                  value={filterState.maxPrice}
                  onChange={(e) => onFilterChange("maxPrice", e.target.value)}
                  disabled={isLoading}
                  min="0"
                  step="10000"
                />
              </div>
            </div>

            {/* Color and Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color" className="flex items-center gap-2 text-sm font-medium">
                  <Palette className="h-3 w-3" />
                  Color
                </Label>
                <Select
                  value={filterState.color}
                  onValueChange={(value) => onFilterChange("color", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="color">
                    <SelectValue placeholder="Any Color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Color</SelectItem>
                    {filterOptions.colors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition" className="flex items-center gap-2 text-sm font-medium">
                  <Star className="h-3 w-3" />
                  Condition
                </Label>
                <Select
                  value={filterState.condition}
                  onValueChange={(value) => onFilterChange("condition", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="condition">
                    <SelectValue placeholder="Any Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Condition</SelectItem>
                    {filterOptions.conditions.map((condition) => (
                      <SelectItem key={condition} value={condition}>
                        {condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {Object.entries(filterState)
              .filter(([key, value]) => value && value !== "all" && value !== "")
              .map(([key, value]) => (
                <Badge
                  key={key}
                  variant="secondary"
                  className="flex items-center gap-1 px-2 py-1 text-xs"
                >
                  {key === "minPrice" && "Min: $"}
                  {key === "maxPrice" && "Max: $"}
                  {value}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => onFilterChange(key as keyof FilterState, "")}
                  />
                </Badge>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}