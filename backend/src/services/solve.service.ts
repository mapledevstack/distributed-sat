import type { Formula } from "../sat/types.js"
import { satQueue } from "../queue/satQueue.js"
import { jobs } from "../db/schema.js"
import { db } from "../db/index.js"
import { eq } from "drizzle-orm"
import { hashFormula } from "../utils/hash.js"
import { redis } from "../redis.js"

export const solveFormula = async (formula: Formula) => {
  const jobId = crypto.randomUUID()
  const formulaHash = hashFormula(formula)

  const cacheKey = `sat:result:${formulaHash}`
  const cachedResult = await redis.get(cacheKey)

  if (cachedResult) {
    return {
      cached: true,
      result: JSON.parse(cachedResult),
    }
  }

  const lockKey = `sat:lock:${formulaHash}`

  const lockAcquired = await redis.set(lockKey, "1", "EX", 60, "NX")

  if (!lockAcquired) {
    return {
      cached: false,
      duplicate: true,
      message: "This formula is already being solved",
    }
  }

  await db.insert(jobs).values({
    id: jobId,
    status: "queued",
    formula,
    formulaHash,
  })

  const job = await satQueue.add(
    "solve",
    {
      formula,
    },
    {
      jobId,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    },
  )

  return {
    cached: false,
    jobId: job.id,
  }
}

export const getSolveJob = async (jobId: string) => {
  const result = await db.select().from(jobs).where(eq(jobs.id, jobId))

  if (result.length === 0) {
    return null
  }

  return result[0]
}
