import { z } from "zod"

export const solveSchema = z.object({
  formula: z.array(z.array(z.string())),
})

export const solveJobSchema = z.object({
  jobId: z.string(),
})
