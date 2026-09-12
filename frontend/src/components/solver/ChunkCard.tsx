import {
  CheckCircle,
  CircleNotch,
  Clock,
  Prohibit,
  Queue,
} from "@phosphor-icons/react"

import type { SolveChunk } from "@/types/solve.ts"
import { formatRange, shortWorkerId } from "@/lib/format.ts"
import { cn } from "@/lib/utils.ts"

import { CHUNK_CARD_STYLE } from "./chunkStyles.ts"

type ChunkCardProps = {
  chunk: SolveChunk
}

export const ChunkCard = ({ chunk }: ChunkCardProps) => {
  const meta = CHUNK_CARD_STYLE[chunk.status]
  const StatusIcon =
    chunk.status === "queued"
      ? Queue
      : chunk.status === "processing"
        ? CircleNotch
        : chunk.status === "completed"
          ? CheckCircle
          : Prohibit

  return (
    <article className={cn("border p-3.5", meta.card)}>
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold">
          <span className={cn("size-2", meta.dot)} />#
          {chunk.chunkIndex + 1}
        </span>

        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
          <StatusIcon
            size={13}
            weight="bold"
          />
          {meta.label}
        </span>
      </div>

      <p className="mt-2 font-mono text-[11px] text-muted-foreground">
        {formatRange(chunk.start, chunk.end)}
      </p>

      <div className="mt-2 flex items-center justify-between border-t border-dashed pt-2 text-[11px]">
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Clock size={12} />
          {shortWorkerId(chunk.workerId)}
        </span>

        <span className="font-mono text-muted-foreground">
          {chunk.end - chunk.start} masks
        </span>
      </div>

      {chunk.status === "completed" && chunk.result && (
        <div className="mt-2 flex flex-wrap gap-1">
          {Object.entries(chunk.result)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([variable, value]) => (
              <span
                key={variable}
                className={cn(
                  "px-1.5 py-0.5 font-mono text-[11px] font-bold",
                  value
                    ? "bg-chart-1/20 text-foreground"
                    : "bg-destructive/10 text-destructive",
                )}
              >
                {variable}={value ? "T" : "F"}
              </span>
            ))}
        </div>
      )}
    </article>
  )
}
