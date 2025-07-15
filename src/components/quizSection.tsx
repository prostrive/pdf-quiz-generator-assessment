import { Question } from "@/lib/utils"
import { useState } from "react";

import { Button } from './ui/button';
import { Card, CardContent } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

type QuizCardProps = {
    questions: Question[];
    setQuestions: (questions: Question[]) => void;
}

export default function QuizCard({
    questions,
    setQuestions
}: QuizCardProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Tracks current question
    const [score, setScore] = useState(0); // Tracks total correct answers
    const [isEndQuiz, setIsEndQuiz] = useState(false); // Flag for end of quiz
    const [selectedAns, setSelectedAns] = useState<string | null>(null); // Stores selected answer

    const currQuestion = questions[currentQuestionIndex]; // Current question object
    const isLastQuestion = currentQuestionIndex === questions.length - 1; // Check if it's the last question

    // Reset quiz state and parent states
    const quizReset = () => {
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setSelectedAns(null);
        setScore(0);
        setIsEndQuiz(false);
    }

    const handleSubmit = () => {
        if(selectedAns === currQuestion.answer) {
            setScore((lastScore) => lastScore + 1);
        }

        setSelectedAns(null);

        if(!isLastQuestion) {
            setCurrentQuestionIndex((lastIndex) => lastIndex + 1);
        } else {
            setIsEndQuiz(true);
        }
    }

    // If no questions, render nothing
    if(!questions.length) return null;

    return (
        <Card>
            <CardContent>
                {isEndQuiz ? (
                    <QuizEnd
                        score={score}
                        totalQuestions={questions.length}
                        resetForm={quizReset}
                    />
                ) : (
                    <QuizView
                        currentQuestionIndex={currentQuestionIndex}
                        totalQuestions={questions.length}
                        question={currQuestion?.question}
                        options={currQuestion?.options || []}
                        selectedAnswer={selectedAns}
                        onAnswerSelect={setSelectedAns}
                        onSubmit={handleSubmit}
                        isSubmitDisabled={!selectedAns}
                    />
                )}
            </CardContent>
        </Card>
    )
}

type QuizEndProps = ({
    score: number;
    totalQuestions: number;
    resetForm: () => void;
});

const QuizEnd = ({
    score,
    totalQuestions,
    resetForm
}: QuizEndProps) => (
    <div className="flex flex-col items-center justify-center text-center space-y-4">
        <h2>Quiz Complete!</h2>
        <p>Your Score: {score} / {totalQuestions}</p>
        <Button onClick={resetForm}>
            Done!
        </Button>
    </div>
)

type QuizViewProps = {
    currentQuestionIndex: number;
    totalQuestions: number;
    question: string;
    options: string[];
    selectedAnswer: string | null;
    onAnswerSelect: (value: string) => void;
    onSubmit: () => void;
    isSubmitDisabled: boolean;
}

const QuizView = ({
    currentQuestionIndex,
    totalQuestions,
    question,
    options,
    selectedAnswer,
    onAnswerSelect,
    onSubmit,
    isSubmitDisabled,
}: QuizViewProps) => (
    <>
        <div>
            <h2>
                Question {currentQuestionIndex + 1} of {totalQuestions}
            </h2>
            <p>{question}</p>

            <RadioGroup value={selectedAnswer ?? ''} onValueChange={onAnswerSelect}>
                {options.map((option, index) => (
                    <div key={option} className="flex mt-3">
                        <RadioGroupItem value={option} id={`optionIndex-${index}`} className="border border-black mr-2" />
                        <Label htmlFor={`optionIndex-${index}`}>{option}</Label>
                    </div>
                ))}
            </RadioGroup>
        </div>

        <Button
            className="mt-4"
            onClick={onSubmit}
            disabled={isSubmitDisabled}
        >
            {isSubmitDisabled
                ? 'Select an Option'
                : 'Submit Answer'
            }
        </Button>
    </>
)