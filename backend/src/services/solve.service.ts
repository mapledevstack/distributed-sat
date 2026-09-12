import type { Formula } from "../sat/types.js"
import { countTotalAssignments } from "../sat/variables.js"
import { splitSearchSpace, type SearchChunk } from "../sat/chunks.js"
import { enqueueSatChunk } from "../queue/satQueue.js"
import {
  hashAndBuildCacheKeys,
  readCachedSatResult,
  tryAcquireSolveLock,
} from "../utils/satCache.js"
import { createQueuedParentJob } from "./satJobStore.js"

import { db } from "../db/index.js"
import { jobs } from "../db/schema.js"
import { eq } from "drizzle-orm"

const SAT_CHUNK_SIZE = 8

export const solveFormula = async (formula: Formula) => {
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

  const jobId = crypto.randomUUID()
  const totalAssignments = countTotalAssignments(formula)
  const chunks = splitSearchSpace(totalAssignments, SAT_CHUNK_SIZE)

  await createQueuedParentJob({
    jobId,
    formula,
    formulaHash,
    totalChunks: chunks.length,
  })
  await enqueueAllChunks(jobId, formula, chunks)

  return { cached: false, jobId }
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
  for (const { start, end } of chunks) {
    await enqueueSatChunk({ jobId, formula, start, end })
  }
}

export const getSolveJob = async (jobId: string) => {
  const result = await db.select().from(jobs).where(eq(jobs.id, jobId))

  if (result.length === 0) {
    return null
  }

  return result[0]
}
