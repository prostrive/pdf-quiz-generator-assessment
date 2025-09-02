"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import QuizResultDialog from "./quizResultDialog";
import { quizAnswerValidator } from "@/lib/validators/quizAnswer.validator";

type QuizViewerProps = {
  quizQuestions: QuizDetails[];
};

export default function QuizViewer({ quizQuestions }: QuizViewerProps) {
    const [totalScore, setTotalScore] = useState<number | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const QuizAnswer = quizAnswerValidator(quizQuestions);

    const form = useForm<z.infer<typeof QuizAnswer>>({
        resolver: zodResolver(QuizAnswer),
        defaultValues: quizQuestions.reduce(
        (acc, question) => ({ ...acc, [question.id]: "" }),
        {} as Record<string, string>
        ),
    });

    const onSubmitQuiz = (values: z.infer<typeof QuizAnswer>) => {
        let calculatedScore = 0;

        quizQuestions.forEach((q) => {
        const userAnswerIndex = parseInt(values[q.id.toString()], 10);
        if (userAnswerIndex === q.answer) {
            calculatedScore++;
        }
        });

        setTotalScore(calculatedScore);
        setDialogOpen(true);
    };

    if (quizQuestions.length === 0) return null;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="font-bold text-2xl mb-6">
        Let’s Put Your Knowledge to the Test
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitQuiz)} className="space-y-6">
          {quizQuestions.map((question) => (
            <FormField
              key={question.id}
              control={form.control}
              name={question.id.toString()}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">
                    {question.id}. {question.question}
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your answer" />
                      </SelectTrigger>
                      <SelectContent>
                        {question.options.map((option, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </Form>

      {totalScore !== null && (
        <QuizResultDialog
          totalScore={totalScore}
          totalQuestions={quizQuestions.length}
          openDialog={dialogOpen}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </div>
  );
}
