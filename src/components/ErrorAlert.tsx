import React from "react";

type ErrorAlertProps = {
  message: string;
};

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => (
  <div className="mt-2 p-2 border border-red-300 rounded bg-red-50 text-red-700 max-w-xl w-full text-xs" role="alert" aria-live="assertive">
    <strong>Error:</strong> {message}
  </div>
);

export default ErrorAlert; 