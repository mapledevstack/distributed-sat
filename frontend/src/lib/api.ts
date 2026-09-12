import type { Formula } from "@/types/formula.ts"
import type { SolveJob, SolveResponse } from "@/types/solve.ts"

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"

export const solveFormula = async (
  formula: Formula,
  chunkSize?: number,
): Promise<SolveResponse> => {
  const response = await fetch(`${API_BASE_URL}/solve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      chunkSize === undefined ? { formula } : { formula, chunkSize },
    ),
  })

  if (!response.ok) {
    throw new Error("Failed to start solve")
  }

  return response.json() as Promise<SolveResponse>
}

export const getSolveJob = async (jobId: string): Promise<SolveJob> => {
  const response = await fetch(`${API_BASE_URL}/solve/${jobId}`)

  if (!response.ok) {
    throw new Error("Failed to get solve job")
  }

  return response.json() as Promise<SolveJob>
}

