"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

type QuizResultDialogProps = {
  totalScore: number;
  totalQuestions: number;
  openDialog: boolean;
  onClose: () => void;
};

export default function QuizResultDialog({
  totalScore,
  totalQuestions,
  openDialog,
  onClose,
}: QuizResultDialogProps) {
  const passingScore: boolean = totalScore >= 4;

  return (
    <Dialog open={openDialog} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{passingScore ? "🎉 Passed!" : "❌ Failed"}</DialogTitle>
          <DialogDescription>
            You scored {totalScore} out of {totalQuestions}. {passingScore ? "Great job!" : "Better luck next time."}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}