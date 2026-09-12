import { CheckCircle, XCircle } from "@phosphor-icons/react"
import { Trophy } from "@phosphor-icons/react"

import type { Assignment } from "@/types/solve.ts"
import { cn } from "@/lib/utils.ts"

type AnswerCardProps = {
  assignment: Assignment | null
  winningChunkIndex?: number
}

export const AnswerCard = ({ assignment, winningChunkIndex }: AnswerCardProps) => {
  if (!assignment) {
    return null
  }

  const entries = Object.entries(assignment).sort(([a], [b]) =>
    a.localeCompare(b),
  )

  return (
    <section className="relative overflow-hidden border border-chart-1/50 bg-chart-1/10 p-5 sm:p-6">
      <p className="inline-flex items-center gap-1.5 bg-chart-1/20 px-2 py-0.5 text-xs font-bold">
        <Trophy size={14} weight="fill" />
        Final answer
        {winningChunkIndex !== undefined &&
          ` · won by chunk #${winningChunkIndex + 1}`}
      </p>

      <p className="mt-2 font-mono text-sm break-all text-muted-foreground">
        {"{ "}
        {entries.map(([variable, value], index) => (
          <span key={variable}>
            {variable}: {value ? "true" : "false"}
            {index < entries.length - 1 ? ", " : " "}
          </span>
        ))}
        {"}"}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {entries.map(([variable, value]) => (
          <div
            key={variable}
            className={cn(
              "flex min-w-20 flex-1 items-center justify-between gap-3 border px-4 py-3 sm:flex-none",
              value
                ? "border-chart-1/50 bg-chart-1/10"
                : "border-destructive/40 bg-destructive/[0.07]",
            )}
          >
            <span className="font-mono text-2xl font-bold">{variable}</span>

            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 font-mono text-xs font-bold",
                value
                  ? "bg-chart-1/25 text-foreground"
                  : "bg-destructive/15 text-destructive",
              )}
            >
              {value ? (
                <CheckCircle size={13} weight="fill" />
              ) : (
                <XCircle size={13} weight="fill" />
              )}
              {value ? "TRUE" : "FALSE"}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
