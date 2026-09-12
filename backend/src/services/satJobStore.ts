import { and, asc, eq, sql } from "drizzle-orm"

import { db } from "../db/index.js"
import { chunks, jobs } from "../db/schema.js"

import type { Assignment } from "../sat/types.js"

export type ChunkStatus = "queued" | "processing" | "completed" | "exhausted"

export interface ChunkProgress {
  completedChunks: number
  totalChunks: number
}

export interface ChunkRow {
  id: string
  jobId: string
  chunkIndex: number
  start: number
  end: number
  status: ChunkStatus
  result: Assignment | null
  workerId: string | null
  startedAt: Date | null
  completedAt: Date | null
}

export const isSearchExhausted = (progress: ChunkProgress): boolean =>
  progress.completedChunks >= progress.totalChunks

export const createQueuedParentJob = async (args: {
  jobId: string
  formula: unknown
  formulaHash: string
  totalChunks: number
  totalAssignments: number
  chunkSize: number
}): Promise<void> => {
  await db.insert(jobs).values({
    id: args.jobId,
    status: "queued",
    formula: args.formula,
    formulaHash: args.formulaHash,
    totalChunks: args.totalChunks,
    totalAssignments: args.totalAssignments,
    chunkSize: args.chunkSize,
  })
}

export const createChunkRows = async (
  jobId: string,
  ranges: Array<{ start: number; end: number; chunkJobId: string }>,
): Promise<void> => {
  await db.insert(chunks).values(
    ranges.map((range, chunkIndex) => ({
      id: range.chunkJobId,
      jobId,
      chunkIndex,
      start: range.start,
      end: range.end,
      status: "queued",
    })),
  )
}

export const markChunkStarted = async (
  chunkJobId: string,
  workerId: string,
): Promise<void> => {
  await db
    .update(chunks)
    .set({ status: "processing", workerId, startedAt: new Date() })
    .where(and(eq(chunks.id, chunkJobId), eq(chunks.status, "queued")))
}

export const markChunkFinished = async (
  chunkJobId: string,
  status: Extract<ChunkStatus, "completed" | "exhausted">,
  result: Assignment | null,
): Promise<void> => {
  await db
    .update(chunks)
    .set({ status, result, completedAt: new Date() })
    .where(eq(chunks.id, chunkJobId))
}

export const listChunksForJob = async (jobId: string): Promise<ChunkRow[]> => {
  const rows = await db
    .select()
    .from(chunks)
    .where(eq(chunks.jobId, jobId))
    .orderBy(asc(chunks.chunkIndex))

  return rows.map((row) => ({
    id: row.id,
    jobId: row.jobId,
    chunkIndex: row.chunkIndex,
    start: row.start,
    end: row.end,
    status: row.status as ChunkStatus,
    result: (row.result ?? null) as Assignment | null,
    workerId: row.workerId,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
  }))
}

export const markParentJobProcessing = async (
  parentJobId: string,
): Promise<void> => {
  await db
    .update(jobs)
    .set({ status: "processing" })
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
