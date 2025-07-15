import React from "react";
import { Button } from "@/components/ui/button";

type GenerateQuizButtonProps = {
  loading: boolean;
  onClick: () => void;
  error?: string;
};

const GenerateQuizButton: React.FC<GenerateQuizButtonProps> = ({ loading, onClick, error }) => (
  <>
    <Button
      className="w-full max-w-xs mt-4"
      onClick={onClick}
      disabled={loading}
      aria-busy={loading}
    >
      {loading ? "Generating Quiz..." : "Generate Quiz"}
    </Button>
    {error && (
      <div className="mt-2 p-2 border border-red-300 rounded bg-red-50 text-red-700 max-w-xl w-full text-xs" role="alert">
        <strong>Error:</strong> {error}
      </div>
    )}
  </>
);

export default GenerateQuizButton; 