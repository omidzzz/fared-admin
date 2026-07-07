"use client";

import { useState, useRef } from "react";
import { Upload, X, ImageIcon, Link, Star } from "lucide-react";
import { uploadFile } from "@/lib/api/upload";
import { LoadingSpinner } from "./LoadingSpinner";
import { Toast } from "./Toast";
import { Input } from "./Input";
import { Button } from "./Button";

interface ImageItem {
  url: string;
  isFeatured?: boolean;
}

interface ImageGalleryProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  endpoint: string;
  label?: string;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export function ImageGallery({
  images,
  onChange,
  endpoint,
  label = "تصاویر",
}: ImageGalleryProps) {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      Toast.error("حجم فایل نباید بیشتر از ۵ مگابایت باشد");
      return;
    }

    if (!file.type.startsWith("image/")) {
      Toast.error("فقط فایل‌های تصویری مجاز هستند");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadFile(endpoint, file);
      onChange([...images, { url: result.url, isFeatured: images.length === 0 }]);
      Toast.success("تصویر با موفقیت آپلود شد");
    } catch {
      Toast.error("آپلود ناموفق بود");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange([...images, { url: urlInput.trim(), isFeatured: images.length === 0 }]);
      setUrlInput("");
      setShowUrlInput(false);
      Toast.success("تصویر با موفقیت اضافه شد");
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    // If we removed the featured image, make the first one featured
    if (images[index].isFeatured && newImages.length > 0) {
      newImages[0].isFeatured = true;
    }
    onChange(newImages);
  };

  const handleSetFeatured = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isFeatured: i === index,
    }));
    onChange(newImages);
  };

  return (
    <div>
      {label && (
        <p className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          {label}
        </p>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <div className="relative">
                <img
                  src={img.url}
                  alt={`تصویر ${index + 1}`}
                  className="w-24 h-24 rounded-xl object-cover border border-[var(--border-default)]"
                />
                {img.isFeatured && (
                  <div className="absolute top-1 right-1 bg-yellow-400 rounded-full p-0.5">
                    <Star size={12} className="text-white fill-white" />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {!img.isFeatured && (
                  <button
                    onClick={() => handleSetFeatured(index)}
                    className="w-6 h-6 rounded-full bg-yellow-400 text-white flex items-center justify-center hover:bg-yellow-500 transition-colors"
                    title="تصویر اصلی"
                  >
                    <Star size={12} />
                  </button>
                )}
                <button
                  onClick={() => handleRemove(index)}
                  className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                  title="حذف تصویر"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add image controls */}
      <div className="space-y-2">
        {!showUrlInput ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-24 h-24 rounded-xl border-2 border-dashed border-[var(--border-default)] flex flex-col items-center justify-center gap-1 text-[var(--text-muted)] hover:border-brand hover:text-brand transition-colors disabled:opacity-50 text-xs"
            >
              {uploading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <ImageIcon size={20} />
                  <Upload size={12} />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="w-24 h-24 rounded-xl border-2 border-dashed border-[var(--border-default)] flex flex-col items-center justify-center gap-1 text-[var(--text-muted)] hover:border-brand hover:text-brand transition-colors text-xs"
            >
              <Link size={20} />
              <span>لینک</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2 max-w-sm">
            <Input
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleUrlSubmit())}
            />
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={handleUrlSubmit}>
                <Link size={14} />
                افزودن
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowUrlInput(false);
                  setUrlInput("");
                }}
              >
                لغو
              </Button>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label={label}
      />
    </div>
  );
}