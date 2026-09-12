type SolverStatus = "idle" | "solving" | "completed" | "failed"

type SolverStatusCardProps = {
  status?: SolverStatus
  message?: string
}

const STATUS_LABEL: Record<SolverStatus, string> = {
  idle: "Idle",
  solving: "Solving",
  completed: "Completed",
  failed: "Failed",
}

const STATUS_MESSAGE: Record<SolverStatus, string> = {
  idle: "No solve has been started yet.",
  solving: "Workers are searching the assignment space…",
  completed: "A satisfying assignment was found.",
  failed: "The solve failed. Check the formula and try again.",
}

export const SolverStatusCard = ({
  status = "idle",
  message,
}: SolverStatusCardProps) => {
  return (
    <section className="mt-6 rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Solver Status</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {message ?? STATUS_MESSAGE[status]}
          </p>
        </div>

        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
          {STATUS_LABEL[status]}
        </span>
      </div>
    </section>
  )
}
