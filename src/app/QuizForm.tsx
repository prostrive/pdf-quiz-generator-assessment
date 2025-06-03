import { useState } from "react";

import { QuizQuestion } from "@/actions/generateQuestions";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
interface Props {
  quiz: QuizQuestion[];
  onGenerateAgain: () => void;
}

export default function QuizForm({ quiz, onGenerateAgain }: Props) {
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(quiz[0]);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [answer, setAnswer] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState("");
  const [resultMessage, setResultMessage] = useState("");

  const onSelect = () => {
    if (!answer) {
      setError("Please Choose an answer");
      return;
    }

    let newScore = score;

    if (answer === currentQuestion.answer) {
      newScore++;
      setScore(newScore);
    }

    const quizLength = quiz.length;

    if (questionNumber === quizLength) {
      setShowResults(true);

      if (newScore === quizLength)
        setResultMessage(
          "🎉 Awesome! You got a perfect score! You really understood the material — great job!"
        );
      else if (newScore === 0)
        setResultMessage(
          `❌ Oops! You scored 0 out of ${quizLength}. It looks like the questions were tricky — try reviewing the document and try again.`
        );
      else if (newScore < quizLength)
        setResultMessage(
          `✅ Nice try! You got ${score} out of ${quizLength} correct. Review the material and give it another shot!`
        );

      return;
    }

    setQuestionNumber(questionNumber + 1);
    setCurrentQuestion(quiz[questionNumber]);
    setAnswer("");
    setError("");
  };

  const onTryAgain = () => {
    setScore(0);
    setCurrentQuestion(quiz[0]);
    setQuestionNumber(1);
    setAnswer("");
    setShowResults(false);
    setError("");
  };

  if (showResults)
    return (
      <div className="space-y-5">
        <p className="text-lg font-semibold">
          Your score is {score} out of {quiz.length}
        </p>

        <p>{resultMessage}</p>

        <div className="space-x-1">
          <Button onClick={onTryAgain}>Try Again</Button>
          <Button onClick={onGenerateAgain}>Generate New Test</Button>
        </div>
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

      <Button onClick={onSelect}>Next</Button>
    </div>
  );
}
