import { AppHeader } from "@/components/solver/AppHeader.tsx"
import { FormulaEditor } from "@/components/solver/FormulaEditor.tsx"
import { SolverDashboard } from "@/components/solver/SolverDashboard.tsx"
import { useFormula } from "@/hooks/useFormula.ts"
import { useSolve } from "@/hooks/useSolve.ts"

const App = () => {
  const {
    formula,
    updateVariable,
    toggleNegation,
    addLiteral,
    removeLiteral,
    addClause,
    removeClause,
    resetFormula,
    randomizeClause,
    randomizeFormula,
  } = useFormula()

  const {
    chunkSize,
    setChunkSize,
    cachedOutcome,
    solveMutation,
    jobQuery,
    liveJob,
    isSolving,
    startSolve,
  } = useSolve()

  const handleSolve = () => {
    startSolve(formula)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-8 sm:px-6 sm:py-12">
        <AppHeader />

        <FormulaEditor
          formula={formula}
          isSolving={isSolving}
          chunkSize={chunkSize}
          onChunkSizeChange={setChunkSize}
          onVariableChange={updateVariable}
          onToggleNegation={toggleNegation}
          onAddLiteral={addLiteral}
          onRemoveLiteral={removeLiteral}
          onAddClause={addClause}
          onRemoveClause={removeClause}
          onRandomizeClause={randomizeClause}
          onRandomizeFormula={randomizeFormula}
          onReset={resetFormula}
          onSolve={handleSolve}
        />

        <SolverDashboard
          mutation={solveMutation}
          query={jobQuery}
          cachedOutcome={cachedOutcome}
          liveJob={liveJob}
          isSolving={isSolving}
        />
      </div>
    </main>
  )
}

export default App

