import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  Card,
  CardContent,
  Button,
} from "../ui";

type Props = {
  quiz: QuizResponse;
  userAnswers: any;
  onReset: () => void;
};

const ShowResults = ({ quiz, userAnswers, onReset }: Props) => {
  const calculateScore = () => {
    if (!quiz) return 0;
    let correct = 0;
    quiz.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correct) {
        correct++;
      }
    });
    return correct;
  };

  const getScorePercentage = () => {
    if (!quiz) return 0;
    return Math.round((calculateScore() / quiz.questions.length) * 100);
  };

  return (
    <>
      <CardHeader className="text-center p-0">
        <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-3xl mb-2">Quiz Complete!</CardTitle>
        <CardDescription className="text-xl">
          Your final score:{" "}
          <span className="font-bold text-green-600">
            {calculateScore()}/{quiz.questions.length} ({getScorePercentage()}%)
          </span>
        </CardDescription>
      </CardHeader>

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-4">
          {quiz.questions.map((question, index) => (
            <Card key={question.id}>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-800 mb-4">
                  {index + 1}. {question.question}
                </h3>

                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => {
                    const isCorrect = optionIndex === question.correct;
                    const isUserAnswer =
                      userAnswers[question.id] === optionIndex;
                    const isWrongAnswer = isUserAnswer && !isCorrect;

                    return (
                      <div
                        key={optionIndex}
                        className={`p-3 rounded-lg border flex items-center ${
                          isCorrect
                            ? "bg-green-50 border-green-200"
                            : isWrongAnswer
                            ? "bg-red-50 border-red-200"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        {isCorrect && (
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                        )}
                        {isWrongAnswer && (
                          <XCircle className="h-4 w-4 text-red-600 mr-2 flex-shrink-0" />
                        )}
                        <span
                          className={`${
                            isCorrect
                              ? "text-green-800 font-medium"
                              : isWrongAnswer
                              ? "text-red-800"
                              : "text-slate-700"
                          }`}
                        >
                          {option}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center pt-6">
          <Button onClick={onReset} variant="outline" size="lg">
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Another PDF
          </Button>
        </div>
      </div>
    </>
  );
};

export default ShowResults;
