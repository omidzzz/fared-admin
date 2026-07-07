"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Sparkles } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("ایمیل معتبر وارد کنید"),
  password: z.string().min(6, "رمز عبور حداقل ۶ کاراکتر باشد"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, login } = useAuth();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // If already authenticated, redirect to dashboard
  if (!authLoading && user) {
    router.replace("/dashboard");
    return null;
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const onSubmit = async (data: LoginFormData) => {
    setServerError("");
    try {
      await login(data.email, data.password);
      router.push("/dashboard");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "خطایی رخ داده است");
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg-base)]">
      {/* Branding Panel — Right side on desktop */}
      <div className="hidden md:flex md:w-1/2 bg-brand flex-col items-center justify-center p-12 text-white">
        <div className="max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center">
              <Sparkles size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">اورا میستیک</h1>
          <p className="text-lg text-white/80 leading-relaxed">
            پنل مدیریت داخلی
          </p>
          <p className="mt-4 text-sm text-white/60">
            سکوی مدیریت فروشگاه معنوی اورا میستیک
          </p>
        </div>
      </div>

      {/* Login Form — Left side on desktop */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="md:hidden text-center mb-8">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-brand flex items-center justify-center">
                <Sparkles size={32} className="text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">اورا میستیک</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">پنل مدیریت داخلی</p>
          </div>

          <div className="card p-6 md:p-8">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6 text-center">
              ورود به سیستم
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="ایمیل"
                type="email"
                placeholder="your@email.com"
                error={errors.email?.message}
                {...register("email")}
              />

              <Input
                label="رمز عبور"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />

              {serverError && (
                <div className="bg-[var(--danger-bg)] text-[var(--danger)] text-sm rounded-lg px-4 py-2.5 text-center">
                  {serverError}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                className="w-full"
              >
                ورود به سیستم
              </Button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
