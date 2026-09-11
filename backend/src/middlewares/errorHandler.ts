import type { NextFunction, Request, Response } from "express"

export class AppError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 500) {
    super(message)
    this.name = "AppError"
    this.statusCode = statusCode
  }
}

type ErrorWithStatus = Error & { statusCode?: number; status?: number }

export const errorHandler = (
  err: ErrorWithStatus,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = err.statusCode ?? err.status ?? 500
  const message = err.message || "Internal Server Error"

  if (statusCode >= 500) {
    console.error(err)
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== "production" && statusCode >= 500
      ? { stack: err.stack }
      : {}),
  })
}
