import { PropsWithChildren } from "react";
import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";

import "./globals.css";

export const metadata: Metadata = {
  title: "PDF Quiz Generator",
  description: "Generate quizzes from PDFs"
};

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
