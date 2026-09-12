import { Cpu } from "@phosphor-icons/react"

import type { SolveChunk } from "@/types/solve.ts"

import { ChunkCard } from "./ChunkCard.tsx"

type WorkerGridProps = {
  chunks: SolveChunk[]
  chunkSize: number | null
}

export const WorkerGrid = ({ chunks, chunkSize }: WorkerGridProps) => {
  if (chunks.length === 0) {
    return null
  }

  return (
    <section className="border bg-card p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-heading inline-flex items-center gap-2 text-base font-semibold">
          <Cpu size={17} weight="duotone" />
          Worker chunks
          <span className="bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            {chunks.length}
          </span>
        </h3>

        <p className="font-mono text-[11px] text-muted-foreground">
          chunk size {chunkSize ?? "–"} · masks partition 2<sup>n</sup>
        </p>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {chunks.map((chunk) => (
          <ChunkCard key={chunk.id} chunk={chunk} />
        ))}
      </div>
    </section>
  )
}
