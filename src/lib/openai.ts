import OpenAI from "openai";

// OpenAI client configuration
const OPENAI_CONFIG = {
  // Request timeout in milliseconds (30 seconds)
  timeout: 30000,
  // Maximum retries for failed requests
  maxRetries: 3,
  // Model to use for quiz generation
  model: "gpt-3.5-turbo" as const,
  // Maximum tokens for response
  maxTokens: 1500,
  // Temperature for response creativity (0.1 for more deterministic responses)
  temperature: 0.1
} as const;

/**
 * OpenAI client instance
 * Configured with API key from environment variables
 */
let openaiClient: OpenAI | null = null;

/**
 * Initialize OpenAI client with configuration
 * @returns Configured OpenAI client instance
 */
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new OpenAIConfigError(
        "OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables."
      );
    }

    openaiClient = new OpenAI({
      apiKey,
      timeout: OPENAI_CONFIG.timeout,
      maxRetries: OPENAI_CONFIG.maxRetries
    });

    console.log("✅ OpenAI client initialized successfully");
  }

  return openaiClient;
}

/**
 * Custom error class for OpenAI configuration issues
 */
export class OpenAIConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenAIConfigError";
  }
}

/**
 * Custom error class for OpenAI API issues
 */
export class OpenAIAPIError extends Error {
  public statusCode?: number;
  public type?: string;

  constructor(message: string, statusCode?: number, type?: string) {
    super(message);
    this.name = "OpenAIAPIError";
    this.statusCode = statusCode;
    this.type = type;
  }
}

/**
 * Test OpenAI API connection
 * @returns Promise indicating if connection is successful
 */
export async function testOpenAIConnection(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const client = getOpenAIClient();

    // Make a simple request to test the connection
    const response = await client.chat.completions.create({
      model: OPENAI_CONFIG.model,
      messages: [
        {
          role: "user",
          content: "Test connection. Please respond with 'OK'."
        }
      ],
      max_tokens: 10,
      temperature: 0
    });

    if (response.choices && response.choices.length > 0) {
      console.log("✅ OpenAI API connection test successful");

      return { success: true };
    } else {
      return { success: false, error: "No response from OpenAI API" };
    }
  } catch (error) {
    console.error("❌ OpenAI API connection test failed:", error);

    if (error instanceof OpenAI.APIError) {
      return {
        success: false,
        error: `API Error: ${error.message} (Status: ${error.status})`
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Make a request to OpenAI API with retry logic and error handling
 * @param requestFn - Function that makes the OpenAI API request
 * @returns Promise with the API response
 */
export async function makeOpenAIRequest<T>(requestFn: (client: OpenAI) => Promise<T>): Promise<T> {
  try {
    const client = getOpenAIClient();
    const result = await requestFn(client);

    return result;
  } catch (error) {
    console.error("❌ OpenAI API request failed:", error);

    // Handle different types of OpenAI errors
    if (error instanceof OpenAI.APIError) {
      throw new OpenAIAPIError(`OpenAI API Error: ${error.message}`, error.status, error.type);
    }

    if (error instanceof OpenAI.APIConnectionError) {
      throw new OpenAIAPIError(
        "Failed to connect to OpenAI API. Please check your internet connection.",
        0,
        "connection_error"
      );
    }

    if (error instanceof OpenAI.RateLimitError) {
      throw new OpenAIAPIError("OpenAI API rate limit exceeded. Please try again later.", 429, "rate_limit");
    }

    if (error instanceof OpenAI.AuthenticationError) {
      throw new OpenAIAPIError(
        "OpenAI API authentication failed. Please check your API key.",
        401,
        "authentication_error"
      );
    }

    // Re-throw other errors
    throw error instanceof Error ? error : new Error(String(error));
  }
}

// Export the client getter function
export { getOpenAIClient };
