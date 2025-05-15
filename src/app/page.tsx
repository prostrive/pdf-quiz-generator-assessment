"use client"

import dynamic from "next/dynamic"

const QuizForm = dynamic(
  () => import("@/components/quiz-form/quiz-form").then((mod) => mod.QuizForm),
  { ssr: false },
)

export default function Home() {
  return (
    <main className="flex flex-col gap-8 items-center p-10">
      <h1 className="text-4xl font-bold text-center">PDF Quiz Generator</h1>
      <QuizForm />
    </main>
  )
}
