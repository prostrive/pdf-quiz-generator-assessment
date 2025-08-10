# PDF Quiz Generator - Take-Home Assignment

## Installation and Setup Instructions

- Clone the repository https://github.com/berniesonsahagun/pdf-quiz-generator-assessment.
- Install the dependencies by typing `npm install` on the terminal.
- Create your account on https://platform.openai.com/ and generate an API Key.
- Add the API key to a `.env.local` file. See `.env.local.example` for more details.
- Run the project by typing `npm run dev` on the terminal.

## Additional Libraries and/or Tools Added

Added [Natural](https://github.com/NaturalNode/natural) to preprocess the PDF before making a request to OpenAI.

## Approach and Design Decisions

My approach on this assessment is to create the user flow and user interface first when answering the quiz, and when uploading the file to the application. After the user flow is established, I decided on the data structure of the questions object. I decided that the Questions object look like this

```
[
    {
        "question": string,
        "choices": Array<string>,
        "answer": number
    }
]

Question: This is the question text.
Choices: This is an array of choices generated.
Answer: This is the index of the correct answer on the Choices array.
```

Next, I tested each feature like uploading File, parsing the text on the PDF file, and then using OpenAI API. At this point, the features are now tested and the code is already written. I started integrating each feature with each other, adding error handlings, toasts for user experience and notifications, and lastly refactored the code by code splitting.

## Known Limitations or Areas for Improvement

### The application can only generate multiple choice questions.

- We can improve the application by allowing the AI to generate text-based questions. However, the difficulty of scoring the quiz will rise up. We can delegate the scoring to the AI too if that happens.

### The application does not store anything. The questions generated and answers submitted are not stored nor cached.

- This means that the generated quiz is not saved and will be gone when the window is closed.
- We can address this by adding client-side persistence like storing on the browser localStorage. This is a quick-solution and not a complete one since not every quiz can be stored inside the localStorage.
- Another solution is to create a database linked to their accounts. In this way, we can build a full application the would offer backtracking to previous quizzes as well as their solutions.

### The application cannot process images from the PDF.

- Information from images inside the PDF are not included in the generation of quizzes.
- To address this, we can include the images to the data that we send to OpenAI API. However, cost would be an issue as it is costly to send and process images.

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [PDF.js Library](https://mozilla.github.io/pdf.js/)
- [Natural](https://github.com/NaturalNode/natural)
