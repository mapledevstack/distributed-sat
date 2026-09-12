import { Queue } from "bullmq"
import "dotenv/config"

import type { Formula } from "../sat/types.js"
import { getRedisConnection } from "./redisConnection.js"

export interface SatChunkJobData {
  jobId: string
  chunkId: string
  chunkIndex: number
  formula: Formula
  start: number
  end: number
}

export const SAT_QUEUE_NAME = "sat-jobs"
export const SAT_JOB_NAME = "solve"
export const SAT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: "exponential" as const,
    delay: 1000,
  },
}

export const satQueue = new Queue<SatChunkJobData>(SAT_QUEUE_NAME, {
  connection: getRedisConnection(),
})

export const enqueueSatChunk = async (
  data: SatChunkJobData,
): Promise<string | undefined> => {
  const enqueued = await satQueue.add(SAT_JOB_NAME, data, SAT_JOB_OPTIONS)

  return enqueued.id
}

satQueue.on("error", (error) => {
  console.error("Redis connection error:", error)
})

