import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"

import { getSolveJob, solveFormula } from "@/lib/api.ts"
import type { Formula } from "@/types/formula.ts"
import type { SolveJob, SolveResponse } from "@/types/solve.ts"

export const useSolve = () => {
  const [jobId, setJobId] = useState<string | null>(null)
  const [chunkSize, setChunkSize] = useState<number>(8)
  const [cachedOutcome, setCachedOutcome] = useState<
    SolveResponse & { cached: true }
  >()

  const resetCachedOutcome = () => setCachedOutcome(undefined)

  const solveMutation = useMutation<SolveResponse, Error, Formula>({
    mutationFn: (formula) => solveFormula(formula, chunkSize),
    onSuccess: (data) => {
      if (data.cached) {
        setCachedOutcome(data)
        setJobId(null)
        return
      }

      resetCachedOutcome()

      if ("duplicate" in data && data.duplicate) {
        return
      }

      setJobId(data.jobId)
    },
  })

  const jobQuery = useQuery<SolveJob, Error>({
    queryKey: ["solve-job", jobId],
    queryFn: () => getSolveJob(jobId ?? ""),
    enabled: jobId !== null,
    refetchInterval: (query) => {
      const status = query.state.data?.status

      if (
        status === "completed" ||
        status === "unsatisfiable" ||
        status === "failed"
      ) {
        return false
      }

      return 800
    },
  })

  const liveJob: SolveJob | undefined = jobQuery.data
  const isSolving =
    solveMutation.isPending ||
    (liveJob !== undefined &&
      (liveJob.status === "queued" || liveJob.status === "processing"))

  return {
    jobId,
    chunkSize,
    setChunkSize,
    cachedOutcome,
    solveMutation,
    jobQuery,
    liveJob,
    isSolving,
  }
}

