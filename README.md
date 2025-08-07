# PDF Quiz Generator

A web application that allows users to upload a PDF file and generate a multiple-choice quiz from its content using the power of AI.

---

## Features

- **AI-Generated Quizzes**
  - Extracts content from PDF using `pdf-parse-new`, then generates smart quiz questions via the OpenAI API.
- **Chunk-Based PDF Support**
  - Handles large PDF files by processing them in chunks to ensure smooth performance.
- **Quiz History**
  - Saves quiz attempts in `localStorage` using Zustand.
  - Users can view past quizzes, **retake**, or **delete** them.
- **Interactive Quiz Flow**
  - Users choose answers for each question.
  - Upon completion, results are displayed with correct vs incorrect answers and a final score.
- **Scalable Architecture**
- Follows **feature-based folder structure** for better maintainability and scalability.

---

## Tech Stack

- [Next.js](https://nextjs.org/) – App framework for server-side rendering and routing
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS framework
- [Shadcn/UI](https://ui.shadcn.com/) – Accessible and beautiful UI components
- [Zustand](https://github.com/pmndrs/zustand) – Lightweight global state management
- [pdf-parse-new](https://www.npmjs.com/package/pdf-parse-new) – For extracting text from PDF files
- [OpenAI API](https://platform.openai.com/docs) – For generating quiz questions using AI
- [Sonner](https://sonner.emilkowal.ski/) – Toast notification system

---

## Installation

```bash
git  clone  https://github.com/your-username/pdf-quiz-generator.git

cd  pdf-quiz-generator

npm  install
```

➤ Set up environment variables

Create a .env.local file and add:

.env

```bash
OPENAI_API_KEY=your-open-api-key

OPENAI_MODEL=your-openai-model

MAX_QUIZ_HISTORY_COUNT=your-max-quiz-history-count

QUESTIONS_COUNT=your-questions-count

MAX_FILE_SIZE=your-max-file-size

MAX_API_CALL_TIMEOUT=your-max-api-call-timeout
```

> Important: Make sure not to commit this file.

---

## Running the App

```bash
npm  run  dev
```

Then open your browser at http://localhost:3000.

## Folder Structure (Feature-Based)

```bash
src/
├──  app/
├──  features/
│  ├──  upload-pdf/
│  ├──  quiz/
│  ├──  quiz-history/
├──  components/
├──  hooks/
├──  lib/
│  ├──  schema/
│  ├──  utils/
│  ├──  zustand/
│  ├──  constants/
└──  types/
```

## Additional Libraries or Tools

- pdf-parse-new – Text extraction from PDF files
- openai – For generating quiz questions
- zustand – For state management
- sonner – For toast notifications
- shadcn/ui – UI component library
- tailwindcss – Styling framework

---

## Brief Explanation of Approach and Design Decisions

- Used a feature-based folder structure to keep logic modular and scalable
- State is kept minimal and persisted in localStorage via Zustand
- Large PDFs are processed in chunks to avoid performance issues and API limits
- Quiz generation is asynchronous and error-resilient
- Real-time feedback with sonner toast notifications
- All components use functional React and modern hooks

---

## User Guide

## Step 1: Upload a PDF File

1. On the home page, click the **"Choose File"** button.
2. Select a PDF file from your computer.
3. The file name will appear once selected.

> **Note:** The app supports large PDF files and processes them in chunks for optimal performance.

## Step 2: Generate Quiz

1. After uploading the file, click the **"Generate Quiz"** button.
2. The app will extract the text from the PDF and send it to the OpenAI API to generate quiz questions.
3. A loading indicator or toast will show the process status.

> If something goes wrong (e.g., file issues or API errors), a message will be shown using **Sonner** toast notifications.

## Step 3: Answer the Quiz

1. The generated multiple-choice quiz will be displayed.
2. Select your answer for each question.
3. Once you've answered all questions, click the **"Finish Quiz"** button.

## Step 4: View Results

- After submission, you'll see:
  - Your **score**
  - A summary showing correct vs. incorrect answers
  - Which answer was the right one for each question

## Step 5: Review Quiz History

1. On the home screen or sidebar, go to the **Quiz History** section.
2. You will see a list of previously generated quizzes (stored using **Zustand** in `localStorage`).

For each quiz:

- **Retake** – Reattempt the quiz from scratch
- **Delete** – Remove it permanently from history

---

## Known Limitations or Areas for Improvement

- No user authentication or cloud-based history storage
- Minimal error handling for scanned/invalid PDFs
- No handling for OpenAI rate limits or token overflow
- No quiz export or print feature
- Some parts of the mobile experience can be improved
