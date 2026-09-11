import { Worker } from "bullmq"
import "dotenv/config"

import solve from "../sat/solve.js"

import { jobs } from "../db/schema.js"
import { db } from "../db/index.js"
import { eq } from "drizzle-orm"

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

    try {
      const formula = job.data.formula

      const solution = solve(formula)

      await db
        .update(jobs)
        .set({
          status: "completed",
          result: solution,
          completedAt: new Date(),
        })
        .where(eq(jobs.id, job.id!))

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
