import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  RadioGroup,
  RadioGroupItem,
} from "../ui";

type Props = {
  quiz: QuizResponse;
  userAnswers: any;
  onSubmit: () => void;
  onAnswerSelect: (id: number, value: string) => void;
};

const GenerateQuiz = ({
  quiz,
  userAnswers,
  onSubmit,
  onAnswerSelect,
}: Props) => {
  return (
    <>
      <CardHeader className="text-center p-0">
        <CardTitle className="text-2xl">Take the Quiz</CardTitle>
        <CardDescription>
          Answer all 5 questions and submit to see your results
        </CardDescription>
      </CardHeader>

      <div className="max-w-3xl mx-auto space-y-6">
        {quiz.questions.map((question, index) => (
          <Card key={question.id}>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                {index + 1}. {question.question}
              </h3>

              <RadioGroup
                value={userAnswers[question.id]?.toString()}
                onValueChange={(value) => onAnswerSelect(question.id, value)}
              >
                {question.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem
                      value={optionIndex.toString()}
                      id={`q${question.id}-${optionIndex}`}
                    />
                    <Label
                      htmlFor={`q${question.id}-${optionIndex}`}
                      className="text-slate-700 cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}

        <div className="text-center pt-4">
          <Button
            onClick={onSubmit}
            disabled={Object.keys(userAnswers).length !== quiz.questions.length}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Submit Quiz
          </Button>
        </div>
      </div>
    </>
  );
};

export default GenerateQuiz;
