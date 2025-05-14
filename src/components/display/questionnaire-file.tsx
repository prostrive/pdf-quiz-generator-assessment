"use client";

import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { Question, UploadedFile } from "@/lib/database";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { Button } from "../ui/button";

type Props = {
  completed: boolean;
  result: { score: number };
  questions?: Array<Question>;
  file: UploadedFile;
};

export default function QuestionnaireFile({
  file,
  completed,
  result,
  questions,
}: Props) {
  const params = useParams();

  return (
    <Card
      className={cn(
        "w-full max-w-sm shadow-md p-3 gap-2 transition border-2",
        params.file === file.id ? "border-primary/30" : "border-muted"
      )}
    >
      <CardHeader className="px-1">
        <CardTitle className="text-lg font-semibold">
          <Link href={`/${file.id}`}>{file.name}</Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-1">
        <div className="flex flex-row gap-3">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Questions:</span> {questions?.length}
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Score:</span> {result.score}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {completed ? (
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle size={16} className="text-green-600" />
              Completed
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1">
              <XCircle size={16} className="text-gray-500" />
              In Progress
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-1">
        <Button asChild className="w-full">
          <Link target="_blank" href={file.path}>
            View file
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
