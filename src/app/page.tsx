'use client';

import PdfUpload from '@/components/uploadForm';
import Questionnaire from '@/components/quizView';
import { Question } from '@/lib/utils';
import { useState } from 'react';

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const handleQuizGenerated = (newQuestions: Question[]) => {
    setQuestions(newQuestions);
  };

  return (
    <div
      className='
    max-w-4xl             
    mx-auto            
    min-h-screen        
    px-6 sm:px-12         
    pt-12 pb-24           
    font-sans             
    space-y-16           
  '
      style={{ fontFamily: 'var(--font-geist-sans)' }}
    >
      <h1 className='text-center text-4xl font-bold'>PDF Quiz Generator</h1>

      <PdfUpload
        pdfFile={pdfFile}
        setPdfFile={setPdfFile}
        quizGenerated={handleQuizGenerated}
      />
      <Questionnaire
        questions={questions}
        setQuestions={setQuestions}
        setPdfFile={setPdfFile}
      />
    </div>
  );
}
