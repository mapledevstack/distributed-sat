import { Assignment, Formula } from "./types.js"

const evaluateFormula = (formula: Formula, assignment: Assignment): boolean => {
  for (const clause of formula) {
    let clauseSatisfied = false
    for (const literal of clause) {
      const isNegated = literal.startsWith("!")
      const variable = isNegated ? literal.slice(1) : literal
      const value = assignment[variable]
      if (isNegated) {
        clauseSatisfied = !value
      } else {
        clauseSatisfied = value
      }
      if (clauseSatisfied) {
        break
      }
    }
    if (!clauseSatisfied) {
      return false
    }
  }
  return true
}

export default evaluateFormula
