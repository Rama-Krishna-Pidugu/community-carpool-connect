import { UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function FileUpload({
  label,
  value,
  onChange,
  optional,
}: {
  label: string;
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  optional?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium">
          {label} {optional && <span className="text-xs font-normal text-muted-foreground">(optional)</span>}
        </label>
      </div>
      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-border bg-muted/30">
          <img src={value} alt={label} className="h-40 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/90 text-foreground shadow hover:bg-background"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors",
            dragOver ? "border-primary bg-primary-soft" : "border-border bg-muted/30 hover:border-primary/50 hover:bg-primary-soft/50",
          )}
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-primary">
            <UploadCloud className="h-5 w-5" />
          </span>
          <span className="text-sm font-medium">Drag &amp; drop or click to upload</span>
          <span className="text-xs text-muted-foreground">PNG, JPG up to 5MB</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => inputRef.current?.click()}
        >
          Replace file
        </Button>
      )}
    </div>
  );
}
