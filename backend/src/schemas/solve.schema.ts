import { z } from "zod"

const literalSchema = z
  .string()
  .regex(/^!?[A-Z]$/, "Literal must be a single capital letter, optionally prefixed with !")

export const solveSchema = z.object({
  formula: z.array(z.array(literalSchema)).min(1, "Formula needs at least one clause"),
  chunkSize: z.number().int().min(1).max(4096).optional(),
})

export const solveJobSchema = z.object({
  jobId: z.string(),
})
