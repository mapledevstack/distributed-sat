export type Clause = string[]
export type Formula = Clause[]

export const DEFAULT_LITERAL = "A"
export const DEFAULT_CLAUSE: Clause = [DEFAULT_LITERAL]

export const DEFAULT_FORMULA: Formula = [
  ["A", "!B"],
  ["A", "B"],
]

export const VARIABLE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

export const isNegatedLiteral = (literal: string): boolean =>
  literal.startsWith("!")

export const literalVariable = (literal: string): string =>
  isNegatedLiteral(literal) ? literal.slice(1) : literal

export const toggleLiteralNegation = (literal: string): string =>
  isNegatedLiteral(literal) ? literalVariable(literal) : `!${literalVariable(literal)}`

export const normalizeVariableInput = (value: string): string => {
  const match = value.toUpperCase().match(/[A-Z]/)

  return match ? match[0] : ""
}

export const collectFormulaVariables = (formula: Formula): string[] => {
  const variables = new Set<string>()

  for (const clause of formula) {
    for (const literal of clause) {
      const variable = literalVariable(literal)
      if (variable) {
        variables.add(variable)
      }
    }
  }

  return [...variables].sort()
}

export const countAssignments = (formula: Formula): number =>
  2 ** collectFormulaVariables(formula).length

export const randomVariable = (pool: string[] = VARIABLE_ALPHABET): string =>
  pool[Math.floor(Math.random() * pool.length)]

export const randomLiteral = (variables?: string[]): string => {
  const pool = variables?.length ? variables : ["A", "B", "C", "D"]
  const variable = randomVariable(pool)

  return Math.random() < 0.5 ? `!${variable}` : variable
}

export const randomClause = (
  length: number,
  variables?: string[],
): Clause => Array.from({ length }, () => randomLiteral(variables))

export const randomFormula = (
  clauseCount = 3,
  literalsPerClause = 3,
  variableCount = 4,
): Formula => {
  const variables = VARIABLE_ALPHABET.slice(0, variableCount)

  return Array.from({ length: clauseCount }, () =>
    randomClause(literalsPerClause, variables),
  )
}

