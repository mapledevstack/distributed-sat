import { Worker } from "bullmq"
import "dotenv/config"
import solve from "../sat/solve.js"

const worker = new Worker(
  "sat-jobs",
  async (job) => {
    console.log("Processing job:", job.id)

    const formula = job.data.formula

    const solution = solve(formula)

    console.log("Solution:", solution)

    return solution
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
