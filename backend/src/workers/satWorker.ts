import { Worker, type Job } from "bullmq"
import "dotenv/config"

import { solveChunk } from "../sat/solve.js"
import type { Assignment, Formula } from "../sat/types.js"

import { getRedisConnection } from "../queue/redisConnection.js"
import { SAT_QUEUE_NAME, type SatChunkJobData } from "../queue/satQueue.js"
import {
  cacheSatSolution,
  cacheSatUnsatisfiable,
  hashAndBuildCacheKeys,
} from "../utils/satCache.js"
import {
  completeParentJobAsUnsatisfiable,
  completeParentJobWithSolution,
  failParentJob,
  isSearchExhausted,
  markParentJobProcessing,
  recordChunkCompleted,
  type ChunkProgress,
} from "../services/satJobStore.js"

type SatChunkJob = Job<SatChunkJobData>

const SAT_WORKER_CONCURRENCY = 2

const processSatChunk = async (job: SatChunkJob): Promise<Assignment | null> => {
  const { jobId: parentJobId, formula, start, end } = job.data

  logChunkStarted(job)
  await markParentJobProcessing(parentJobId)

  try {
    const solution = solveChunkInRange(formula, start, end)
    const progress = await recordChunkCompleted(parentJobId)

    if (solution !== null) {
      await publishSatisfyingAssignment(formula, parentJobId, solution)
      return solution
    }

    await finalizeIfSearchExhausted(formula, parentJobId, progress)

    return null
  } catch (error) {
    await failParentJob(parentJobId, error)
    throw error
  }
}

const solveChunkInRange = (
  formula: Formula,
  start: number,
  end: number,
): Assignment | null => solveChunk(formula, start, end)

const publishSatisfyingAssignment = async (
  formula: Formula,
  parentJobId: string,
  solution: Assignment,
): Promise<void> => {
  const { resultCacheKey } = hashAndBuildCacheKeys(formula)

  await cacheSatSolution(resultCacheKey, solution)
  await completeParentJobWithSolution(parentJobId, solution)
}

const finalizeIfSearchExhausted = async (
  formula: Formula,
  parentJobId: string,
  progress: ChunkProgress,
): Promise<void> => {
  if (!isSearchExhausted(progress)) {
    return
  }

  const { resultCacheKey } = hashAndBuildCacheKeys(formula)

  await cacheSatUnsatisfiable(resultCacheKey)
  await completeParentJobAsUnsatisfiable(parentJobId)
}

const describeChunk = (job: Pick<SatChunkJob, "id" | "data">): string => {
  const { start, end } = job.data

  return `${job.id}: ${start} → ${end}`
}

const logChunkStarted = (job: SatChunkJob): void => {
  console.log(`Processing job ${describeChunk(job)}`)
}

export const worker = new Worker<SatChunkJobData>(
  SAT_QUEUE_NAME,
  processSatChunk,
  {
    connection: getRedisConnection(),
    concurrency: SAT_WORKER_CONCURRENCY,
  },
)

worker.on("completed", (job) => {
  console.log(`Job completed ${describeChunk(job)}`)
})

worker.on("failed", (job, error) => {
  if (job) {
    console.error(`Job failed ${describeChunk(job)}`, error)
    return
  }

  console.error("Job failed", error)
})

