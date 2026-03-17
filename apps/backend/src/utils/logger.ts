import { isDev } from "./env";

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

function log(level: LogLevel, message: string, data?: unknown): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(data !== undefined && { data }),
  };

  // In development — pretty print
  if (isDev) {
    const prefix: Record<LogLevel, string> = {
      info: "📘 INFO ",
      warn: "⚠️  WARN ",
      error: "🔴 ERROR",
      debug: "🔍 DEBUG",
    };
    console.log(`${prefix[level]} [${entry.timestamp}] ${message}`, data ?? "");
    return;
  }

  // In production — structured JSON (Railway captures this cleanly)
  console.log(JSON.stringify(entry));
}

export const logger = {
  info: (message: string, data?: unknown) => log("info", message, data),
  warn: (message: string, data?: unknown) => log("warn", message, data),
  error: (message: string, data?: unknown) => log("error", message, data),
  debug: (message: string, data?: unknown) => log("debug", message, data),
};
