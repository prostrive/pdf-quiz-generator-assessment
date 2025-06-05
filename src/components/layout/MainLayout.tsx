import { PropsWithChildren } from "react";

export function MainLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
            {process.env.NEXT_PUBLIC_APP_NAME || "PDF Quiz Generator"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
            Upload a PDF and generate an interactive quiz
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-grow px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">{children}</div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-8 sm:mt-16">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <p className="text-center text-xs sm:text-sm text-muted-foreground leading-relaxed">
            PDF Quiz Generator - Powered by OpenAI
          </p>
        </div>
      </footer>
    </div>
  );
}
