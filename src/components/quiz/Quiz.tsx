import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dispatch, SetStateAction, useState } from "react";
import { Questions, QuizAnswers } from "@/types";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  questions: Questions;
  setQuestions: Dispatch<SetStateAction<Questions | null>>;
};

export default function Quiz({ questions, setQuestions }: Props) {
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState("");
  const [showScoreDialog, setShowScoreDialog] = useState(false);

  //store the answers of the user in a hashmap
  const handleChoiceChange = (qIndex: number, choice: number) => {
    if (!submitted) {
      setAnswers({ ...answers, [qIndex]: choice });
    }
  };

  //check the answers of the user and compute the score
  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });
    setScore(`${correct} / ${questions.length}`);
    setSubmitted(true);
    setShowScoreDialog(true);
  };

  const resetQuiz = () => {
    setAnswers({});
    setScore("");
    setSubmitted(false);
    toast.success("Quiz reset successfully!");
    setShowScoreDialog(false);
  };

  const resetAll = () => {
    setAnswers({});
    setScore("");
    setSubmitted(false);
    setQuestions(null);
    setShowScoreDialog(false);
  };

  //check if all items are answered
  const allAnswered =
    questions.length > 0 && Object.keys(answers).length === questions.length;

  return (
    <section className="lg:py-20 py-6 space-y-4 max-w-[950px] mx-auto">
      {questions.map((q, qIndex) => {
        const isCorrect = answers[qIndex] === q.answer;
        const cardBorder = submitted
          ? isCorrect
            ? "border-green-500"
            : "border-red-500"
          : "border-gray-200";

        return (
          <Card key={qIndex} className={`border-2 ${cardBorder}`}>
            <CardContent className="p-4">
              <p className="font-semibold mb-4">
                {qIndex + 1}. {q.question}
              </p>
              <RadioGroup
                value={
                  answers[qIndex] !== undefined
                    ? answers[qIndex].toString()
                    : ""
                }
                onValueChange={(val) =>
                  handleChoiceChange(qIndex, parseInt(val))
                }
                className="space-y-2"
                disabled={submitted}
              >
                {q.choices.map((choice, cIndex) => {
                  const isCorrectChoice = cIndex === q.answer;
                  const isUserChoice = answers[qIndex] === cIndex;
                  const choiceClass = submitted
                    ? isCorrectChoice
                      ? "text-green-600 font-bold"
                      : isUserChoice
                      ? "text-red-600"
                      : ""
                    : "";
                  return (
                    <div
                      key={`c-${cIndex}`}
                      className={`flex items-center space-x-2 ${choiceClass}`}
                    >
                      <RadioGroupItem
                        value={cIndex.toString()}
                        id={`q${qIndex}-c${cIndex}`}
                      />
                      <Label
                        className="font-normal"
                        htmlFor={`q${qIndex}-c${cIndex}`}
                      >
                        {choice}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>
        );
      })}
      <div className="flex flex-wrap gap-4 mt-6 items-center">
        <Button
          className="cursor-pointer"
          onClick={handleSubmit}
          disabled={submitted || !allAnswered}
        >
          Submit Quiz
        </Button>
        {submitted && (
          <>
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={resetQuiz}
            >
              Take Quiz Again
            </Button>
            <Button
              className="cursor-pointer"
              variant="secondary"
              onClick={resetAll}
            >
              Upload New File
            </Button>
          </>
        )}
      </div>
      <Dialog open={showScoreDialog} onOpenChange={setShowScoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-4xl font-bold">
              Your Score
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center py-8">
            <p className="text-6xl font-extrabold text-blue-600">{score}</p>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <Button variant="outline" onClick={resetQuiz}>
              Take Quiz Again
            </Button>
            <Button variant="secondary" onClick={resetAll}>
              Upload New File
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
