# PDF Quiz Generator

A web app that allows users to upload a PDF file (max 10 pages) and automatically generates a multiple-choice quiz based on its content using LLMs. Built with **Next.js**, **React**, **Zod**, and **pdf.js**, powered by **Groq LLaMA 4** for fast and intelligent AI-driven quiz generation.

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/CnRXomoX/pdf-quiz-generator.git
cd pdf-quiz-generator
```

### 2. Install dependencies
```bash
npm install
```

### 3. Add your Groq API key
Create a `.env.local` file in the root directory:
```bash
AI_API_KEY=your_groq_api_key_here
```
> You can get your Groq key from: https://console.groq.com/

### 4. Run the development server
```bash
npm run dev
```

Open http://localhost:3000 to use the app.

---

## Tech Stack

| Tech            | Usage                          |
|-----------------|--------------------------------|
| Next.js         | App framework                  |
| React           | Frontend UI                    |
| pdf.js          | PDF text parsing               |
| Groq + LLaMA 4  | AI quiz generation             |
| React Hook Form | Form validation                |
| Zod             | Schema validation              |
| Sonner          | Toast notification system      |
| Tailwind CSS    | (Optional) Styling             |

---

## Approach & Design Decisions

- **Client-side PDF parsing:** Using `pdf.js` allows us to extract text directly in the browser, preventing file uploads to a server and ensuring privacy and responsiveness.
- **AI prompt engineering:** The extracted content is sent to the Groq-hosted LLaMA 4 model with carefully crafted instructions to return only structured JSON.
- **Zod + React Hook Form:** Ensures that file input is validated and errors are handled cleanly.
- **Quiz structure:** A minimal quiz UI presents one question at a time, tracks score, and offers reset on completion.
- **Separation of concerns:** Parsing, quiz generation, form handling, and UI rendering are modularized for clarity and reuse.

## Known Limitations
- Only supports PDFs with 10 pages or less (hard-coded limit).
- PDF must contain text, not scanned images.
- No persistent storage — quizzes are lost on refresh.
- Generated questions may be inaccurate if PDF content is vague or complex.
- No support for open-ended questions or answer explanations (yet).
