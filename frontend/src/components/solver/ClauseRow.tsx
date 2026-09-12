import { Button } from "@/components/ui/button.tsx"
import type { Clause } from "@/types/formula.ts"

import { LiteralInput } from "./LiteralInput.tsx"

type ClauseRowProps = {
  clause: Clause
  clauseIndex: number
  onUpdateLiteral: (
    clauseIndex: number,
    literalIndex: number,
    value: string,
  ) => void
  onAddLiteral: (clauseIndex: number) => void
  onRemoveLiteral: (clauseIndex: number, literalIndex: number) => void
  onRemoveClause: (clauseIndex: number) => void
}

export const ClauseRow = ({
  clause,
  clauseIndex,
  onUpdateLiteral,
  onAddLiteral,
  onRemoveLiteral,
  onRemoveClause,
}: ClauseRowProps) => {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3">
      <span className="w-8 text-sm font-medium text-muted-foreground">
        {clauseIndex + 1}.
      </span>

      <div className="flex flex-wrap items-center gap-2">
        {clause.map((literal, literalIndex) => (
          <LiteralInput
            key={literalIndex}
            value={literal}
            showOrSeparator={literalIndex < clause.length - 1}
            onChange={(value) => onUpdateLiteral(clauseIndex, literalIndex, value)}
            onRemove={() => onRemoveLiteral(clauseIndex, literalIndex)}
          />
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="ml-auto"
        onClick={() => onAddLiteral(clauseIndex)}
      >
        + Literal
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemoveClause(clauseIndex)}
      >
        Remove
      </Button>
    </div>
  )
}
