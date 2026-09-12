import type { Formula } from "./types.js"

export const stripNegation = (literal: string): string =>
  literal.startsWith("!") ? literal.slice(1) : literal

export const collectVariables = (formula: Formula): string[] => {
  const variables = new Set<string>()

  for (const clause of formula) {
    for (const literal of clause) {
      variables.add(stripNegation(literal))
    }
  }

  return [...variables]
}

export const countTotalAssignments = (formula: Formula): number =>
  2 ** collectVariables(formula).length
