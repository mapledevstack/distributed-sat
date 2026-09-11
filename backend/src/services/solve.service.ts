import type { Formula } from "../sat/types.js"

export const solveFormula = (formula: Formula) => {
  return {
    message: "Solve service is working!",
    formula,
  }
}
