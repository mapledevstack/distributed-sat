import { and, eq, sql } from "drizzle-orm"

import { db } from "../db/index.js"
import { jobs } from "../db/schema.js"

import type { Assignment } from "../sat/types.js"

export interface ChunkProgress {
  completedChunks: number
  totalChunks: number
}

export const isSearchExhausted = (progress: ChunkProgress): boolean =>
  progress.completedChunks >= progress.totalChunks

export const createQueuedParentJob = async (args: {
  jobId: string
  formula: unknown
  formulaHash: string
  totalChunks: number
}): Promise<void> => {
  await db.insert(jobs).values({
    id: args.jobId,
    status: "queued",
    formula: args.formula,
    formulaHash: args.formulaHash,
    totalChunks: args.totalChunks,
  })
}

export const markParentJobProcessing = async (
  parentJobId: string,
): Promise<void> => {
  await db
    .update(jobs)
    .set({
      status: "processing",
    })
    .where(and(eq(jobs.id, parentJobId), eq(jobs.status, "queued")))
}

export const recordChunkCompleted = async (
  parentJobId: string,
): Promise<ChunkProgress> => {
  const [progress] = await db
    .update(jobs)
    .set({ completedChunks: sql`${jobs.completedChunks} + 1` })
    .where(eq(jobs.id, parentJobId))
    .returning({
      completedChunks: jobs.completedChunks,
      totalChunks: jobs.totalChunks,
    })

  return progress
}

export const completeParentJobWithSolution = async (
  parentJobId: string,
  solution: Assignment,
): Promise<void> => {
  await db
    .update(jobs)
    .set({
      status: "completed",
      result: solution,
      completedAt: new Date(),
    })
    .where(and(eq(jobs.id, parentJobId), eq(jobs.status, "processing")))
}

export const completeParentJobAsUnsatisfiable = async (
  parentJobId: string,
): Promise<void> => {
  await db
    .update(jobs)
    .set({ status: "unsatisfiable", completedAt: new Date() })
    .where(eq(jobs.id, parentJobId))
}

export const failParentJob = async (
  parentJobId: string,
  error: unknown,
): Promise<void> => {
  await db
    .update(jobs)
    .set({
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
      completedAt: new Date(),
    })
    .where(eq(jobs.id, parentJobId))
}
