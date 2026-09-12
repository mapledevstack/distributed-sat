export const AppHeader = () => {
  return (
    <div className="mb-10">
      <p className="mb-2 text-sm font-medium text-muted-foreground">
        Distributed Systems × SAT
      </p>

      <h1 className="text-4xl font-bold tracking-tight">
        Distributed SAT Solver
      </h1>

      <p className="mt-3 max-w-2xl text-muted-foreground">
        Submit a Boolean formula and let distributed workers search the
        assignment space in parallel.
      </p>
    </div>
  )
}
