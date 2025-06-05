import { useState, useCallback } from "react";
import { OpenAIClientState } from "@/types";

/**
 * Hook to manage OpenAI client configuration and connection status
 * Provides configuration validation and connection testing
 */
export function useOpenAIClient() {
  const [state, setState] = useState<OpenAIClientState>({
    isConnected: null,
    isTesting: false,
    error: null
  });
  const isReady = state.isConnected === true && !state.isTesting && !state.error;

  /**
   * Test the OpenAI API connection
   */
  const testConnection = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isTesting: true,
      error: null
    }));

    try {
      console.log("🔍 Testing OpenAI API connection...");

      const response = await fetch("/api/openai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setState(prev => ({
        ...prev,
        isTesting: false,
        isConnected: result.success,
        error: result.success ? null : result.error || "Connection test failed"
      }));

      if (result.success) {
        console.log("✅ OpenAI API connection successful");
      } else {
        console.error("❌ OpenAI API connection failed:", result.error);
      }
    } catch (error) {
      console.error("❌ Error testing OpenAI connection:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error during connection test";

      setState(prev => ({
        ...prev,
        isTesting: false,
        isConnected: false,
        error: errorMessage
      }));
    }
  }, []);

  /**
   * Reset the connection state (useful for retry)
   */
  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      isConnected: null,
      isTesting: false,
      error: null
    }));
  }, []);

  return {
    ...state,
    isReady,
    testConnection,
    reset
  };
}
