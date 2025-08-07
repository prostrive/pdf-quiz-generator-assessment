"use client";
import { Brain } from "lucide-react";

const HOW_IT_WORKS = [
  {
    id: 1,
    title: "Upload PDF",
    description: "Select your document",
  },
  {
    id: 2,
    title: "AI Analysis",
    description: "Extract key concepts",
  },
  {
    id: 3,
    title: "Generate Quiz",
    description: `Create smart questions`,
  },
  {
    id: 4,
    title: "Take Quiz",
    description: "Test your knowledge",
  },
];

export function HowItWorks() {
  return (
    <div className="p-6 rounded-xl border border-zinc-700">
      <h3 className="font-bold text-zinc-300 mb-4 flex items-center">
        <Brain className="h-5 w-5 mr-2" />
        How it works
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {HOW_IT_WORKS.map((hiw) => (
          <div key={hiw.id} className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-zinc-500/50 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-zinc-300 font-bold text-sm">{hiw.id}</span>
            </div>
            <div>
              <p className="font-medium text-zinc-200">{hiw.title}</p>
              <p className="text-sm text-zinc-300">{hiw.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
