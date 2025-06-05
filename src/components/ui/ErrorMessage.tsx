import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ErrorState } from "@/types";

interface Props extends ErrorState {
  onDismiss?: () => void;
  className?: string;
}

export function ErrorMessage({ type, message, dismissible = true, onDismiss, className }: Props) {
  const icons = {
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };
  const styles = {
    error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200",
    warning:
      "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200",
    info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200"
  };
  const Icon = icons[type];

  return (
    <div
      className={cn(
        "flex items-start gap-2 sm:gap-3 border rounded-lg transition-colors",
        // Mobile-first responsive padding
        "p-3 sm:p-4",
        styles[type],
        className
      )}
      role="alert"
    >
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0 mt-0.5">
        <p className="text-xs sm:text-sm font-medium leading-relaxed break-words">{message}</p>
      </div>
      {dismissible && onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          className={cn(
            "flex-shrink-0 hover:bg-black/5 dark:hover:bg-white/5",
            // Mobile-friendly touch target
            "h-7 w-7 sm:h-6 sm:w-6"
          )}
          aria-label="Dismiss"
        >
          <X className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      )}
    </div>
  );
}
