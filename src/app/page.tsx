"use client";

import { useState } from 'react';

import UploadPdfForm from "@/components/uploadPdfForm";
import QuizCard from "@/components/quizSection";
import { Question } from '@/lib/utils';

export default function Home() {
    const [questions, setQuestions] = useState<Question[]>([]);

    const handleSetQuestions = (newQuiz: Question[]) => {
        setQuestions(newQuiz);
        console.log(newQuiz);
    }

    return (
        <>
            <div className="bg-slate-200 grid grid-rows-[20px_1fr_20px] items-center justify-items-center pb-20 gap-16 font-[family-name:var(--font-geist-sans)] min-h-screen h-full">
                <h1 className="text-4xl font-bold pt-20">PDF Quiz Generator</h1>
                <div className="flex flex-col mx-auto w-full max-w-screen-lg">
                    <div className="flex-auto h-full m-6">
                        <UploadPdfForm
                            setQuestions={handleSetQuestions}
                        />
                    </div>
                    <div className="flex-auto h-full m-6">
                        <QuizCard
                            questions={questions}
                            setQuestions={setQuestions}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
