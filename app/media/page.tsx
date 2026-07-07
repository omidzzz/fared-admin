"use client";

import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Copy, Trash2, ImageIcon } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import { getMedia, uploadMedia, deleteMedia, type MediaItem } from "@/lib/services/media";

const PAGE_SIZE = 20;

export default function MediaPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["media", page],
    queryFn: () => getMedia({ page, limit: PAGE_SIZE }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      Toast.success("فایل با موفقیت حذف شد");
      setDeleteTarget(null);
    },
    onError: () => Toast.error("خطا در حذف فایل"),
  });

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      setUploading(true);
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          Toast.error("فقط فایل‌های تصویری مجاز هستند");
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          Toast.error(`حجم فایل ${file.name} بیشتر از ۵ مگابایت است`);
          continue;
        }
        try {
          await uploadMedia(file);
          Toast.success(`فایل ${file.name} آپلود شد`);
        } catch {
          Toast.error(`آپلود ${file.name} ناموفق بود`);
        }
      }
      queryClient.invalidateQueries({ queryKey: ["media"] });
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [queryClient]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files.length === 0) return;

      setUploading(true);
      const process = async () => {
        for (const file of Array.from(files)) {
          if (!file.type.startsWith("image/")) continue;
          if (file.size > 5 * 1024 * 1024) continue;
          try {
            await uploadMedia(file);
          } catch { /* skip */ }
        }
        queryClient.invalidateQueries({ queryKey: ["media"] });
        setUploading(false);
      };
      process();
    },
    [queryClient]
  );

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).then(
      () => Toast.success("لینک کپی شد"),
      () => Toast.error("خطا در کپی لینک")
    );
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fa-IR");

  return (
    <AdminLayout>
      <div className="page-container">
        <PageHeader
          title="کتابخانه رسانه"
          description="مدیریت فایل‌های بارگذاری شده"
        />

        {/* Upload area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[var(--border-default)] rounded-xl p-8 mb-8 text-center cursor-pointer hover:border-brand hover:bg-brand/5 transition-colors"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <LoadingSpinner size="md" />
              <p className="text-sm text-[var(--text-secondary)]">
                در حال آپلود...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-brand-light flex items-center justify-center">
                <Upload size={26} className="text-brand" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  فایل‌ها را اینجا رها کنید یا کلیک کنید
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  تصاویر با حداکثر حجم ۵ مگابایت
                </p>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Image grid */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : (data?.items?.length ?? 0) > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data!.items.map((item) => (
                <div
                  key={item.id}
                  className="card p-0 overflow-hidden group relative"
                >
                  {/* Image */}
                  <div className="aspect-square bg-subtle">
                    <img
                      src={item.url}
                      alt={item.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(item.url);
                      }}
                      className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors"
                      title="کپی لینک"
                    >
                      <Copy size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(item);
                      }}
                      className="w-10 h-10 rounded-lg bg-red-500/70 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
                      title="حذف"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-1">
                    <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                      {item.filename}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                      <span>{formatSize(item.size)}</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={Math.ceil((data?.total ?? 0) / PAGE_SIZE)}
              onPageChange={setPage}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ImageIcon size={48} className="text-[var(--text-muted)] mb-3" strokeWidth={1.5} />
            <p className="text-sm text-[var(--text-secondary)]">
              فایلی بارگذاری نشده است
            </p>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="حذف فایل"
        description={`آیا از حذف "${deleteTarget?.filename ?? ""}" اطمینان دارید؟`}
        confirmLabel="حذف"
        loading={deleteMutation.isPending}
      />
    </AdminLayout>
  );
}
