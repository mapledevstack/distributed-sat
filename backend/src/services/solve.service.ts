import type { Formula } from "../sat/types.js"
import { satQueue } from "../queue/satQueue.js"
import { jobs } from "../db/schema.js"
import { db } from "../db/index.js"
import { eq } from "drizzle-orm"

export const solveFormula = async (formula: Formula) => {
  const jobId = crypto.randomUUID()

  await db.insert(jobs).values({
    id: jobId,
    status: "queued",
    formula,
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
