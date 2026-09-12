import { useState } from "react"

import {
  collectFormulaVariables,
  DEFAULT_FORMULA,
  normalizeVariableInput,
  randomClause,
  randomFormula,
  toggleLiteralNegation,
  type Formula,
} from "@/types/formula.ts"

export const useFormula = (initialFormula: Formula = DEFAULT_FORMULA) => {
  const [formula, setFormula] = useState<Formula>(initialFormula)

  const updateVariable = (
    clauseIndex: number,
    literalIndex: number,
    rawValue: string,
  ) => {
    const variable = normalizeVariableInput(rawValue)

    setFormula((prev) =>
      prev.map((clause, index) =>
        index !== clauseIndex
          ? clause
          : clause.map((literal, index) => {
              if (index !== literalIndex) {
                return literal
              }

              if (!variable) {
                return literal
              }

              return literal.startsWith("!") ? `!${variable}` : variable
            }),
      ),
    )
  }

  const toggleNegation = (clauseIndex: number, literalIndex: number) => {
    setFormula((prev) =>
      prev.map((clause, index) =>
        index !== clauseIndex
          ? clause
          : clause.map((literal, index) =>
              index === literalIndex ? toggleLiteralNegation(literal) : literal,
            ),
      ),
    )
  }

  const addLiteral = (clauseIndex: number, defaultLiteral = "A") => {
    setFormula((prev) =>
      prev.map((clause, index) =>
        index !== clauseIndex ? clause : [...clause, defaultLiteral],
      ),
    )
  }

  const removeLiteral = (clauseIndex: number, literalIndex: number) => {
    setFormula((prev) =>
      prev.map((clause, index) =>
        index !== clauseIndex
          ? clause
          : clause.filter((_, index) => index !== literalIndex),
      ),
    )
  }

  const addClause = (defaultLiteral = "A") => {
    const literal =
      typeof defaultLiteral === "string" && defaultLiteral ? defaultLiteral : "A"

    setFormula((prev) => [...prev, [literal]])
  }

  const removeClause = (clauseIndex: number) => {
    setFormula((prev) => prev.filter((_, index) => index !== clauseIndex))
  }

  const resetFormula = () => {
    setFormula(DEFAULT_FORMULA)
  }

  const randomizeClause = (clauseIndex: number) => {
    setFormula((prev) => {
      const variables = collectFormulaVariables(prev)

      return prev.map((clause, index) =>
        index !== clauseIndex
          ? clause
          : randomClause(Math.max(clause.length, 2), variables),
      )
    })
  }

  const randomizeFormula = (clauseCount?: number, variableCount?: number) => {
    setFormula(randomFormula(clauseCount, 3, variableCount))
  }

  return {
    formula,
    setFormula,
    updateVariable,
    toggleNegation,
    addLiteral,
    removeLiteral,
    addClause,
    removeClause,
    resetFormula,
    randomizeClause,
    randomizeFormula,
  }
}

