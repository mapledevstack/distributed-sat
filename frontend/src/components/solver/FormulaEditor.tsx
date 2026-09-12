import { useState } from "react"

import {
  ArrowClockwise,
  DiceFive,
  Play,
  Plus,
  SlidersHorizontal,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button.tsx"
import {
  collectFormulaVariables,
  countAssignments,
  type Formula,
} from "@/types/formula.ts"
import { formatInteger } from "@/lib/format.ts"
import { cn } from "@/lib/utils.ts"

import { ClauseRow } from "./ClauseRow.tsx"

type FormulaEditorProps = {
  formula: Formula
  isSolving: boolean
  chunkSize: number
  onChunkSizeChange: (value: number) => void
  onVariableChange: (
    clauseIndex: number,
    literalIndex: number,
    value: string,
  ) => void
  onToggleNegation: (clauseIndex: number, literalIndex: number) => void
  onAddLiteral: (clauseIndex: number) => void
  onRemoveLiteral: (clauseIndex: number, literalIndex: number) => void
  onAddClause: () => void
  onRemoveClause: (clauseIndex: number) => void
  onRandomizeClause: (clauseIndex: number) => void
  onRandomizeFormula: (clauseCount?: number, variableCount?: number) => void
  onReset: () => void
  onSolve: () => void
}

export const FormulaEditor = ({
  formula,
  isSolving,
  chunkSize,
  onChunkSizeChange,
  onVariableChange,
  onToggleNegation,
  onAddLiteral,
  onRemoveLiteral,
  onAddClause,
  onRemoveClause,
  onRandomizeClause,
  onRandomizeFormula,
  onReset,
  onSolve,
}: FormulaEditorProps) => {
  const variables = collectFormulaVariables(formula)
  const totalAssignments = countAssignments(formula)
  const estimatedChunks = Math.max(1, Math.ceil(totalAssignments / chunkSize))

  const [randomClauseCount, setRandomClauseCount] = useState(3)
  const [randomVariableCount, setRandomVariableCount] = useState(8)

  const clampInt = (raw: string, fallback: number, min: number, max: number) =>
    Math.max(min, Math.min(max, Number(raw) || fallback))

  return (
    <section className="border bg-card p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-semibold">
            Boolean Formula
          </h2>

          <p className="mt-1 max-w-lg text-sm text-muted-foreground">
            Each row is a clause — literals join with OR, clauses join with AND.
            Type one letter per box, click{" "}
            <span className="font-mono font-bold text-foreground">¬</span> to
            flip negation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="border bg-muted px-2 py-0.5 font-mono text-xs font-semibold">
            {variables.length === 0 ? "no vars" : variables.join(" · ")}
          </span>

          <span className="bg-primary px-2 py-0.5 font-mono text-xs font-bold text-primary-foreground">
            2<sup>{variables.length}</sup> = {formatInteger(totalAssignments)}{" "}
            assignments
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {formula.map((clause, clauseIndex) => (
          <div key={clauseIndex} className="relative">
            {clauseIndex > 0 && (
              <div className="flex items-center gap-2 py-1 pl-3">
                <span className="h-px w-6 bg-border" />
                <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold tracking-widest text-muted-foreground">
                  AND
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>
            )}

            <ClauseRow
              clause={clause}
              clauseIndex={clauseIndex}
              isSolving={isSolving}
              onVariableChange={onVariableChange}
              onToggleNegation={onToggleNegation}
              onAddLiteral={onAddLiteral}
              onRemoveLiteral={onRemoveLiteral}
              onRemoveClause={onRemoveClause}
              onRandomizeClause={onRandomizeClause}
            />
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 border border-dashed bg-muted/30 p-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAddClause()}
          disabled={isSolving}
        >
          <Plus size={14} weight="bold" />
          Add Clause
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onRandomizeFormula(randomClauseCount, randomVariableCount)}
          disabled={isSolving}
          title="Generate a random 3-SAT formula — always 3 literals per clause — using the clauses and vars below"
        >
          <DiceFive size={14} />
          Random 3-SAT
        </Button>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <label
            htmlFor="random-clauses"
            className="font-medium whitespace-nowrap"
          >
            Clauses
          </label>
          <input
            id="random-clauses"
            type="number"
            min={1}
            max={40}
            value={randomClauseCount}
            disabled={isSolving}
            title="How many clauses (AND rows) the random formula gets"
            onChange={(event) =>
              setRandomClauseCount(clampInt(event.target.value, 3, 1, 40))
            }
            className="h-7 w-14 border bg-background px-2 font-mono text-xs outline-none focus:border-ring disabled:opacity-60"
          />

          <label htmlFor="random-vars" className="font-medium whitespace-nowrap">
            Vars
          </label>
          <input
            id="random-vars"
            type="number"
            min={2}
            max={24}
            value={randomVariableCount}
            disabled={isSolving}
            title="How many distinct variables — each extra variable doubles the assignment space (2ⁿ)"
            onChange={(event) =>
              setRandomVariableCount(clampInt(event.target.value, 8, 2, 24))
            }
            className="h-7 w-14 border bg-background px-2 font-mono text-xs outline-none focus:border-ring disabled:opacity-60"
          />
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={isSolving}
          className="text-muted-foreground"
        >
          <ArrowClockwise size={14} />
          Reset
        </Button>

        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <SlidersHorizontal size={14} />
          <label htmlFor="chunk-size" className="font-medium whitespace-nowrap">
            Chunk size
          </label>
          <input
            id="chunk-size"
            type="number"
            min={1}
            max={4096}
            value={chunkSize}
            disabled={isSolving}
            onChange={(event) =>
              onChunkSizeChange(Math.max(1, Number(event.target.value) || 1))
            }
            className="h-7 w-20 border bg-background px-2 font-mono text-xs outline-none focus:border-ring disabled:opacity-60"
          />
          <span
            className={cn(
              "px-2 py-0.5 font-mono text-[11px] font-semibold",
              estimatedChunks > 64
                ? "bg-destructive/10 text-destructive"
                : "bg-muted text-muted-foreground",
            )}
            title="How many worker chunks this formula will be split into"
          >
            ≈ {estimatedChunks} chunks
          </span>
        </div>
      </div>

      <div className="mt-4">
        <Button
          size="lg"
          onClick={onSolve}
          disabled={isSolving}
          className="w-full font-semibold"
        >
          {isSolving ? (
            <>
              <span className="size-4 animate-spin border-2 border-current border-t-transparent" />
              Solving… watch workers below
            </>
          ) : (
            <>
              <Play size={15} weight="fill" />
              Solve across {estimatedChunks} worker
              {estimatedChunks === 1 ? "" : "s"}
            </>
          )}
        </Button>
      </div>
    </section>
  )
}

