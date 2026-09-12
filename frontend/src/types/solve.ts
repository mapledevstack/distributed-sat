import type { Formula } from "./formula.ts"

export type Assignment = Record<string, boolean>

export type SolveJobStatus =
  | "queued"
  | "processing"
  | "completed"
  | "unsatisfiable"
  | "failed"

export type ChunkStatus = "queued" | "processing" | "completed" | "exhausted"

export interface SolveChunk {
  id: string
  jobId: string
  chunkIndex: number
  start: number
  end: number
  status: ChunkStatus
  result: Assignment | null
  workerId: string | null
  startedAt: string | null
  completedAt: string | null
}

export interface SolveJob {
  id: string
  status: SolveJobStatus
  formula: Formula
  formulaHash: string
  result: Assignment | null
  error: string | null
  totalChunks: number
  completedChunks: number
  totalAssignments: number | null
  chunkSize: number | null
  createdAt: string
  completedAt: string | null
  chunks: SolveChunk[]
}

export type SolveResponse =
  | { cached: true; result: Assignment | { status: "unsatisfiable" } }
  | { cached: false; duplicate: true; message: string }
  | {
      cached: false
      duplicate?: false
      jobId: string
      totalChunks: number
      chunkSize: number
    }

