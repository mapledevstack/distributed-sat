import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query"

import type { Formula } from "@/types/formula.ts"
import type {
  Assignment,
  SolveJob,
  SolveResponse,
} from "@/types/solve.ts"

export type SolverDashboardProps = {
  mutation: UseMutationResult<SolveResponse, Error, Formula>
  query: UseQueryResult<SolveJob, Error>
  cachedOutcome?: SolveResponse & { cached: true }
  liveJob?: SolveJob
  isSolving: boolean
}

export type DisplayStatus =
  | "idle"
  | "solving"
  | "completed"
  | "unsatisfiable"
  | "failed"
  | "duplicate"

export const STATUS_HEADLINE: Record<DisplayStatus, string> = {
  idle: "Ready when you are",
  solving: "Workers are sweeping the search space",
  completed: "Satisfying assignment found",
  unsatisfiable: "Formula is unsatisfiable",
  failed: "Something went wrong",
  duplicate: "Already being solved",
}

export const STATUS_SUB: Record<DisplayStatus, string> = {
  idle: "Press Solve to fan work out to every chunk below.",
  solving: "Live progress streams in from Postgres as each chunk finishes.",
  completed: "At least one chunk reported a full satisfying assignment.",
  unsatisfiable: "Every chunk was exhausted — no assignment satisfies it.",
  failed: "Check the backend, Redis and Postgres, then try again.",
  duplicate: "This exact formula already has an active search running.",
}

export const isUnsatisfiableValue = (
  value: Assignment | { status: string },
): value is { status: "unsatisfiable" } =>
  typeof value === "object" &&
  value !== null &&
  "status" in value &&
  (value as { status: string }).status === "unsatisfiable"

export const resolveDisplayStatus = (
  mutation: SolverDashboardProps["mutation"],
  query: SolverDashboardProps["query"],
  cachedOutcome: SolverDashboardProps["cachedOutcome"],
  liveJob: SolveJob | undefined,
  isSolving: boolean,
): DisplayStatus => {
  const mutationData = mutation.data

  if (
    mutationData &&
    !mutationData.cached &&
    "duplicate" in mutationData &&
    mutationData.duplicate
  ) {
    return "duplicate"
  }

  if (cachedOutcome) {
    return isUnsatisfiableValue(cachedOutcome.result)
      ? "unsatisfiable"
      : "completed"
  }

  if (mutation.isError || query.isError || liveJob?.status === "failed") {
    return "failed"
  }

  if (liveJob?.status === "completed") {
    return "completed"
  }

  if (liveJob?.status === "unsatisfiable") {
    return "unsatisfiable"
  }

  if (isSolving || liveJob) {
    return "solving"
  }

  return "idle"
}

