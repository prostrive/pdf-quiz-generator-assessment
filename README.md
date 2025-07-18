# PDF Quiz Generator - Take-Home Assignment

A test app for Open AI API integration, built with next.js. Allows users to upload a PDF file, and uses AI (of interchangeable models) to create a five-question quiz, each with four possible answers.

## Setup

### Cloning
Using bash, or your command line terminal of choice:

```bash
git clone https://github.com/lance-guinto-personal/pdf-quiz-generator-assessment.git
cd pdf-quiz-generator
```

### Prerequisites
Once cloned, install the necessary modules by running:

```bash
npm install
```

### Env Files
Create a .env file at the root folder of the project with the following constants:

```bash
# OpenAI Configuration
OPEN_AI_API_KEY = "YOUR_API_KEY_HERE
OPEN_AI_MODEL = "gpt-4o-mini"

# General Configuration
MAX_PDF_FILESIZE_MB = 25
MAX_PDF_PAGES = 10
```

### Running the Project
Open up a temrinal of your choice, navigate to project directory, and enter the following command:

```bash
npm run dev
```

Then open up a broswer and go to http://localhost:3000

## Tech Stack
This starter project uses Next.js with Tailwind CSS and Shadcn UI components.

## Design / Implementation
- Sever-side requests to Open API.
- Client-side checks against incorrect file types, and ideally, using **pdf.js**.

## Limitations / Issues
- **pdf.js** implementation is proving more finicky than expected, necessitating a downgrade to version 3.4.120. A fallback version of the project, with working OpenAI API integration, scoring, via a simple file uploader, is available at commit #267e1c1
- PDFs with no text and only images might not yield any usable results.
- Refresh is necessary to return main page, and no data is stored.

## Things to improve / Research upon, and other notes
- Server side PDF reading might be worth looking into.
- Canvas module is required for **pdf.js**. If it isn't already installed, install it via `npm install canvas`