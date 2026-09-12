import { useState } from "react"

import { DEFAULT_FORMULA, type Formula } from "@/types/formula.ts"

export const useFormula = (initialFormula: Formula = DEFAULT_FORMULA) => {
  const [formula, setFormula] = useState<Formula>(initialFormula)

  const updateLiteral = (
    clauseIndex: number,
    literalIndex: number,
    value: string,
  ) => {
    setFormula((prev) =>
      prev.map((clause, index) =>
        index !== clauseIndex
          ? clause
          : clause.map((literal, index) =>
              index === literalIndex ? value : literal,
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
    setFormula((prev) => [...prev, [defaultLiteral]])
  }

  const removeClause = (clauseIndex: number) => {
    setFormula((prev) => prev.filter((_, index) => index !== clauseIndex))
  }

  return {
    formula,
    setFormula,
    updateLiteral,
    addLiteral,
    removeLiteral,
    addClause,
    removeClause,
  }
}
