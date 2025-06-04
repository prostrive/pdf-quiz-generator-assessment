import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import ReactQueryProvider from "@/components/provider/ReactQueryProvider";


export const metadata: Metadata = {
  title: "PDF Quiz Generator",
  description: "Generate quizzes from PDFs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      > <ReactQueryProvider>
          {children}
           <Toaster />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
