"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, User, Mail, Calendar } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { getLeadById, markAsRead } from "@/lib/services/leads";

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", id],
    queryFn: () => getLeadById(id),
  });

  const markReadMutation = useMutation({
    mutationFn: () => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead", id] });
    },
  });

  // Auto-mark as read
  if (lead && !lead.read && !markReadMutation.isPending) {
    markReadMutation.mutate();
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fa-IR");

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  if (!lead) {
    return (
      <AdminLayout>
        <div className="page-container text-center py-16">
          <p className="text-lg text-[var(--text-secondary)]">پیام یافت نشد</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="page-container">
        <PageHeader
          title={lead.subject ?? "جزئیات پیام"}
          breadcrumbs={[
            { label: "پیام‌ها و لیدها", href: "/leads" },
            { label: lead.name ?? "" },
          ]}
          actions={
            <Button
              variant="secondary"
              onClick={() => router.push("/leads")}
            >
              <ArrowRight size={18} />
              بازگشت
            </Button>
          }
        />

        <div className="max-w-2xl space-y-4">
          {/* Sender info */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center">
                <User size={22} className="text-brand" />
              </div>
              <div>
                <p className="text-base font-semibold text-[var(--text-primary)]">
                  {lead.name}
                </p>
                <p className="text-sm text-[var(--text-muted)] dir-ltr">
                  {lead.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
              <Calendar size={16} />
              <span>{formatDate(lead.createdAt)}</span>
              <Mail size={16} />
              <span className="dir-ltr">{lead.email}</span>
              <span className="mr-auto">
                {!lead.read ? (
                  <Badge variant="warning">خوانده نشده</Badge>
                ) : (
                  <Badge variant="default">خوانده شده</Badge>
                )}
              </span>
            </div>
          </div>

          {/* Subject */}
          {lead.subject && (
            <div className="card">
              <p className="text-xs text-[var(--text-muted)] mb-1">موضوع</p>
              <p className="text-sm text-[var(--text-primary)] font-medium">
                {lead.subject}
              </p>
            </div>
          )}

          {/* Message body */}
          <div className="card">
            <p className="text-xs text-[var(--text-muted)] mb-2">متن پیام</p>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
              {lead.message}
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
