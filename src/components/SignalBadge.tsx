import { SignalType, SIGNAL_CONFIG } from "@/constants/patterns";
import { cn } from "@/lib/utils";

interface SignalBadgeProps {
  signal: SignalType;
  className?: string;
}

export default function SignalBadge({ signal, className }: SignalBadgeProps) {
  const config = SIGNAL_CONFIG[signal];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        config.bgColor,
        config.borderColor,
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}
