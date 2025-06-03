import { useState } from "react";

import { QuizQuestion } from "@/actions/generateQuestions";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
interface Props {
  quiz: QuizQuestion[];
}

export default function QuizForm({ quiz }: Props) {
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(quiz[0]);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [answer, setAnswer] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState("");

  const onSelect = () => {
    if (!answer) {
      setError("Please Choose an answer");
      return;
    }
    if (questionNumber === quiz.length) setShowResults(true);
    if (answer === currentQuestion.answer) setScore(score + 1);

    setQuestionNumber(questionNumber + 1);
    setCurrentQuestion(quiz[questionNumber]);
    setAnswer("");
    setError("");
  };

  if (showResults)
    return (
      <div>
        total score is : {score} out of {quiz.length}
      </div>
    );

  return (
    <div className="space-y-8">
      <Label className="text-lg">
        {questionNumber}. Question: {currentQuestion.question}
      </Label>

      <RadioGroup
        value={answer}
        onValueChange={setAnswer}
        className="space-y-2"
      >
        {currentQuestion.options.map((v) => (
          <div key={v} className="flex items-center space-x-2">
            <RadioGroupItem value={v} id={v} />
            <Label htmlFor={v}>{v}</Label>
          </div>
        ))}
      </RadioGroup>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button className="cursor-pointer" onClick={onSelect}>
        Next
      </Button>
    </div>
  );
}
