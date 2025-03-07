import { Popover, PopoverContent, PopoverTrigger } from "~/shadcn/ui/Popover";
import { banks } from "data/banks";
import { ChevronDown, EyeIcon, Info } from "lucide-react";

type ViewAndBidDetailsModalProps = {
  bankId: string;
};

export function ViewAndBidDetailsModal({
  bankId,
}: ViewAndBidDetailsModalProps) {
  const bank = banks.find((bank) => bank.id === bankId);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="cursor-pointer flex transition-transform active:translate-y-1 items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
          <EyeIcon className="w-5 h-5" />
          {bank?.name} view &amp; bid details
          <ChevronDown className="w-5 h-5 mt-0.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">{bank?.name}</p>
          <p className="text-sm">{bank?.viewInstructions}</p>
          <p className="text-sm">{bank?.bidInstructions}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
