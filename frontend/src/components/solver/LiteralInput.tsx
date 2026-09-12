import { X } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button.tsx"
import { isNegatedLiteral, literalVariable } from "@/types/formula.ts"
import { cn } from "@/lib/utils.ts"

type LiteralCardProps = {
  value: string
  showOrSeparator: boolean
  isSolving: boolean
  onVariableChange: (value: string) => void
  onToggleNegation: () => void
  onRemove: () => void
}

export const LiteralCard = ({
  value,
  showOrSeparator,
  isSolving,
  onVariableChange,
  onToggleNegation,
  onRemove,
}: LiteralCardProps) => {
  const negated = isNegatedLiteral(value)
  const variable = literalVariable(value) || "–"

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn(
          "group flex items-center gap-1 border bg-background p-1",
          negated
            ? "border-destructive/40 bg-destructive/5"
            : "border-chart-2/40 bg-chart-1/5",
        )}
      >
        <button
          type="button"
          title={
            negated
              ? "Negated — click to make positive"
              : "Positive — click to negate"
          }
          onClick={onToggleNegation}
          disabled={isSolving}
          className={cn(
            "flex h-11 w-9 cursor-pointer items-center justify-center font-mono text-xl font-bold",
            "active:bg-muted disabled:cursor-not-allowed disabled:opacity-60",
            negated
              ? "bg-destructive/15 text-destructive"
              : "bg-transparent text-muted-foreground hover:bg-muted",
            !negated && "opacity-40 hover:opacity-100",
          )}
        >
          ¬
          <span className="sr-only">Toggle negation</span>
        </button>

        <input
          value={variable}
          onChange={(event) => onVariableChange(event.target.value)}
          onFocus={(event) => event.target.select()}
          maxLength={1}
          disabled={isSolving}
          aria-label="Literal variable, single capital letter"
          placeholder="A"
          className="h-11 w-11 bg-transparent text-center font-mono text-2xl font-bold tracking-tight text-foreground uppercase outline-none placeholder:text-muted-foreground/40 disabled:opacity-60"
        />

        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onRemove}
          disabled={isSolving}
          aria-label={`Remove literal ${value}`}
          className="text-muted-foreground opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
        >
          <X size={13} weight="bold" />
        </Button>
      </div>

      {showOrSeparator && (
        <span className="bg-muted px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-muted-foreground">
          OR
        </span>
      )}
    </div>
  )
}


