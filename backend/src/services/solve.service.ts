import solve from "../sat/solve.js"
import type { Formula } from "../sat/types.js"

export const solveFormula = (formula: Formula) => {
  const solution = solve(formula)

  return {
    solution,
  }
}
