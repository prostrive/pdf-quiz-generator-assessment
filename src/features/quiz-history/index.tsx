"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuizStore } from "@/lib/zustand";
import { type QuizHistory } from "@/types/quiz.type";
import { FileText, History } from "lucide-react";
import { QuizHistoryCard } from "./components/quiz-history-card";

type Props = {
  loadQuizFromHistory: (historyItem: QuizHistory) => void;
};
export function QuizHistory({ loadQuizFromHistory }: Props) {
  const { quizHistory } = useQuizStore();

  return (
    <div className="w-80 bg-zinc-800 backdrop-blur-sm border-r border-zinc-600 py-6 sticky top-0 h-full">
      <div className="flex items-center mb-6 px-6">
        <History className="h-6 w-6 text-zinc-300 mr-2" />
        <h2 className="text-xl font-bold text-zinc-300">Quiz History</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-100px)] before:absolute before:bottom-0 before:left-0 before:w-full before:h-36 before:bg-zinc-800 before:bg-gradient-to-t before:from-zinc-800 before:to-transparent">
        {quizHistory.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No quizzes generated yet</p>
          </div>
        ) : (
          <div className="space-y-3 px-6 pb-36">
            {quizHistory.map((history) => (
              <QuizHistoryCard
                key={history.id}
                history={history}
                loadQuizFromHistory={loadQuizFromHistory}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
