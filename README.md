# PDF Quiz Generator

A web-based tool that parses questions from a PDF file and renders them as interactive quizzes.

## Features

- Upload a PDF and generate multiple-choice questions
- Interactive UI for answering quizzes
- Highlights correct answers in green
- Mobile-responsive layout
- Loading animation while processing PDF

## Installation and Setup

1. Clone the repository or fork it:
   ```bash
   git clone https://github.com/shirofuji/pdf-quiz-generator-assessment.git
   ```

2. Open the project folder:
   ```bash
   cd /path/to/pdf-quiz-generator-assessment
   ```
3. Install project dependencies:
   ```bash
   npm install
   ``` 

4. Create a `.env` file in the base directory to setup your OpenAI Credentials

    The contents of the `.env` file should be as follows:

    ```
    OPENAI_GPT_MODEL=gpt-4
    OPENAI_API_KEY=your_api_key
    ```

    You can change the model in order to fit your budget.

5. Run the project or build and then run

    To run in development mode:
    ```bash
    npm run dev
    ```
    To build and run in production mode:
    ```bash
    npm run build
    npm run start
    ```

6. Open `http://localhost:3000` in your browser or your configured domain and path for your machine.

## Technologies Used

- Next.js
- Tailwind
- pdf-parse - for parsing PDF Contents.
- pdf-lib - for chunking the PDF for large file supports.
- openai - for question generation.

## Usage

1. Upload a PDF using the upload interface.
2. The script extracts text and parses it for questions.
3. Questions will appear below the upload area with clickable answers.
4. Correct answers will be highlighted green upon selection.

## Approach

- Used pdf-lib to extract pages from the original PDF document.
- Generated chunked versions of the PDF, default is 5 pages per chunk can be updated in the code.
- Each chunk is parsed into plain text via pdf-parse.
- Used a pre-generated prompt with the chunk text appended to generate a question per chunk.
- Loops over and over through all chunks available until a total of 5 questions are generated.
- Prompt is created with a pre-defined json format for the question, choices, and an answer key.
- Questions are returned to the front-end page to display and create an interactive quiz UI.
- Used `.env` file to store OpenAPI Credentials to ensure version control exclusion of sensitive data as well as possible support for multiple environments.

## Known Limitations

- Accuracy of question detection depends on PDF formatting
- Does not support OCR for scanned images
- Only works with English-language MCQ patterns for now
- PDFs that are too small may have repeating questions
- Only generates multiple choice questions

## Submission Checklist

- [x] All core functionality works as specified -- PDF Upload and Processing, Question Generation, Interative Quiz Display, Score Display and Function.
- [x] Error handling is implemented, specific erros will show up as alert dialogs
- [x] Code is well-commented and formatted
- [x] README is updated
- [x] No sensitive data included, uses .env file to ensure that API keys and other sensitive configurations are excluded from comits
- [x] Dependencies are documented
- [x] Responsive layout

## 👤 Author

Dominick Navarro