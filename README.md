# PDF Quiz Generator

A web application that allows users to upload PDF documents and generate a quiz based on the content using OpenAI.

---

## Features

- **Upload PDF** (up to 10 pages)
- **Extract text** from PDF using PDF.js
- **Generate 5 multiple-choice questions** using OpenAI (or mock data for local dev)
- **Take the quiz**: answer questions and see your score
- **Responsive, accessible UI** with Tailwind CSS and Shadcn UI
- **Robust error handling** for invalid PDFs, API failures, and edge cases

---

## Tech Stack

- [Next.js 15 (App Router)](https://nextjs.org/docs)
- [React 19](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com)
- [PDF.js](https://mozilla.github.io/pdf.js/) (via `pdfjs-dist`)
- [OpenAI API](https://platform.openai.com/docs/api-reference)
- TypeScript

---

## Installation & Setup

1. **Clone the repository and install dependencies:**
   ```sh
   git clone <your-fork-url>
   cd pdf-quiz-generator-assessment
   npm install
   ```

2. **Set up your OpenAI API key:**
   - Create a `.env.local` file in the project root:
     ```
     OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
     ```
   - (Optional for local dev/mock) To use mock quiz data instead of OpenAI, add:
     ```
     MOCK_OPENAI=true
     ```

3. **Start the development server:**
   ```sh
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Usage

1. **Upload a PDF** (max 10 pages).
2. Click **Upload PDF** to extract text.
3. Click **Generate Quiz** to create questions from the extracted text.
4. **Answer the quiz** and see your score.

---

## Project Structure

- `src/app/page.tsx` — Main page and app flow
- `src/components/` — Modular UI components (FileUpload, QuizContainer, ErrorAlert, etc.)
- `src/hooks/` — Custom hooks for PDF extraction and quiz generation
- `src/types/quiz.ts` — Shared types
- `src/app/api/generate-quiz/route.ts` — API route for OpenAI quiz generation

---

## Design Decisions & Approach

- **Hooks-first:** All business logic (PDF extraction, quiz generation) is encapsulated in custom hooks for reusability and testability.
- **Component modularity:** UI is broken into small, focused, and reusable components.
- **API security:** OpenAI API key is never exposed to the client; all requests go through a Next.js API route.
- **Mocking for local dev:** You can use `MOCK_OPENAI=true` to develop and test without using OpenAI credits.
- **Accessibility:** All interactive elements are accessible and keyboard-friendly.
- **Error handling:** All async actions have robust error handling and user feedback.

---

## Known Limitations / Areas for Improvement

- Only supports PDFs up to 10 pages (per assignment spec).
- Only generates multiple-choice questions (no short-answer).
- No persistent storage or user accounts.
- No PDF preview or advanced text extraction (e.g., images, tables).
- No internationalization/localization.

---

## Additional Libraries Used

- `pdfjs-dist` — PDF parsing
- `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `lucide-react`, `tailwind-merge`, `tailwindcss-animate` — UI/utility
- `shadcn/ui` — UI components

---

## Running in Production

1. Build the app:
   ```sh
   npm run build
   ```
2. Start the production server:
   ```sh
   npm start
   ```

---

## Security

- **Never commit your OpenAI API key** or any sensitive information.
- `.env.local` is git-ignored by default.

---

## License

This project is for assessment purposes only.
