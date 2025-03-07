import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/shadcn/ui/Sheet";
import { LucideFilter } from "lucide-react";

const FilterModal = () => {
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
          <SheetTitle>Filter</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="price">Price</label>
            <input id="price" type="number" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FilterModal;
