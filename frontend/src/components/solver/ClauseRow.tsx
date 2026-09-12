import { DiceFive, Plus, Trash } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button.tsx"
import type { Clause } from "@/types/formula.ts"

import { LiteralCard } from "./LiteralInput.tsx"

type ClauseRowProps = {
  clause: Clause
  clauseIndex: number
  isSolving: boolean
  onVariableChange: (
    clauseIndex: number,
    literalIndex: number,
    value: string,
  ) => void
  onToggleNegation: (clauseIndex: number, literalIndex: number) => void
  onAddLiteral: (clauseIndex: number) => void
  onRemoveLiteral: (clauseIndex: number, literalIndex: number) => void
  onRemoveClause: (clauseIndex: number) => void
  onRandomizeClause: (clauseIndex: number) => void
}

export const ClauseRow = ({
  clause,
  clauseIndex,
  isSolving,
  onVariableChange,
  onToggleNegation,
  onAddLiteral,
  onRemoveLiteral,
  onRemoveClause,
  onRandomizeClause,
}: ClauseRowProps) => {
  return (
    <div className="group/row border bg-muted/30 p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center bg-background font-mono text-xs font-bold text-muted-foreground">
          {clauseIndex + 1}
        </span>

        <span className="font-mono text-lg leading-none text-muted-foreground">
          (
        </span>

        <div className="flex flex-1 flex-wrap items-center gap-x-1.5 gap-y-2">
          {clause.length === 0 && (
            <span className="text-xs text-destructive">
              Empty clause — always false. Add a literal or remove this clause.
            </span>
          )}

          {clause.map((literal, literalIndex) => (
            <LiteralCard
              key={literalIndex}
              value={literal}
              showOrSeparator={literalIndex < clause.length - 1}
              isSolving={isSolving}
              onVariableChange={(value) =>
                onVariableChange(clauseIndex, literalIndex, value)
              }
              onToggleNegation={() => onToggleNegation(clauseIndex, literalIndex)}
              onRemove={() => onRemoveLiteral(clauseIndex, literalIndex)}
            />
          ))}
        </div>

        <span className="font-mono text-lg leading-none text-muted-foreground">
          )
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-dashed pt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAddLiteral(clauseIndex)}
          disabled={isSolving}
        >
          <Plus size={13} weight="bold" />
          Literal
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRandomizeClause(clauseIndex)}
          disabled={isSolving}
          className="text-muted-foreground"
        >
          <DiceFive size={13} />
          Randomize
        </Button>

        <span className="text-xs text-muted-foreground">
          {clause.length} literal{clause.length === 1 ? "" : "s"} · click{" "}
          <span className="font-mono font-bold">¬</span> to toggle negation
        </span>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemoveClause(clauseIndex)}
          disabled={isSolving}
          className="ml-auto text-muted-foreground hover:text-destructive"
        >
          <Trash size={13} />
          Clause
        </Button>
      </div>
    </div>
  )
}

