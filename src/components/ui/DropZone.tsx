import { DragEvent, useState, useRef } from "react";
import { Upload, FileX } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onFileSelect: (file: File) => void;
  className?: string;
  disabled?: boolean;
}

export function DropZone({ onFileSelect, className, disabled = false }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    dragCounterRef.current++;

    // Only set isDragOver to true if we have valid files
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    dragCounterRef.current--;

    // Only set isDragOver to false when we've left the main container
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    // Set dropEffect to indicate this is a valid drop zone
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "copy";
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Reset drag state
    setIsDragOver(false);
    dragCounterRef.current = 0;

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));

    if (pdfFile) {
      onFileSelect(pdfFile);
    }
  };

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-lg transition-all duration-200",
        // Mobile-first responsive padding and sizing
        "p-6 sm:p-8 text-center min-h-[120px] sm:min-h-[140px]",
        // Touch-friendly hover states
        "hover:border-primary/50 hover:bg-muted/25 active:scale-[0.98] sm:active:scale-[1.02]",
        // Enhanced touch feedback
        isDragOver ? "border-primary bg-primary/5 scale-[0.98] sm:scale-[1.02]" : "border-muted-foreground/25",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Drop PDF file here"
    >
      <div className="flex flex-col items-center gap-3 sm:gap-4 pointer-events-none">
        {isDragOver ? (
          <div className="animate-bounce">
            <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
          </div>
        ) : (
          <FileX className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
        )}

        <div className="space-y-1 sm:space-y-2">
          <p
            className={cn(
              "text-base sm:text-lg font-medium leading-tight",
              isDragOver ? "text-primary" : "text-foreground"
            )}
          >
            {isDragOver ? "Drop your PDF here" : "Drag & drop your PDF"}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">Only PDF files are accepted</p>
        </div>
      </div>
      {isDragOver && (
        <div className="absolute inset-0 bg-primary/5 rounded-lg border-2 border-primary border-dashed animate-pulse pointer-events-none" />
      )}
    </div>
  );
}
