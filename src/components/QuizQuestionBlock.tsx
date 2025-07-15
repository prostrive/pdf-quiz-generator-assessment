import React from "react";

type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
};

type QuizQuestionBlockProps = {
  q: QuizQuestion;
  idx: number;
  userAnswer: string;
  quizSubmitted: boolean;
  onSelect: (answer: string) => void;
};

const QuizQuestionBlock: React.FC<QuizQuestionBlockProps> = React.memo(
  ({ q, idx, userAnswer, quizSubmitted, onSelect }) => {
    return (
      <div className="mb-6 p-4 border rounded bg-white">
        <div className="font-medium mb-2">{idx + 1}. {q.question}</div>
        <ul className="space-y-2">
          {q.options.map((opt, oidx) => {
            const isSelected = userAnswer === opt;
            const isCorrect = quizSubmitted && opt === q.answer;
            const isIncorrect = quizSubmitted && isSelected && opt !== q.answer;
            return (
              <li key={oidx} className="pl-2">
                <label className={`flex items-center gap-2 cursor-pointer ${isCorrect ? 'text-green-700 font-semibold' : ''} ${isIncorrect ? 'text-red-700 font-semibold' : ''}`}> 
                  <input
                    type="radio"
                    name={`question-${idx}`}
                    value={opt}
                    checked={isSelected}
                    disabled={quizSubmitted}
                    onChange={() => onSelect(opt)}
                  />
                  {String.fromCharCode(65 + oidx)}. {opt}
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
);

QuizQuestionBlock.displayName = "QuizQuestionBlock";

export default QuizQuestionBlock; 