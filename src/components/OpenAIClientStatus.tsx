"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useOpenAIClient } from "@/hooks/useOpenAIClient";

interface Props {
  onClientReady?: () => void;
  autoTest?: boolean; // Automatically test connection when configured
}

/**
 * Component to display OpenAI client configuration and connection status
 * Shows configuration validation, connection testing, and error states
 */
export function OpenAIClientStatus({ onClientReady, autoTest = true }: Props) {
  const { isConnected, isTesting, error, isReady, testConnection, reset } = useOpenAIClient();

  // Notify parent when client is ready
  useEffect(() => {
    if (isReady && onClientReady) {
      onClientReady();
    }
  }, [isReady, onClientReady]);

  // Auto-test connection when configured
  useEffect(() => {
    if (autoTest && isConnected === null && !isTesting) {
      testConnection();
    }
  }, [isConnected, isTesting, testConnection, autoTest]);

  // Testing connection
  if (isTesting) {
    return (
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <LoadingSpinner size="small" />
        <div className="text-sm text-blue-700">Testing OpenAI API connection...</div>
      </div>
    );
  }

  // Connection error
  if (error || isConnected === false) {
    return (
      <div className="space-y-3">
        <ErrorMessage type="error" message={error || "OpenAI API connection failed"} dismissible={false} />
        <div className="flex gap-2">
          <Button onClick={testConnection} variant="destructive" size="sm">
            Retry Connection
          </Button>
          <Button onClick={reset} variant="outline" size="sm">
            Reset
          </Button>
        </div>
      </div>
    );
  }

  // Connected and ready
  if (isConnected) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium text-green-800">OpenAI API Ready</span>
        </div>
        <div className="text-xs text-green-600">Quiz generation is available • API connection verified</div>
      </div>
    );
  }

  // Not tested yet
  return (
    <div className="space-y-3">
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
          <span className="text-sm font-medium text-gray-800">OpenAI API Not Tested</span>
        </div>
        <div className="text-xs text-gray-600">Click below to test the API connection</div>
      </div>

      <Button onClick={testConnection} variant="outline" size="sm">
        Test OpenAI Connection
      </Button>
    </div>
  );
}
