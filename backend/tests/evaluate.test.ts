import { describe, expect, it } from "vitest"
import { Assignment, Formula } from "../src/sat/types.js"
import evaluateFormula from "../src/sat/evaluate.js"

describe("evaluateFormula", () => {
  it("should return true for a satisfying assignment", () => {
    const formula: Formula = [
      ["A", "B"],
      ["!A", "C"],
    ]
    const assignment: Assignment = {
      A: true,
      B: false,
      C: true,
    }
    expect(evaluateFormula(formula, assignment)).toBe(true)
  })

  it("should return false for a non-satisfying assignment", () => {
    const formula: Formula = [
      ["A", "B"],
      ["!A", "C"],
    ]
    const assignment: Assignment = {
      A: false,
      B: false,
      C: false,
    }
    expect(evaluateFormula(formula, assignment)).toBe(false)
  })
})
