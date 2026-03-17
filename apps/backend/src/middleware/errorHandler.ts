import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { isDev } from "../utils/env";

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  const statusCode = err.statusCode ?? 500;

  logger.error(`${req.method} ${req.path} — ${err.message}`, {
    statusCode,
    stack: isDev ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? "Internal server error." : err.message,
    // Only expose stack trace in development
    ...(isDev && { stack: err.stack }),
  });
}
