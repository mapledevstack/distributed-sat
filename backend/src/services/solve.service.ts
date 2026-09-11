import type { Formula } from "../sat/types.js"
import { satQueue } from "../queue/satQueue.js"

export const solveFormula = async (formula: Formula) => {
  const job = await satQueue.add(
    "solve",
    {
      formula,
    },
    {
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
  const job = await satQueue.getJob(jobId)

  if (!job) {
    return null
  }

  return {
    jobId: job.id,
    state: await job.getState(),
    result: job.returnvalue,
    error: job.failedReason,
  }
}
