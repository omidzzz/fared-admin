import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";

export const metadata: Metadata = {
  title: "پنل مدیریت اورا میستیک",
  description: "Aura Mystic Admin Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
