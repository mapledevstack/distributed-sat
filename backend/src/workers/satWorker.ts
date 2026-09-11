import { Worker } from "bullmq"
import "dotenv/config"

const worker = new Worker(
  "sat-jobs",
  async (job) => {
    console.log("Processing job:", job.id)
    console.log("Formula:", job.data.formula)
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  },
)

worker.on("completed", (job) => {
  console.log("Job completed:", job.id)
})

worker.on("failed", (job, error) => {
  console.error("Job failed:", job?.id, error)
})
