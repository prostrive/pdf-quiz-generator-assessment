export enum QuizType {
    MULTIPLE_CHOICE = "multiple-choice",
    SHORT_ANSWER = "short-answer"
}

export type QuizDetails = {
    id: number;
    type: QuizType.MULTIPLE_CHOICE | QuizType.SHORT_ANSWER;
    question: string;
    options: string[];
    answer: number | string;
}