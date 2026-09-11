import type { NextFunction, Request, Response } from "express"
import { AppError } from "./errorHandler.js"

export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Not Found - ${req.originalUrl}`, 404))
}
