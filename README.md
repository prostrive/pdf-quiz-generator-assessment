# PDF Quiz Generator

A modern web application that converts PDF documents into interactive quizzes using AI. Upload any PDF document and automatically generate multiple-choice questions based on the content.

![PDF Quiz Generator](https://img.shields.io/badge/Next.js-15.3.3-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4)
![OpenAI](https://img.shields.io/badge/OpenAI-API-green)

## 🚀 Features

### Core Functionality

- **PDF Upload & Validation**: Secure file upload with comprehensive validation
- **Intelligent Text Extraction**: Extract and preprocess content from PDF documents
- **AI-Powered Quiz Generation**: Generate contextual multiple-choice questions using OpenAI
- **Interactive Quiz Interface**: Take quizzes with real-time scoring and feedback
- **Comprehensive Error Handling**: Robust error handling for various edge cases

### Advanced Features

- **Content Preprocessing**: Intelligent content optimization for better quiz generation
- **Progress Tracking**: Real-time upload and processing progress indicators
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Type Safety**: Full TypeScript implementation for enhanced reliability

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 3.4 + Shadcn/UI components
- **PDF Processing**: PDF.js (Mozilla)
- **AI Integration**: OpenAI API
- **State Management**: React Hooks + Custom hooks
- **Build Tool**: Turbopack (development)

## 📋 Prerequisites

Before running the application, ensure you have:

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **OpenAI API Key** (from [OpenAI Platform](https://platform.openai.com/))

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pdf-quiz-generator-assessment
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Model Configuration (defaults to gpt-4)
OPENAI_MODEL=gpt-4
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 API Key Setup

### Getting Your OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Click **"Create new secret key"**
5. Copy the generated API key
6. Add it to your `.env.local` file as shown above

### Important Security Notes

- **Never commit your API key** to version control
- **Keep your `.env.local` file private**
- **Monitor your API usage** on the OpenAI dashboard
- **Set usage limits** to avoid unexpected charges

## 📖 Usage Guide

### Uploading a PDF

1. **Select Upload Method**: Choose between "Browse Files" or "Drag & Drop"
2. **Choose Your File**: Select a PDF document (max 10MB)
3. **File Validation**: The system automatically validates:
   - File type (PDF only)
   - PDF structure integrity
   - Content extractability

### Quiz Generation Process

1. **Text Extraction**: PDF content is extracted and processed
2. **Content Preprocessing**: Text is optimized for AI processing
3. **AI Generation**: OpenAI generates multiple-choice questions
4. **Quiz Interface**: Interactive quiz with navigation and scoring

### File Requirements

- **Format**: PDF files only
- **Size Limit**: Maximum 10MB
- **Content**: Text-based PDFs work best
- **Recommended**: Under 3MB for faster processing

## 🔧 Configuration

### Environment Variables

| Variable                    | Description              | Required | Default           |
| --------------------------- | ------------------------ | -------- | ----------------- |
| `OPENAI_API_KEY`            | Your OpenAI API key      | Yes      | -                 |
| `OPENAI_MODEL`              | OpenAI model to use      | No       | `gpt-4`           |
| `NEXT_PUBLIC_MAX_FILE_SIZE` | Max upload size in bytes | No       | `10485760` (10MB) |

### Customizing File Validation

Edit `src/lib/fileValidation.ts` to modify validation settings:

```typescript
export const FILE_VALIDATION_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ["application/pdf"],
  allowedExtensions: [".pdf"]
};
```

## 🏗️ Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── openai/           # OpenAI integration
│   │   └── quiz/             # Quiz generation
│   └── quiz/                 # Quiz taking interface
├── components/               # React components
│   ├── ui/                   # Reusable UI components
│   └── [features]/           # Feature-specific components
├── hooks/                    # Custom React hooks
├── lib/                      # Utility libraries
│   ├── fileValidation.ts     # PDF validation logic
│   ├── pdfTextExtraction.ts  # PDF processing
│   ├── quizGeneration.ts     # Quiz creation logic
│   └── openai.ts             # OpenAI API integration
└── types/                    # TypeScript type definitions
```

## 🧪 Development

### Available Scripts

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Linting
npm run lint
```

### Code Quality

The project includes:

- **ESLint** for code linting
- **TypeScript** for type safety
- **Tailwind CSS** for consistent styling
- **Custom hooks** for state management
- **Error boundaries** for graceful error handling

## 🚨 Troubleshooting

### Common Issues

#### PDF Upload Problems

**Issue**: "File format not supported"

- **Solution**: Ensure the file is a valid PDF with `.pdf` extension
- **Check**: File isn't renamed from another format (e.g., `.docx.pdf`)

**Issue**: "File too large"

- **Solution**: Use a PDF under 10MB or compress the PDF
- **Tools**: Adobe Acrobat, SmallPDF, or similar compression tools

#### Text Extraction Issues

**Issue**: "No text found in PDF"

- **Solution**: PDF may be image-based or encrypted
- **Fix**: Use text-based PDFs or convert image PDFs using OCR tools

**Issue**: "Content preprocessing failed"

- **Solution**: PDF content may be too complex or corrupted
- **Fix**: Try a different PDF or simplify the document

#### API Issues

**Issue**: "OpenAI API error"

- **Check**: Verify your API key is correct and active
- **Check**: Ensure you have sufficient API credits
- **Check**: Network connectivity and firewall settings

**Issue**: "Rate limit exceeded"

- **Solution**: Wait a few minutes before trying again
- **Fix**: Upgrade your OpenAI API plan for higher limits

#### Performance Issues

**Issue**: "Slow processing"

- **Solution**: Large files take longer to process
- **Optimization**: Use smaller PDFs (under 3MB recommended)
- **Check**: Ensure stable internet connection

### Getting Help

1. **Check the Console**: Browser developer tools show detailed error messages
2. **Review File Requirements**: Ensure your PDF meets all criteria
3. **Verify API Setup**: Double-check your OpenAI API key configuration
4. **File an Issue**: Report bugs with detailed reproduction steps

## 🛡️ Security Considerations

- **API Key Protection**: Environment variables keep sensitive data secure
- **File Validation**: Comprehensive validation prevents malicious uploads
- **Input Sanitization**: All user inputs are validated and sanitized
- **Error Handling**: Graceful error handling prevents information leakage

## ⚠️ Known Limitations and Areas for Improvement

### Current Limitations

#### 1. PDF Processing Constraints

- **Text-only PDFs**: Cannot extract text from scanned/image-based PDFs
- **Complex Layouts**: Tables, charts, and multi-column layouts may be misinterpreted
- **File Size Limits**: 10MB browser memory constraints
- **Language Support**: Optimized for English content only

#### 2. AI Generation Dependencies

- **API Reliability**: Requires stable internet connection and OpenAI service availability
- **Cost Implications**: Each quiz generation consumes API tokens (~1,000-3,000 tokens)
- **Quality Variance**: AI-generated questions may vary in relevance and difficulty
- **Rate Limits**: Subject to OpenAI's usage quotas (typically 3 requests/minute for free tier)

#### 3. Question Validation Limitations

- **Short-Answer Scoring**: Basic text matching without semantic understanding
- **No Partial Credit**: Binary correct/incorrect scoring only
- **Limited Acceptable Answers**: Must manually define answer variations in AI prompt

#### 4. User Experience Gaps

- **No Question Editing**: Cannot modify questions after generation
- **No Question Preview**: Cannot review all questions before starting quiz

### Areas for Improvement

#### High Priority Enhancements

1. **Advanced Answer Validation**

   ```typescript
   // Semantic similarity scoring for short answers
   const similarity = await openai.embeddings.create({
     input: [correctAnswer, userAnswer],
     model: "text-embedding-ada-002"
   });
   ```

2. **OCR Integration**
   ```typescript
   // Support for image-based PDFs
   import Tesseract from "tesseract.js";
   const extractTextFromImages = async (pdfImages: ImageData[]) => {
     // OCR processing logic
   };
   ```

#### Medium Priority Features

- **Export Capabilities**: PDF/Word export of generated quizzes
- **Batch Processing**: Multiple PDF upload and processing
- **Analytics Dashboard**: Question performance and user statistics

#### Technical Debt and Refactoring

- **Monitoring**: Error tracking (Sentry), performance monitoring
- **Testing**: Unit tests, integration tests, E2E tests
- **CI/CD**: Automated testing and deployment pipeline
- **Performance**: Virtualization for large question sets
- **Internationalization**: Multi-language support
