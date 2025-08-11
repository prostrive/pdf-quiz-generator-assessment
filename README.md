# PDF Quiz Generator

A Next.js + React project styled with Tailwind CSS and shadcn UI components.  
Users can upload a PDF, and the app generates a quiz based on the PDF content using the OpenAI API.

---

## Features

- Upload PDF files with PDF.js
- Extract content from PDF
- Generate quiz questions based on the extracted content using OpenAI API (mocked in development)
- Clean UI built with Tailwind CSS and shadcn UI components
- Fast development experience with Next.js

---

## Tech Stack

- **Next.js** (React framework)  
- **Tailwind CSS** (utility-first CSS)  
- **shadcn UI** (component library)  
- **OpenAI API** (for generating quiz questions)  
- **PDF.js** (for rendering and parsing PDFs)  

---

## Getting Started

### Prerequisites

- Node.js installed (recommended version 16+)  
- npm or yarn package manager  

### Installation

```bash
npm install
```

### Running Dev server

```bash
npm run dev
```

Open http://localhost:3000 to view the app.

Usage
Upload a PDF file using the uploader.

-The app extracts text content from the PDF using PDF.js.
-The extracted content is sent to the OpenAI API to generate quiz questions.
-The generated quiz is displayed on the UI for user interaction.

Challenges
OpenAI API Billing: The OpenAI API requires billing details and no free credits were available during development.
Solution: The OpenAI API calls were mocked with static data to simulate quiz generation.


