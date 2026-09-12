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
  releaseSolveLock,
} from "../utils/satCache.js"
import {
  completeParentJobAsUnsatisfiable,
  completeParentJobWithSolution,
  failParentJob,
  isSearchExhausted,
  markChunkFinished,
  markChunkStarted,
  markParentJobProcessing,
  recordChunkCompleted,
  type ChunkProgress,
} from "../services/satJobStore.js"

type SatChunkJob = Job<SatChunkJobData>

const SAT_WORKER_CONCURRENCY = 2
const WORKER_ID =
  process.env.WORKER_ID ??
  `worker-${process.pid}-${crypto.randomUUID().slice(0, 8)}`

const describeChunkRange = (start: number, end: number): string =>
  `masks [${start}, ${end})`

const processSatChunk = async (
  job: SatChunkJob,
): Promise<Assignment | null> => {
  const {
    jobId: parentJobId,
    chunkId,
    chunkIndex,
    formula,
    start,
    end,
  } = job.data

  logChunkStarted(chunkIndex, start, end)
  await markParentJobProcessing(parentJobId)
  await markChunkStarted(chunkId, WORKER_ID)

  try {
    const solution = solveChunkInRange(formula, start, end)
    const progress = await recordChunkCompleted(parentJobId)

    if (solution !== null) {
      await markChunkFinished(chunkId, "completed", solution)
      await publishSatisfyingAssignment(formula, parentJobId, solution)
      logChunkSolved(chunkIndex, start, end)
      return solution
    }

    await markChunkFinished(chunkId, "exhausted", null)
    await finalizeIfSearchExhausted(formula, parentJobId, progress)
    logChunkExhausted(chunkIndex, start, end)

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
  const { resultCacheKey, solveLockKey } = hashAndBuildCacheKeys(formula)

  await cacheSatSolution(resultCacheKey, solution)
  await completeParentJobWithSolution(parentJobId, solution)
  await releaseSolveLock(solveLockKey)
}

const finalizeIfSearchExhausted = async (
  formula: Formula,
  parentJobId: string,
  progress: ChunkProgress,
): Promise<void> => {
  if (!isSearchExhausted(progress)) {
    return
  }

  const { resultCacheKey, solveLockKey } = hashAndBuildCacheKeys(formula)

  await cacheSatUnsatisfiable(resultCacheKey)
  await completeParentJobAsUnsatisfiable(parentJobId)
  await releaseSolveLock(solveLockKey)
}

const logChunkStarted = (chunkIndex: number, start: number, end: number) => {
  console.log(
    `[${WORKER_ID}] started chunk #${chunkIndex} ${describeChunkRange(start, end)}`,
  )
}

const logChunkSolved = (chunkIndex: number, start: number, end: number) => {
  console.log(
    `[${WORKER_ID}] chunk #${chunkIndex} ${describeChunkRange(start, end)} found a solution`,
  )
}

const logChunkExhausted = (
  chunkIndex: number,
  start: number,
  end: number,
) => {
  console.log(
    `[${WORKER_ID}] chunk #${chunkIndex} ${describeChunkRange(start, end)} exhausted`,
  )
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
  console.log(
    `[${WORKER_ID}] bullmq job ${job.id} (chunk #${job.data.chunkIndex}) completed`,
  )
})

worker.on("failed", (job, error) => {
  if (job) {
    console.error(
      `[${WORKER_ID}] bullmq job ${job.id} (chunk #${job.data.chunkIndex}) failed`,
      error,
    )
    return
  }

  console.error(`[${WORKER_ID}] bullmq job failed`, error)
})
