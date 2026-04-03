import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { useBannerUpload } from "@/hooks/useBannerUpload";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  folder?: string;
  aspectRatio?: string;
  hint?: string;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  required = false,
  folder = "banners",
  aspectRatio = "16/9",
  hint,
}: ImageUploadFieldProps) {
  const { uploadImage, uploading } = useBannerUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = await uploadImage(file, folder);
    if (url) onChange(url);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleFileSelect(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await handleFileSelect(file);
  };

  const handleRemove = () => {
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt={label}
            className="w-full h-32 object-cover rounded-lg border"
            style={{ aspectRatio }}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-full bg-muted p-3">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Click or drag to upload</p>
              {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            </div>
          )}
        </div>
      )}
      
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
