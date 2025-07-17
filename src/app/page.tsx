"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  // create a state to hold the loading state
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  // define reference for the file input element
  const fileInputRef = useRef<HTMLInputElement>(null);
  // create a function to handle file upload button
  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  // create a function to handle file change event
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle the file upload logic here
      // create a form data object to send the file
      const formData = new FormData();
      formData.append("file", file);

      setLoading(true); // set loading state to true
      // clear questions container
      let container = document.getElementById("questions-container");
      if (!container) {
        container = document.createElement("div")
        container.id = "questions-container";
        document.body.appendChild(container);
      } else {
        const clone = container.cloneNode(false); // false = shallow clone
        container.parentNode?.replaceChild(clone, container);
      }
      try {
        // send the form data to the API endpoint
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        // parse the response
        const result = await response.json();
        // handle server response
        if (!response.ok) {
          console.log("Error:", response.statusText);
          setLoading(false); // set loading state to false
          alert(result.error || "Failed to upload file. Please try again later.");
        }
        
        else {
          setLoading(false); // set loading state to false
          // clear the questions container
          const instructions = document.createElement("p");
          const instructionsText = document.createElement("strong");
          instructionsText.textContent = "To answer the questions, simply click the choice you wish to select. Correct answers will be highlighted in green."
          instructions.appendChild(instructionsText);
          document.getElementById("questions-container")?.appendChild(instructions);
          const spacer = document.createElement("br");
          document.getElementById("questions-container")?.appendChild(spacer);
          // reset score
          setScore(0);
          // show score
          document.getElementById("score-container")?.classList.remove("hidden");
          // Display the questions in the UI
          result.questions.forEach((question: any) => {
            const questionElement = document.createElement("div");
            questionElement.className = "question";
            questionElement.setAttribute("attr-answer", question.answerKey);

            const listItems = Object.entries(question.choices).map(([key, value]) => {
              return `<li data-key="${key}" style="cursor: pointer; text-decoration:underline;">${key}: ${value}</li>`;
            }).join("");
            // Set the inner HTML of the question element
            questionElement.innerHTML = `
              <p><strong>${question.question}</strong></p>
              <ul>${listItems}</ul>
            `;

            // Add click listeners to each choice
            questionElement.querySelectorAll("li").forEach((li) => {
              li.addEventListener("click", () => {
                const selectedKey = li.getAttribute("data-key");
                const correctKey = questionElement.getAttribute("attr-answer");

                if (selectedKey === correctKey) {
                  li.style.color = "green";
                  setScore((prevScore) => prevScore + 1);
                } else {
                  li.style.color = "red";
                }
              });
            });
            // Append the question element to the questions container
            document.getElementById("questions-container")?.appendChild(questionElement);
          });
          // Log the result for debugging
          console.log("Server response:", result);
        }
      } catch (error) {
        // handle any errors, log errors to console
        console.error("Error uploading file:", error);
        alert("An error occurred while uploading the file. Please try again later.");
        setLoading(false); // set loading state to false
      }
      // Log the file upload for debugging
      console.log("File uploaded:", file.name);
    }
  };

  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
     <h1 className="text-4xl font-bold">PDF Quiz Generator</h1>
     <p className="text-lg text-center">
        Generate quizzes from PDF documents with ease. Upload your PDF and get started!
      </p>
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      {!loading && (<Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded"
        onClick={handleFileUpload}>
        Upload PDF
      </Button>)}
      {loading && (
        <>
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
          </div>
          <div className="text-gray-500">Processing your file...</div>
        </>
      )}
      <div className="hidden" id="score-container">Score: {score}</div>
      <div id="questions-container"></div>
      <footer className="text-sm text-gray-500 mt-4">
        &copy; 2025 PDF Quiz Generator
      </footer>
    </div>
  );
}
