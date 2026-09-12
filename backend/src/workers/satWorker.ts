import { Worker } from "bullmq"
import "dotenv/config"

import solve from "../sat/solve.js"

import { jobs } from "../db/schema.js"
import { db } from "../db/index.js"
import { eq } from "drizzle-orm"
import { hashFormula } from "../utils/hash.js"
import { redis } from "../redis.js"

const worker = new Worker(
  "sat-jobs",
  async (job) => {
    console.log("Processing job:", job.id)

    await db
      .update(jobs)
      .set({
        status: "processing",
      })
      .where(eq(jobs.id, job.id!))

    const formula = job.data.formula
    const formulaHash = hashFormula(formula)

    const cacheKey = `sat:result:${formulaHash}`
    const lockKey = `sat:lock:${formulaHash}`

    try {
      const solution = solve(formula)

      await redis.set(cacheKey, JSON.stringify(solution))

      await db
        .update(jobs)
        .set({
          status: "completed",
          result: solution,
          completedAt: new Date(),
        })
        .where(eq(jobs.id, job.id!))

      await redis.del(lockKey)

      return solution
    } catch (error) {
      await db
        .update(jobs)
        .set({
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
          completedAt: new Date(),
        })
        .where(eq(jobs.id, job.id!))

      await redis.del(lockKey)

      throw error
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
    concurrency: 2,
  },
)

worker.on("completed", (job) => {
  console.log("Job completed:", job.id)
})

worker.on("failed", (job, error) => {
  console.error("Job failed:", job?.id, error)
})
