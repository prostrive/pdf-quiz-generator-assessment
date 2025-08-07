"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuizStore } from "@/lib/zustand";
import { type QuizHistory } from "@/types/quiz.type";
import { Clock, Play, Trash2, Trophy } from "lucide-react";

type Props = {
  history: QuizHistory;
  loadQuizFromHistory: (historyItem: QuizHistory) => void;
};
export function QuizHistoryCard({ history, loadQuizFromHistory }: Props) {
  const { deleteQuizHistory } = useQuizStore();

  return (
    <Card
      key={history.id}
      className="group hover:shadow-md transition-all duration-200 bg-zinc-800 border-zinc-600"
    >
      <CardContent>
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-sm text-zinc-200 line-clamp-2 flex-1">
            {history.title}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteQuizHistory(history.id)}
            className="opacity-0 group-hover:opacity-100 transition-all hover:bg-zinc-700 h-6 w-6 p-0 text-red-600 hover:text-red-400"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex items-center text-xs text-zinc-300 mb-2">
          <Clock className="h-3 w-3 mr-1" />
          {new Date(history.createdAt).toLocaleDateString()}
        </div>

        <div className="flex items-center justify-between mb-3">
          <Badge
            variant="secondary"
            className="text-xs text-zinc-300 bg-zinc-700/50"
          >
            {history.totalQuestions} questions
          </Badge>
          {history.score !== undefined && (
            <Badge
              variant="secondary"
              className="text-xs text-zinc-300 bg-zinc-700/50"
            >
              <Trophy className="h-3 w-3 mr-1" />
              {history.score}/{history.totalQuestions}
            </Badge>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => loadQuizFromHistory(history)}
          className="w-full text-xs h-7"
        >
          <Play className="h-3 w-3 mr-1" />
          {history.score !== undefined ? "Retake" : "Start"}
        </Button>
      </CardContent>
    </Card>
  );
}
