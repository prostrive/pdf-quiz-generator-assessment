import { ChangeEvent, useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Props {
  onFileSelect: (file: File) => void;
  className?: string;
  disabled?: boolean;
}

export function FileInput({ onFileSelect, className, disabled = false }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    </div>
  );
}
