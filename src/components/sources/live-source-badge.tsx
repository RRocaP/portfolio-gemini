import { cn } from "@/lib/utils";

interface LiveSourceBadgeProps {
  connected: boolean;
}

export function LiveSourceBadge({ connected }: LiveSourceBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
        connected
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          connected ? "bg-green-500" : "bg-gray-400"
        )}
      />
      {connected ? "Live" : "Offline"}
    </span>
  );
}
