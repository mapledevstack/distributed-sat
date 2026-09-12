import { Button } from "@/components/ui/button.tsx"
import type { Formula } from "@/types/formula.ts"

import { ClauseRow } from "./ClauseRow.tsx"

type FormulaEditorProps = {
  formula: Formula
  onUpdateLiteral: (
    clauseIndex: number,
    literalIndex: number,
    value: string,
  ) => void
  onAddLiteral: (clauseIndex: number) => void
  onRemoveLiteral: (clauseIndex: number, literalIndex: number) => void
  onAddClause: () => void
  onRemoveClause: (clauseIndex: number) => void
  onSolve: () => void
}

export const FormulaEditor = ({
  formula,
  onUpdateLiteral,
  onAddLiteral,
  onRemoveLiteral,
  onAddClause,
  onRemoveClause,
  onSolve,
}: FormulaEditorProps) => {
  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Boolean Formula</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Each row is a clause. Literals inside a row are combined with OR,
          while clauses are combined with AND.
        </p>
      </div>

      <div className="space-y-3">
        {formula.map((clause, clauseIndex) => (
          <ClauseRow
            key={clauseIndex}
            clause={clause}
            clauseIndex={clauseIndex}
            onUpdateLiteral={onUpdateLiteral}
            onAddLiteral={onAddLiteral}
            onRemoveLiteral={onRemoveLiteral}
            onRemoveClause={onRemoveClause}
          />
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button variant="outline" onClick={onAddClause}>
          + Add Clause
        </Button>

        <Button onClick={onSolve}>Solve</Button>
      </div>
    </section>
  )
}
