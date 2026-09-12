import type { ChunkStatus } from "@/types/solve.ts"

export const CHUNK_CARD_STYLE: Record<
  ChunkStatus,
  { label: string; card: string; dot: string }
> = {
  queued: {
    label: "Queued",
    card: "border-border bg-muted/40",
    dot: "bg-muted-foreground/50",
  },
  processing: {
    label: "Searching",
    card: "border-chart-2/50 bg-chart-2/10",
    dot: "bg-chart-2",
  },
  completed: {
    label: "Solved",
    card: "border-chart-1/60 bg-chart-1/10",
    dot: "bg-chart-1",
  },
  exhausted: {
    label: "Exhausted",
    card: "border-border bg-background opacity-75",
    dot: "bg-muted-foreground/40",
  },
}
