import { Queue } from "bullmq"
import "dotenv/config"

export const satQueue = new Queue("sat-jobs", {
  connection: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
})

satQueue.on("error", (error) => {
  console.error("Redis connection error:", error)
})
