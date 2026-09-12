import { AppHeader } from "@/components/solver/AppHeader.tsx"
import { FormulaEditor } from "@/components/solver/FormulaEditor.tsx"
import { SolverStatusCard } from "@/components/solver/SolverStatusCard.tsx"
import { useFormula } from "@/hooks/useFormula.ts"

const App = () => {
  const {
    formula,
    updateLiteral,
    addLiteral,
    removeLiteral,
    addClause,
    removeClause,
  } = useFormula()

  const handleSolve = () => {
    console.log("Solving formula:", formula)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-12">
        <AppHeader />

        <FormulaEditor
          formula={formula}
          onUpdateLiteral={updateLiteral}
          onAddLiteral={addLiteral}
          onRemoveLiteral={removeLiteral}
          onAddClause={addClause}
          onRemoveClause={removeClause}
          onSolve={handleSolve}
        />

        <SolverStatusCard />
      </div>
    </main>
  )
}

export default App

