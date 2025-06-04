import { DragEvent, useState } from "react";
import { Upload, FileX } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onFileSelect: (file: File) => void;
  className?: string;
  disabled?: boolean;
}

export function DropZone({ onFileSelect, className, disabled = false }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

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
        "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
        "hover:border-primary/50 hover:bg-muted/25",
        isDragOver ? "border-primary bg-primary/5 scale-[1.02]" : "border-muted-foreground/25",
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
      <div className="flex flex-col items-center gap-4">
        {isDragOver ? (
          <div className="animate-bounce">
            <Upload className="w-12 h-12 text-primary" />
          </div>
        ) : (
          <FileX className="w-12 h-12 text-muted-foreground" />
        )}

        <div className="space-y-2">
          <p className={cn("text-lg font-medium", isDragOver ? "text-primary" : "text-foreground")}>
            {isDragOver ? "Drop your PDF here" : "Drag & drop your PDF"}
          </p>
          <p className="text-sm text-muted-foreground">Only PDF files are accepted</p>
        </div>
      </div>

      {isDragOver && (
        <div className="absolute inset-0 bg-primary/5 rounded-lg border-2 border-primary border-dashed animate-pulse" />
      )}
    </div>
  );
}
