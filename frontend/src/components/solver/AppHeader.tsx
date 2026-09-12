import { ArrowSquareOut, Cpu, GitBranch } from "@phosphor-icons/react"

export const AppHeader = () => {
  return (
    <header className="mb-6 border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-6 p-6">
        <div className="max-w-2xl">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              <GitBranch size={14} weight="bold" />
              Distributed Systems × SAT
            </span>

            <span className="inline-flex items-center gap-1.5 bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
              <span className="size-1.5 bg-primary-foreground" />
              BullMQ + Postgres + Redis
            </span>
          </div>

          <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Distributed SAT Solver
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Design a CNF formula below. The backend fans the{" "}
            <span className="font-mono font-semibold text-foreground">
              2<sup>n</sup>
            </span>{" "}
            assignment space out into chunks, and every worker reports its own
            mask range back here live.
          </p>
        </div>

        <div className="flex items-center gap-3 border bg-background px-4 py-3">
          <span className="flex size-10 items-center justify-center bg-primary/15 text-primary-foreground">
            <Cpu size={22} weight="duotone" />
          </span>

          <div className="text-xs">
            <p className="font-semibold">Parallel brute force</p>
            <a
              className="mt-0.5 inline-flex items-center gap-1 text-muted-foreground underline-offset-4 hover:underline"
              href="http://localhost:3000/api/health"
              target="_blank"
              rel="noreferrer"
            >
              API health
              <ArrowSquareOut size={12} />
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}


