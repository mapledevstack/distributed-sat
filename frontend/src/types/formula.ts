export type Clause = string[]
export type Formula = Clause[]

export const DEFAULT_LITERAL = "A"
export const DEFAULT_CLAUSE: Clause = [DEFAULT_LITERAL]

export const DEFAULT_FORMULA: Formula = [
  ["A", "!B"],
  ["A", "B"],
]
