import evaluateFormula from "./evaluate.js"
import { collectVariables, countTotalAssignments } from "./variables.js"

import type { Assignment, Formula } from "./types.js"

export const solveChunk = (
  formula: Formula,
  start: number,
  end: number,
): Assignment | null => {
  const variables = collectVariables(formula)

  for (let mask = start; mask < end; mask++) {
    const assignment = buildAssignmentFromMask(variables, mask)

    if (evaluateFormula(formula, assignment)) {
      return assignment
    }
  }

  return null
}

export const solve = (formula: Formula): Assignment | null => {
  const totalAssignments = countTotalAssignments(formula)

  return solveChunk(formula, 0, totalAssignments)
}

const buildAssignmentFromMask = (
  variables: string[],
  mask: number,
): Assignment => {
  const assignment: Assignment = {}

  for (let i = 0; i < variables.length; i++) {
    assignment[variables[i]] = Boolean(mask & (1 << i))
  }

  return assignment
}

export default solve

