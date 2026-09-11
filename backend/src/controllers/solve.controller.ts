import type { Request, Response } from "express"
import { AppError, catchErrors } from "../middlewares/index.js"
import { solveSchema } from "../schemas/solve.schema.js"
import { solveFormula } from "../services/solve.service.js"

export const solveController = catchErrors(
  async (req: Request, res: Response) => {
    const result = solveSchema.safeParse(req.body)

    if (!result.success) {
      throw new AppError("Invalid formula", 400)
    }

    const solution = await solveFormula(result.data.formula)

    res.json(solution)
  },
)
