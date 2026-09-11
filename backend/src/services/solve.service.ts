import type { Formula } from "../sat/types.js"
import { satQueue } from "../queue/satQueue.js"

export const solveFormula = async (formula: Formula) => {
  const job = await satQueue.add("solve", {
    formula,
  })

  return {
    jobId: job.id,
  }
}
