import { ImagePlus, LoaderCircle, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { api, apiErrorMessage } from "../../lib/api";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE = 3 * 1024 * 1024;

interface ImageUploadFieldProps {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  helperText?: string;
  disabled?: boolean;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  maxFiles = 1,
  helperText = "JPEG, PNG or WebP. Maximum 3 MB per image.",
  disabled = false
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFiles = async (files: File[]) => {
    const availableSlots = Math.max(0, maxFiles - value.length);
    const selected = files.slice(0, availableSlots);
    if (!selected.length) {
      toast.error(`You can upload up to ${maxFiles} image${maxFiles === 1 ? "" : "s"}.`);
      return;
    }

    for (const file of selected) {
      if (!ALLOWED_TYPES.has(file.type)) {
        toast.error(`${file.name}: only JPEG, PNG and WebP images are allowed.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: image size cannot exceed 3 MB.`);
        return;
      }
    }

    setUploading(true);
    setProgress(0);
    try {
      const uploaded: string[] = [];
      for (let index = 0; index < selected.length; index += 1) {
        const file = selected[index];
        const formData = new FormData();
        formData.append("image", file);
        const response = await api.post<{ data: { url: string } }>("/uploads/images", formData, {
          onUploadProgress: (event) => {
            const currentPercent = event.total ? event.loaded / event.total : 0;
            const overall = ((index + currentPercent) / selected.length) * 100;
            setProgress(Math.round(overall));
          }
        });
        uploaded.push(response.data.data.url);
      }
      onChange([...value, ...uploaded].slice(0, maxFiles));
      toast.success(`${uploaded.length} image${uploaded.length === 1 ? "" : "s"} uploaded`);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Image upload failed"));
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <section className="space-y-3">
      <div>
        <p className="label mb-1">{label}</p>
        <p className="text-xs text-slate-500">{helperText}</p>
      </div>

      {value.length ? (
        <div className={`grid gap-3 ${maxFiles === 1 ? "max-w-sm" : "grid-cols-2 sm:grid-cols-3"}`}>
          {value.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
            >
              <img
                src={url}
                alt={`${label} preview ${index + 1}`}
                className="aspect-video w-full object-cover"
              />
              <button
                type="button"
                aria-label={`Remove image ${index + 1}`}
                disabled={disabled || uploading}
                onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
                className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-xl bg-slate-950/80 text-white opacity-100 transition hover:bg-red-700 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
          <div>
            <ImagePlus className="mx-auto size-8 text-slate-400" />
            <p className="mt-2 text-sm font-semibold text-slate-600">No image uploaded</p>
          </div>
        </div>
      )}

      {uploading ? (
        <div className="space-y-2" aria-live="polite">
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-emerald-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs font-semibold text-emerald-700">Uploading {progress}%</p>
        </div>
      ) : null}

      {value.length < maxFiles ? (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className="btn-secondary"
        >
          {uploading ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <UploadCloud className="size-4" />
          )}
          {uploading
            ? "Uploading..."
            : maxFiles === 1 && value.length
              ? "Replace image"
              : "Choose image"}
        </button>
      ) : null}

      <input
        ref={inputRef}
        hidden
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={maxFiles > 1}
        disabled={disabled || uploading}
        onChange={(event) => void uploadFiles(Array.from(event.target.files ?? []))}
      />
    </section>
  );
}
