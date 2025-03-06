interface ColorIndicatorProps {
  color: string;
  className?: string;
}

const COLOR_MAP: Record<string, string> = {
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
};

export function ColorIndicator({ color, className = "" }: ColorIndicatorProps) {
  return (
    <span
      className={`h-4 w-4 inline-block rounded-full border border-slate-300 ${
        COLOR_MAP[color] || "bg-slate-300"
      } ${className}`}
      role="img"
      aria-label={`Color: ${color}`}
    />
  );
}
