import evaluateFormula from "./evaluate.js"
import type { Assignment, Formula } from "./types.js"

const solve = (formula: Formula): Assignment | null => {
  const variables = new Set<string>()

  for (const clause of formula) {
    for (const literal of clause) {
      const variable = literal.startsWith("!") ? literal.slice(1) : literal

      variables.add(variable)
    }
  }

  const variablesArray = [...variables]

  const totalAssignments = 2 ** variablesArray.length

  for (let mask = 0; mask < totalAssignments; mask++) {
    const assignment: Assignment = {}

    for (let i = 0; i < variablesArray.length; i++) {
      assignment[variablesArray[i]] = Boolean(mask & (1 << i))
    }

    if (evaluateFormula(formula, assignment)) {
      return assignment
    }
  }

  return null
}

export default solve
