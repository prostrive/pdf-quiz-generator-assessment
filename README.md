
* Client-side PDF text extraction to avoid uploading large files, reducing bandwidth and network latency.
* Extract content only from PDF pages matching key sections.
* Used `Langchain` with string templates for cleaner, reusable code and better separation of concerns.
* Used `@tanstack/react-query` for efficient data fetching, caching, mutations, and state management.
* Used `Zod` for runtime data validation and TS type safety.
* Created a custom `withCatchAsync` utility for error handling without try/catch boilerplate, inspired by Go’s error style.
* Added standardized, extensible, and type-safe error handling for clearer and consistent error messages.