import React from "react";

type ExtractedTextProps = {
  text: string;
};

const ExtractedText: React.FC<ExtractedTextProps> = ({ text }) => (
  <div className="mt-4 p-2 border rounded bg-gray-50 max-w-xl max-h-60 overflow-auto text-xs whitespace-pre-wrap">
    <strong>Extracted Text:</strong>
    <div>{text}</div>
  </div>
);

export default ExtractedText; 