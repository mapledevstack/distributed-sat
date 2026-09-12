import type { Request, Response, NextFunction } from "express"

import { redis } from "../redis.js"

export const rateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const ip = req.ip ?? "unknown"
  const key = `rate-limit:${ip}`

  const count = await redis.incr(key)

  if (count === 1) {
    await redis.expire(key, 60)
  }

  if (count > 10) {
    res.status(429).json({
      error: "Too many requests",
    })
    return
  }

  next()
}
