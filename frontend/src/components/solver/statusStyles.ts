import type { DisplayStatus } from "./SolverStatusCard.tsx"

export const STATUS_BADGE: Record<DisplayStatus, string> = {
  idle: "bg-muted text-muted-foreground",
  solving: "bg-chart-2/15 text-foreground",
  completed: "bg-chart-1/15 text-foreground",
  unsatisfiable: "bg-muted text-foreground",
  failed: "bg-destructive/15 text-destructive",
  duplicate: "bg-destructive/10 text-destructive",
}

export const STATUS_GLOW: Record<DisplayStatus, string> = {
  idle: "",
  solving: "",
  completed: "",
  unsatisfiable: "",
  failed: "",
  duplicate: "",
}
