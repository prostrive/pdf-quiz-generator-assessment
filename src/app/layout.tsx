import type { Metadata } from "next";
import "./globals.css";
import UploadForm from "@/components/form/upload-form";
import QuestionnaireFile from "@/components/display/questionnaire-file";
import database from "@/lib/database";

export const metadata: Metadata = {
  title: "PDF Quiz Generator",
  description: "Generate quizzes from PDFs",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await database.getOrCreateAssistant();

  const questionnaires = database.data.questionnaires;

  return (
    <html lang="en">
      <body className={`antialiased`}>
        <div className="mx-auto w-8/12 p-5">
          <div className="flex flex-row gap-3">
            <div className="flex flex-col gap-3">
              <UploadForm />
              <div className="flex flex-col gap-2">
                {Object.entries(questionnaires).map(([, value]) => (
                  <QuestionnaireFile key={value.file.id} {...value} />
                ))}
              </div>
            </div>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
