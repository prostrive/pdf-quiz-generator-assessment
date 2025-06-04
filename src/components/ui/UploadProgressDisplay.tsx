import { AlertCircle, CheckCircle, Clock, Loader2, Upload } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";
import { UploadProgress } from "@/types";

interface Props {
  progress: UploadProgress;
  fileName?: string;
  fileSize?: number;
  uploadSpeed?: number;
  timeRemaining?: number;
  className?: string;
}

export function UploadProgressDisplay({ progress, fileName, fileSize, uploadSpeed, timeRemaining, className }: Props) {
  const getPhaseIcon = () => {
    switch (progress.phase) {
      case "uploading":
        return <Upload className="w-5 h-5 text-blue-500 animate-pulse" />;

      case "processing":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;

      case "complete":
        return <CheckCircle className="w-5 h-5 text-green-500" />;

      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;

      default:
        return <Upload className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getPhaseColor = () => {
    switch (progress.phase) {
      case "uploading":
      case "processing":
        return "text-blue-600";

      case "complete":
        return "text-green-600";

      case "error":
        return "text-red-600";

      default:
        return "text-muted-foreground";
    }
  };

  const getProgressBarVariant = () => {
    switch (progress.phase) {
      case "uploading":
      case "processing":
        return "default";

      case "complete":
        return "success";

      case "error":
        return "error";

      default:
        return "default";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatUploadSpeed = (bytesPerSecond: number) => {
    if (bytesPerSecond < 1024) return `${Math.floor(bytesPerSecond)} B/s`;

    if (bytesPerSecond < 1024 * 1024) return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;

    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
  };

  const formatTimeRemaining = (seconds: number) => {
    if (seconds < 60) return `${Math.ceil(seconds)}s remaining`;

    if (seconds < 3600) {
      const minutes = Math.ceil(seconds / 60);

      return `${minutes}m remaining`;
    }

    const hours = Math.ceil(seconds / 3600);

    return `${hours}h remaining`;
  };

  if (progress.phase === "idle") return null;

  return (
    <div className={cn("bg-muted/50 rounded-lg p-4 space-y-4", className)}>
      {/* Header with file info */}
      {fileName && (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">{getPhaseIcon()}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{fileName}</p>
            {fileSize && <p className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</p>}
          </div>
        </div>
      )}

      {/* Progress bar */}
      <ProgressBar progress={progress.progress} variant={getProgressBarVariant()} showPercentage />

      {/* Status message and details */}
      <div className="space-y-2">
        <p className={cn("text-sm font-medium", getPhaseColor())}>{progress.message}</p>

        {/* Upload/Processing details */}
        {(progress.phase === "uploading" || progress.phase === "processing") && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {uploadSpeed && (
              <div className="flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>{formatUploadSpeed(uploadSpeed)}</span>
              </div>
            )}

            {timeRemaining && timeRemaining !== Infinity && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatTimeRemaining(timeRemaining)}</span>
              </div>
            )}
          </div>
        )}

        {/* Completion message */}
        {progress.phase === "complete" && <p className="text-xs text-green-600">✓ Ready for processing</p>}

        {/* Error state */}
        {progress.phase === "error" && <p className="text-xs text-red-600">Upload failed. Please try again.</p>}
      </div>
    </div>
  );
}
