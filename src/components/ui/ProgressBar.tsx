import { cn } from "@/lib/utils";

interface Props {
  progress: number; // 0-100
  className?: string;
  size?: "small" | "medium" | "large";
  showPercentage?: boolean;
}

export function ProgressBar({ progress, className, size = "medium", showPercentage = true }: Props) {
  const sizeClasses = {
    small: "h-1",
    medium: "h-2",
    large: "h-3"
  };
  const clampedProgress = Math.min(100, Math.max(0, progress)); // Ensure progress is between 0 and 100

  return (
    <div className={cn("w-full", className)}>
      {showPercentage && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-muted-foreground">Progress</span>
          <span className="text-sm font-medium text-foreground">{Math.round(clampedProgress)}%</span>
        </div>
      )}

      <div className={cn("w-full bg-secondary rounded-full overflow-hidden", sizeClasses[size])}>
        <div
          className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progress: ${Math.round(clampedProgress)}%`}
        />
      </div>
    </div>
  );
}
