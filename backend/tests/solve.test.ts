import { describe, expect, it } from "vitest"
import evaluateFormula from "../src/sat/evaluate.js"
import solve from "../src/sat/solve.js"
import type { Formula } from "../src/sat/types.js"

describe("solve", () => {
  it("should solve a single positive unit clause", () => {
    const result = solve([["A"]])

    expect(result).toEqual({ A: true })
  })

  it("should solve a single negated unit clause", () => {
    const result = solve([["!A"]])

    expect(result).toEqual({ A: false })
  })

  it("should return null for directly contradictory unit clauses", () => {
    const formula: Formula = [["A"], ["!A"]]

    expect(solve(formula)).toBeNull()
  })

  it("should return an empty assignment for an empty formula (vacuously satisfiable)", () => {
    const result = solve([])

    expect(result).toEqual({})
  })

  it("should return null for a formula containing an empty clause", () => {
    const formula: Formula = [[]]

    expect(solve(formula)).toBeNull()
  })

  it("should return null for the classic 2-variable unsatisfiable formula", () => {
    const formula: Formula = [
      ["A", "B"],
      ["!A", "B"],
      ["A", "!B"],
      ["!A", "!B"],
    ]

    expect(solve(formula)).toBeNull()
  })

  it("should find a satisfying assignment for a multi-clause satisfiable formula", () => {
    const formula: Formula = [
      ["A", "B"],
      ["!A", "C"],
    ]

    const result = solve(formula)

    expect(result).not.toBeNull()
    expect(evaluateFormula(formula, result!)).toBe(true)
  })

  it("should satisfy a larger 3-SAT style formula", () => {
    const formula: Formula = [
      ["A", "B", "!C"],
      ["!A", "C", "D"],
      ["!B", "!C", "!D"],
      ["A", "!B", "D"],
    ]

    const result = solve(formula)

    expect(result).not.toBeNull()
    expect(evaluateFormula(formula, result!)).toBe(true)
  })

  it("should include every variable appearing in the formula", () => {
    const formula: Formula = [
      ["A", "!B"],
      ["B", "C"],
    ]

    const result = solve(formula)

    expect(result).not.toBeNull()
    expect(Object.keys(result!).sort()).toEqual(["A", "B", "C"])
    expect(evaluateFormula(formula, result!)).toBe(true)
  })

  it("should handle repeated literals and tautological clauses", () => {
    const formula: Formula = [["A", "A"], ["!B", "B", "C"]]

    const result = solve(formula)

    expect(result).not.toBeNull()
    expect(evaluateFormula(formula, result!)).toBe(true)
  })
})

