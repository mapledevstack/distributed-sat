import type { Request, Response } from "express"
import { AppError, catchErrors } from "../middlewares/index.js"
import { solveJobSchema, solveSchema } from "../schemas/solve.schema.js"
import {
  getSolveJob,
  getSolveJobChunks,
  solveFormula,
} from "../services/solve.service.js"

export const solveController = catchErrors(
  async (req: Request, res: Response) => {
    const result = solveSchema.safeParse(req.body)

    if (!result.success) {
      throw new AppError("Invalid formula", 400)
    }

    const solution = await solveFormula(
      result.data.formula,
      result.data.chunkSize,
    )

    res.json(solution)
  },
)

export const getSolveController = async (req: Request, res: Response) => {
  const { jobId } = solveJobSchema.parse(req.params)

  const job = await getSolveJob(jobId)

  if (!job) {
    throw new AppError("Job not found", 404)
  }

  res.json(job)
}

export const getSolveChunksController = async (
  req: Request,
  res: Response,
) => {
  const { jobId } = solveJobSchema.parse(req.params)

  const payload = await getSolveJobChunks(jobId)

  if (!payload) {
    throw new AppError("Job not found", 404)
  }

  res.json(payload)
}

