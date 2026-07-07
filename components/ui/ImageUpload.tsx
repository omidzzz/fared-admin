"use client";

import { useState, useRef } from "react";
import { Upload, X, ImageIcon, Link } from "lucide-react";
import { uploadFile } from "@/lib/api/upload";
import { LoadingSpinner } from "./LoadingSpinner";
import { Toast } from "./Toast";
import { Input } from "./Input";
import { Button } from "./Button";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  endpoint: string;
  label?: string;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export function ImageUpload({
  value,
  onChange,
  endpoint,
  label = "تصویر",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side size check
    if (file.size > MAX_SIZE) {
      Toast.error("حجم فایل نباید بیشتر از ۵ مگابایت باشد");
      return;
    }

    // Check type
    if (!file.type.startsWith("image/")) {
      Toast.error("فقط فایل‌های تصویری مجاز هستند");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadFile(endpoint, file);
      onChange(result.url);
      Toast.success("تصویر با موفقیت آپلود شد");
    } catch {
      Toast.error("آپلود ناموفق بود");
    } finally {
      setUploading(false);
      // Reset so the same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput("");
      setShowUrlInput(false);
      Toast.success("تصویر با موفقیت اضافه شد");
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div>
      {label && (
        <p className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          {label}
        </p>
      )}

      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt={label}
            className="w-32 h-32 rounded-xl object-cover border border-[var(--border-default)]"
          />
          <button
            onClick={handleRemove}
            className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
            aria-label="حذف تصویر"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {!showUrlInput ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-32 h-32 rounded-xl border-2 border-dashed border-[var(--border-default)] flex flex-col items-center justify-center gap-2 text-[var(--text-muted)] hover:border-brand hover:text-brand transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <ImageIcon size={28} />
                  <Upload size={16} />
                </>
              )}
            </button>
          ) : (
            <div className="space-y-2">
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

          {!showUrlInput && !value && (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="text-sm text-brand hover:underline"
            >
              یا افزودن با لینک
            </button>
          )}
        </div>
      )}

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
