# Andre Lagsac: PDF Quiz Generator - Take-Home Assignment

## Prerequisites
- Node.js (v22.14.0 or higher)
- npm (v10.9.2 or higher)
- OpenAI API Key (non-free tier)

## Installation Steps
1. **Setup Environment Variables**
Create a .env file on root folder of the project and add the following variable:
OPENAI_API_KEY=<OPENAI_API_KEY>
2. **Install Node Dependencies:**
```bash
npm install
```

## Run the Website
1. **Start the Development Server**
```bash
npm run dev
```
2. **Open in your browser**
Visit http://localhost:3000 to see the website in action.

## Architecture & Best Practices

### Modular Architecture
- **API Routes:** The OpenAI query is handled on a Next.js API route to keep sensitive logic server-side.
- **Component Separation:** Components are focused and singular, promoting reusability and maintainability.
- **Types Directory:** All TypeScript types are organized in a dedicated `types` folder for better structure.
- **Services Folder:** API and client-side logic are separated into a `services` folder to keep business logic organized.

### Type Safety
- **Zod Validation:** Forms and input data are validated using Zod to ensure correctness.
- **TypeScript:** All variables and function signatures are typed for safer code and better developer experience.

### Error Handling
- **Try/Catch Blocks:** All event functions use `try/catch` to handle errors gracefully.
- **User Feedback:** Errors are displayed to users via toast notifications for immediate feedback.