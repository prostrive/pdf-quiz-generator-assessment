import React from "react";

type FileUploadProps = {
  onFileChange: (file: File | null) => void;
  selectedFile: File | null;
  disabled?: boolean;
};

const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, selectedFile, disabled }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    } else {
      onFileChange(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <label htmlFor="pdf-upload" className="sr-only">Upload PDF</label>
      <div className="flex justify-center w-full">
        <input
          id="pdf-upload"
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          onChange={handleChange}
          aria-label="Upload PDF file"
          className="block w-full max-w-xs text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          disabled={disabled}
        />
      </div>
      {selectedFile && <p className="text-sm text-gray-600">Selected: {selectedFile.name}</p>}
    </div>
  );
};

export default FileUpload; 