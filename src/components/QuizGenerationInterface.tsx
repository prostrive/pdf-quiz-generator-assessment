import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Brain, CheckCircle, Settings, Sparkles, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuizGeneration } from "@/hooks/useQuizGeneration";
import { SUGGESTED_FOCUS_AREAS } from "@/lib/quizPrompts";
import { PreprocessedContent, Quiz, QuizGenerationOptions } from "@/types";
import { ErrorMessage } from "./ui/ErrorMessage";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { ProgressBar } from "./ui/ProgressBar";

interface Props {
  content: PreprocessedContent | null;
  isContentReady: boolean;
  onQuizGenerated?: (quiz: Quiz) => void;
}

export function QuizGenerationInterface({ content, isContentReady }: Props) {
  const router = useRouter();
  const { isGenerating, currentQuiz, error, progress, canGenerate, generateQuizFromContent, reset, clearQuiz } =
    useQuizGeneration();
  const [options, setOptions] = useState<QuizGenerationOptions>({
    questionCount: 5,
    difficulty: "medium",
    includeExplanations: false,
    title: "Generated Quiz",
    focusAreas: []
  });
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const handleGenerateQuiz = async () => {
    if (!content || !isContentReady) {
      return;
    }

    const generationOptions: QuizGenerationOptions = {
      ...options,
      focusAreas: selectedFocusAreas
    };

    await generateQuizFromContent(content.cleanedText, generationOptions);
  };

  const toggleFocusArea = (area: string) => {
    setSelectedFocusAreas(prev => (prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]));
  };

  const getProgressPercentage = () => {
    switch (progress.phase) {
      case "idle":
        return 0;

      case "validating":
        return 20;

      case "generating":
        return 60;

      case "parsing":
        return 90;

      case "complete":
        return 100;

      case "error":
        return 0;

      default:
        return 0;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Quiz Generation
          {currentQuiz && (
            <Badge variant="secondary" className="ml-auto">
              {currentQuiz.questions.length} questions ready
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Content Status */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          {isContentReady ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Content Ready</p>
                <p className="text-sm text-muted-foreground">
                  {content?.cleanedLength.toLocaleString()} characters, ~{content?.estimatedTokens} tokens
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <div>
                <p className="font-medium">Waiting for Content</p>
                <p className="text-sm text-muted-foreground">Please upload and process a PDF file first</p>
              </div>
            </>
          )}
        </div>
        {/* Quiz Options */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quiz Title */}
            <div className="space-y-2">
              <Label htmlFor="quiz-title">Quiz Title</Label>
              <Input
                id="quiz-title"
                value={options.title}
                onChange={e => setOptions(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter quiz title"
                disabled={isGenerating}
              />
            </div>

            {/* Question Count */}
            <div className="space-y-2">
              <Label htmlFor="question-count">Number of Questions</Label>
              <Select
                value={options.questionCount?.toString() || ""}
                onValueChange={value => setOptions(prev => ({ ...prev, questionCount: parseInt(value) }))}
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select question count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Questions</SelectItem>
                  <SelectItem value="5">5 Questions</SelectItem>
                  <SelectItem value="8">8 Questions</SelectItem>
                  <SelectItem value="10">10 Questions</SelectItem>
                  <SelectItem value="15">15 Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                value={options.difficulty || ""}
                onValueChange={(value: "easy" | "medium" | "hard") =>
                  setOptions(prev => ({ ...prev, difficulty: value }))
                }
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy - Basic concepts</SelectItem>
                  <SelectItem value="medium">Medium - Balanced mix</SelectItem>
                  <SelectItem value="hard">Hard - Deep analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Include Explanations */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="explanations"
                checked={options.includeExplanations || false}
                onCheckedChange={checked => setOptions(prev => ({ ...prev, includeExplanations: !!checked }))}
                disabled={isGenerating}
              />
              <Label htmlFor="explanations" className="text-sm">
                Include answer explanations
              </Label>
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="flex items-center gap-2"
            disabled={isGenerating}
          >
            <Settings className="h-4 w-4" />
            {showAdvancedOptions ? "Hide" : "Show"} Advanced Options
          </Button>

          {/* Advanced Options */}
          {showAdvancedOptions && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Focus Areas (optional)
                </Label>
                <p className="text-sm text-muted-foreground">Select specific areas to emphasize in questions</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_FOCUS_AREAS.map(area => (
                    <Button
                      key={area}
                      onClick={() => toggleFocusArea(area)}
                      disabled={isGenerating}
                      className={`px-3 text-foreground py-1 text-sm rounded-full border transition-colors ${
                        selectedFocusAreas.includes(area)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-muted border-border"
                      }`}
                    >
                      {area}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generation Progress */}
        {isGenerating && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <LoadingSpinner size="small" />
              <p className="text-sm font-medium">{progress.message}</p>
            </div>
            <ProgressBar progress={getProgressPercentage()} />
          </div>
        )}

        {/* Error Display */}
        {error && <ErrorMessage message={error} type="error" dismissible onDismiss={reset} />}

        {/* Success Message with Action Options */}
        {currentQuiz && !isGenerating && (
          <div className="space-y-4 p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="font-medium text-green-800">Quiz Generated Successfully!</p>
                <p className="text-sm text-green-600">
                  Created &quot;{currentQuiz.title}&quot; with {currentQuiz.questions.length} questions
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  // Store quiz in localStorage and navigate to quiz page
                  localStorage.setItem("currentQuiz", JSON.stringify(currentQuiz));
                  router.push("/quiz");
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                Take Quiz
              </Button>
              <Button
                variant="outline"
                onClick={clearQuiz}
                className="flex-1 border-green-300 text-green-700 hover:bg-green-100"
              >
                Generate New Quiz
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleGenerateQuiz}
            disabled={!isContentReady || !canGenerate}
            className="flex-1 flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate Quiz"}
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-muted-foreground text-center">
          Quiz generation uses AI to create questions based on your PDF content. Processing may take 10-30 seconds
          depending on content length.
        </p>
      </CardContent>
    </Card>
  );
}
