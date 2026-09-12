import { Hourglass } from "@phosphor-icons/react"

import { formatPercent } from "@/lib/format.ts"
import { cn } from "@/lib/utils.ts"

import type { DisplayStatus } from "./SolverStatusCard.tsx"
import { STATUS_BADGE } from "./statusStyles.ts"
import { STATUS_HEADLINE, STATUS_SUB } from "./SolverStatusCard.tsx"

type StatusHeroProps = {
  status: DisplayStatus
  liveStatus?: string
  jobLabel?: string
  isCached: boolean
  errorMessage?: string
  done: number
  total: number
  showProgress: boolean
}

export const StatusHero = ({
  status,
  liveStatus,
  jobLabel,
  isCached,
  errorMessage,
  done,
  total,
  showProgress,
}: StatusHeroProps) => {
  const percent = formatPercent(done, total)

  return (
    <section className="overflow-hidden border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold",
                STATUS_BADGE[status],
              )}
            >
              {status === "solving" && (
                <span className="size-1.5 bg-current" />
              )}
              {status === "solving" && liveStatus
                ? `Solving · ${liveStatus}`
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </span>

            {jobLabel && (
              <span className="border bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                {jobLabel}
              </span>
            )}

            {isCached && (
              <span className="bg-chart-1/15 px-2 py-0.5 text-[11px] font-semibold">
                served from cache
              </span>
            )}
          </div>

          <h2 className="font-heading mt-3 text-xl font-semibold tracking-tight">
            {STATUS_HEADLINE[status]}
          </h2>

          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            {errorMessage ?? STATUS_SUB[status]}
          </p>
        </div>

        <ProgressRing percent={status === "idle" ? 0 : percent} />
      </div>

      {showProgress && (
        <div className="border-t px-5 py-4 sm:px-6">
          <div className="mb-2 flex items-center justify-between text-xs font-medium">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Hourglass size={13} />
              Overall chunk progress
            </span>

            <span className="font-mono">
              {done}/{total} · {percent}%
            </span>
          </div>

          <div className="h-2 overflow-hidden bg-muted">
            <div
              className={cn(
                "h-full",
                status === "completed"
                  ? "bg-chart-1"
                  : status === "failed"
                    ? "bg-destructive"
                    : "bg-chart-2",
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}
    </section>
  )
}

const ProgressRing = ({ percent }: { percent: number }) => {
  const radius = 26
  const circumference = 2 * Math.PI * radius
  const filled = (percent / 100) * circumference

  return (
    <div className="relative flex size-20 shrink-0 items-center justify-center">
      <svg viewBox="0 0 64 64" className="size-20 -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          strokeWidth="7"
          className="stroke-muted"
        />

        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          strokeWidth="7"
          strokeLinecap="butt"
          strokeDasharray={`${filled} ${circumference}`}
          className="stroke-chart-2"
        />
      </svg>

      <span className="absolute font-mono text-xs font-bold">{percent}%</span>
    </div>
  )
}
