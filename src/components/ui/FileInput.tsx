import { ChangeEvent, useRef } from "react";
import { File, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Props {
  onFileSelect: (file: File) => void;
  selectedFile?: File | null;
  className?: string;
  disabled?: boolean;
}

export function FileInput({ onFileSelect, selectedFile, className, disabled = false }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      onFileSelect(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
        aria-label="Select PDF file"
      />

      <Button
        onClick={handleButtonClick}
        disabled={disabled}
        variant="outline"
        className="w-full h-auto p-6 flex flex-col items-center gap-3 border-dashed border-2 hover:border-primary/50 transition-colors"
      >
        <Upload className="w-8 h-8 text-muted-foreground" />
        <div className="text-center">
          <p className="font-medium">Choose PDF file</p>
          <p className="text-sm text-muted-foreground">Click to browse your files</p>
        </div>
      </Button>

      {selectedFile && (
        <div className="mt-4 p-3 bg-muted rounded-lg flex items-center gap-3">
          <File className="w-5 h-5 text-blue-600" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
