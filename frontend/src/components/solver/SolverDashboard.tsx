import type { Assignment } from "@/types/solve.ts"

import { AnswerCard } from "./AnswerCard.tsx"
import { StatusHero } from "./StatusHero.tsx"
import { WorkerGrid } from "./WorkerGrid.tsx"
import {
  isUnsatisfiableValue,
  resolveDisplayStatus,
  type SolverDashboardProps,
} from "./SolverStatusCard.tsx"

export const SolverDashboard = ({
  mutation,
  query,
  cachedOutcome,
  liveJob,
  isSolving,
}: SolverDashboardProps) => {
  const status = resolveDisplayStatus(
    mutation,
    query,
    cachedOutcome,
    liveJob,
    isSolving,
  )

  const chunks = liveJob?.chunks ?? []
  const done = liveJob?.completedChunks ?? 0
  const total = liveJob?.totalChunks ?? chunks.length
  const assignment: Assignment | null = liveJob?.result ?? null
  const winningChunk = chunks.find((chunk) => chunk.status === "completed")
  const errorMessage = mutation.isError
    ? mutation.error.message
    : query.isError
      ? query.error.message
      : undefined

  const cachedAssignment =
    cachedOutcome && !isUnsatisfiableValue(cachedOutcome.result)
      ? (cachedOutcome.result as Assignment)
      : null

  return (
    <div className="mt-6 space-y-4">
      <StatusHero
        status={status}
        liveStatus={liveJob?.status}
        jobLabel={
          liveJob
            ? `job ${liveJob.id.slice(0, 8)}… · ${liveJob.totalAssignments ?? "–"} assignments`
            : undefined
        }
        isCached={Boolean(cachedOutcome)}
        errorMessage={errorMessage}
        done={done}
        total={total}
        showProgress={Boolean(liveJob ?? isSolving)}
      />

      {(status === "completed" || cachedOutcome) && (
        <AnswerCard
          assignment={assignment ?? cachedAssignment}
          winningChunkIndex={winningChunk?.chunkIndex}
        />
      )}

      {liveJob && (
        <WorkerGrid chunks={chunks} chunkSize={liveJob.chunkSize} />
      )}
    </div>
  )
}
