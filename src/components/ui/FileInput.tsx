import { ChangeEvent, useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      <Input
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
        className={cn(
          "w-full h-auto flex flex-col items-center gap-2 sm:gap-3 border-dashed border-2",
          // Mobile-first responsive padding and sizing
          "p-4 sm:p-6 min-h-[100px] sm:min-h-[120px]",
          // Touch-friendly interactions
          "hover:border-primary/50 active:scale-[0.98] transition-all duration-200"
        )}
      >
        <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground flex-shrink-0" />
        <div className="text-center space-y-1">
          <p className="font-medium text-sm sm:text-base leading-tight">Choose PDF file</p>
          <p className="text-xs sm:text-sm text-muted-foreground leading-tight">Tap to browse your files</p>
        </div>
      </Button>
    </div>
  );
}
