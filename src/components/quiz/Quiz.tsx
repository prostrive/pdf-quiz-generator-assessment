'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, RotateCcw } from "lucide-react"
import { QuizResponse } from "@/schema"

interface QuizProps {
  quiz: QuizResponse
}

export default function Quiz({ quiz }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)

  const totalQuestions = quiz.questions.length
  const progress = ((currentQuestion + 1) / totalQuestions) * 100

  useEffect(() => {
    setCurrentQuestion(0)
    setUserAnswers({})
    setShowResults(false)
  }, [quiz])

  const handleAnswerSelect = (selectedAnswer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion]: selectedAnswer,
    }))
  }

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      setShowResults(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setUserAnswers({})
    setShowResults(false)
  }

  const score = quiz.questions.reduce(
    (acc, question, idx) => acc + (userAnswers[idx] === question.answer ? 1 : 0),
    0
  )
  const scorePercentage = Math.round((score / totalQuestions) * 100)

  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Quiz Results</CardTitle>
            <CardDescription>
              You scored {score} out of {totalQuestions} questions correctly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{scorePercentage}%</div>
              <Progress value={scorePercentage} className="w-full max-w-md mx-auto" />
            </div>
            <div className="space-y-4">
              {quiz.questions.map((question, idx) => {
                const userAnswer = userAnswers[idx]
                const isCorrect = userAnswer === question.answer
                const correctOption = question.options.find(opt => opt.label === question.answer)
                const userOption = question.options.find(opt => opt.label === userAnswer)
                return (
                  <Card key={idx} className={`border-l-4 ${isCorrect ? "border-l-green-500" : "border-l-red-500"}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <CardTitle className="text-lg">Question {idx + 1}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{question.question}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {!isCorrect && userAnswer && (
                          <div className="text-sm">
                            <span className="font-medium text-red-600">Your answer: </span>
                            <span className="text-red-600">{userOption?.text}</span>
                          </div>
                        )}
                        <div className="text-sm">
                          <span className="font-medium text-green-600">Correct answer: </span>
                          <span className="text-green-600">{correctOption?.text}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            <div className="text-center">
              <Button onClick={resetQuiz} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Retake Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQ = quiz.questions[currentQuestion]
  const selectedAnswer = userAnswers[currentQuestion]

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-xl">
              Question {currentQuestion + 1} of {totalQuestions}
            </CardTitle>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">{currentQ.question}</h3>
            <RadioGroup
              value={selectedAnswer || ""}
              onValueChange={handleAnswerSelect}
              className="space-y-3"
            >
              {currentQ.options.map(option => (
                <div
                  key={option.label}
                  className={`flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
                    selectedAnswer === option.label ? "bg-muted border-primary" : ""
                  }`}
                >
                  <RadioGroupItem value={option.label} id={option.label} />
                  <Label htmlFor={option.label} className="flex-1 cursor-pointer text-sm font-medium leading-relaxed">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
              Previous
            </Button>
            <Button onClick={handleNext} disabled={!selectedAnswer}>
              {currentQuestion === totalQuestions - 1 ? "Finish Quiz" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}