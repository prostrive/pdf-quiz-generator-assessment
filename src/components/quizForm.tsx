import React from 'react'
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Question, AnsweredQustion } from '@/lib/utils'
import { useState } from "react";

function Quizzes({questions}: {questions: Question[] }) {
	const [submitVisible, setSubmitVisible] = useState(false);
	const [answeredQuestionList, setAnsweredQuestionList] = useState<AnsweredQustion[]>([])
	const [userScore, setUserScore] = useState(0);
	const [showScore, setShowScore] = useState(false);

	const handleOptionChange = (option: string, question: Question) => {
        const userAnswer: AnsweredQustion = {
            id: question.id,
            isCorrect: (question.answer === option)
        }


		let tempAnsweredList: AnsweredQustion[];
		if (answeredQuestionList.length == 0) {
			tempAnsweredList = [];
			tempAnsweredList.push(userAnswer);
		} else {
			tempAnsweredList = answeredQuestionList
			const foundAnswerIndex = tempAnsweredList.findIndex(ans => ans.id === userAnswer.id);

			if (foundAnswerIndex >= 0) {
				tempAnsweredList[foundAnswerIndex].isCorrect = question.answer === option;
			} else {
				tempAnsweredList.push(userAnswer);
			}
		}		
		
		setAnsweredQuestionList(tempAnsweredList);

		if (answeredQuestionList.length == 5) {
			setSubmitVisible(true);
		}
    }

	const displayScore = () => {
		let score = 0;
		for (const ans of answeredQuestionList) {
			if (ans.isCorrect) {
				score++;
			}
		}

		setUserScore(score);
		setSubmitVisible(false);
		setShowScore(true);
	}

	return (
		<div className='flex flex-col gap-5 w-full'>
			{!showScore && questions.map((question) => (
				<Card className="w-full" key={question.id}>
					<CardHeader>
						<CardTitle>{question.question}</CardTitle>
					</CardHeader>
					<CardContent>
						{question.options.map((option, index) => (
							<div className="flex items-center gap-3" key={index}>
								<label className="label px-4 text-base text-base-content">
									<input onChange={(e) => handleOptionChange(option, question)} type="radio" name={`question-${question.id}`} className="radio radio-neutral" />
									{option}
								</label>
							</div>
						))}
					</CardContent>
				</Card>
			))}
			{submitVisible && <Button onClick={displayScore}>Submit</Button>}
			{showScore && 
			<Alert>
				<AlertTitle><h1>Quiz done!</h1></AlertTitle>
				<AlertDescription>
				<h2>You scored {userScore} / 5.</h2>
				</AlertDescription>
			</Alert>
			}
		</div>
	)
}

export default Quizzes