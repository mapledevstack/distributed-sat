import type { Formula } from "../sat/types.js"
import { countTotalAssignments } from "../sat/variables.js"
import {
  pickChunkSize,
  splitSearchSpace,
  type SearchChunk,
} from "../sat/chunks.js"
import { enqueueSatChunk } from "../queue/satQueue.js"
import {
  hashAndBuildCacheKeys,
  readCachedSatResult,
  releaseSolveLock,
  tryAcquireSolveLock,
} from "../utils/satCache.js"
import {
  createChunkRows,
  createQueuedParentJob,
  listChunksForJob,
} from "./satJobStore.js"

import { db } from "../db/index.js"
import { jobs } from "../db/schema.js"
import { eq } from "drizzle-orm"

export const solveFormula = async (
  formula: Formula,
  requestedChunkSize?: number,
) => {
  const { formulaHash, resultCacheKey, solveLockKey } =
    hashAndBuildCacheKeys(formula)

  const cachedResult = await readCachedSatResult(resultCacheKey)
  if (cachedResult) {
    return returnCachedResult(cachedResult)
  }

  const isNewSearch = await tryAcquireSolveLock(solveLockKey)
  if (!isNewSearch) {
    return returnDuplicateSearch()
  }

  try {
    const jobId = crypto.randomUUID()
    const totalAssignments = countTotalAssignments(formula)
    const chunkSize = requestedChunkSize ?? pickChunkSize(totalAssignments)
    const chunks = splitSearchSpace(totalAssignments, chunkSize)

    await createQueuedParentJob({
      jobId,
      formula,
      formulaHash,
      totalChunks: chunks.length,
      totalAssignments,
      chunkSize,
    })
    await enqueueAllChunks(jobId, formula, chunks)

    return { cached: false, jobId, totalChunks: chunks.length, chunkSize }
  } catch (error) {
    await releaseSolveLock(solveLockKey)
    throw error
  }
}

const returnCachedResult = (cachedResult: string) => ({
  cached: true as const,
  result: JSON.parse(cachedResult),
})

const returnDuplicateSearch = () => ({
  cached: false as const,
  duplicate: true as const,
  message: "This formula is already being solved",
})

const enqueueAllChunks = async (
  jobId: string,
  formula: Formula,
  chunks: SearchChunk[],
): Promise<void> => {
  const chunkRanges = buildChunkRanges(chunks)

  await createChunkRows(jobId, chunkRanges)
  await enqueueChunkJobs(jobId, formula, chunks, chunkRanges)
}

const buildChunkRanges = (
  chunks: SearchChunk[],
): Array<{ start: number; end: number; chunkJobId: string }> =>
  chunks.map(({ start, end }) => ({
    start,
    end,
    chunkJobId: crypto.randomUUID(),
  }))

const enqueueChunkJobs = async (
  jobId: string,
  formula: Formula,
  chunks: SearchChunk[],
  chunkRanges: Array<{ start: number; end: number; chunkJobId: string }>,
): Promise<void> => {
  for (const [chunkIndex, { start, end }] of chunks.entries()) {
    const { chunkJobId } = chunkRanges[chunkIndex]

    await enqueueSatChunk({ jobId, chunkId: chunkJobId, chunkIndex, formula, start, end })
  }
}

export const getSolveJob = async (jobId: string) => {
  const result = await db.select().from(jobs).where(eq(jobs.id, jobId))

  if (result.length === 0) {
    return null
  }

  const chunks = await listChunksForJob(jobId)

  return { ...result[0], chunks }
}

export const getSolveJobChunks = async (jobId: string) => {
  const result = await db.select().from(jobs).where(eq(jobs.id, jobId))

  if (result.length === 0) {
    return null
  }

  const chunks = await listChunksForJob(jobId)

  return { job: result[0], chunks }
}
