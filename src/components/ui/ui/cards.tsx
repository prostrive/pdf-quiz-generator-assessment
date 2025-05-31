import * as React from "react";

import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border",
        "shadow-sm hover:shadow-md transition-all duration-200",
        "backdrop-blur-sm bg-white/95 dark:bg-gray-900/95",
        "border-gray-200 dark:border-gray-800",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        "border-b border-gray-100 dark:border-gray-800",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "text-xl font-semibold tracking-tight",
        "text-gray-900 dark:text-gray-100",
        className
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        "text-sm text-gray-500 dark:text-gray-400",
        "leading-relaxed",
        className
      )}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        "transition-transform hover:scale-105",
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "px-6 py-4",
        "text-gray-700 dark:text-gray-300",
        "leading-relaxed",
        className
      )}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center px-6 py-4",
        "border-t border-gray-100 dark:border-gray-800",
        "bg-gray-50/50 dark:bg-gray-800/50",
        "rounded-b-xl",
        className
      )}
      {...props}
    />
  );
}

// New component for interactive cards
function InteractiveCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="interactive-card"
      className={cn(
        "bg-card text-card-foreground rounded-xl border",
        "shadow-sm hover:shadow-lg transition-all duration-200",
        "hover:scale-[1.02] hover:-translate-y-1",
        "cursor-pointer",
        "backdrop-blur-sm bg-white/95 dark:bg-gray-900/95",
        "border-gray-200 dark:border-gray-800",
        className
      )}
      {...props}
    />
  );
}

// New component for gradient cards
function GradientCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="gradient-card"
      className={cn(
        "bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800",
        "rounded-xl border shadow-sm",
        "hover:shadow-md transition-all duration-200",
        "border-gray-200 dark:border-gray-800",
        className
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  InteractiveCard,
  GradientCard,
};
