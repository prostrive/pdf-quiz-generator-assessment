A web application that generates quizzes from uploaded PDF documents using AI.

## Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher) or yarn
- API key for your AI service (if required)

## Installation

1. **Install Dependencies**:

   ```bash
   npm install

   ```

2. **Set up environment variables**:
   Create a .env file in the root directory with the following variables:
   OPENAI_API_KEY=<your_api_key>

3. **Run the development server**:

   ```bash
   npm run dev

   ```

4. **Open in your browser:**:
   The application should be running at:
   http://localhost:3000

## Approach & Design Decisions

**Modular Architecture**:

Split components (Questionnaire, PdfUpload) into focused, single-responsibility units

Separated presentation from logic (e.g., QuizCompletion/QuestionView components)

Created reusable utility functions (parsePDF, generateQuiz)

**Type Safety**:

Implemented Zod schemas for robust form validation (pdfSchema)

Added TypeScript interfaces for all props and API responses

**Error Handling**:

Consistent error formatting (formatError utility)

Toast notifications for user feedback

Try/catch blocks around async operations

Responsive button sizing

**PDF Processing**:

PDF.js worker initialization

Page count validation

Text extraction with proper error boundaries

**AI Integration**:

Abstracted AI calls into separate service (aiHandler)
