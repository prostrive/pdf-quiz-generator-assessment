import type { Metadata } from "next"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "PDF Quiz Generator",
  description: "Generate quizzes from PDFs",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        {children}
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  )
}
