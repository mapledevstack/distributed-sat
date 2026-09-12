import { describe, expect, it } from "vitest"
import evaluateFormula from "../src/sat/evaluate.js"
import solve, { solveChunk } from "../src/sat/solve.js"
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

describe("solveChunk", () => {
  it("should find the solution when it lies inside the chunk", () => {
    // Variables in insertion order: A = bit 0, B = bit 1.
    // mask 0 -> { A: false, B: false }, mask 1 -> { A: true, B: false }, ...
    const formula: Formula = [["A", "B"]]

    expect(solveChunk(formula, 0, 4)).toEqual({ A: true, B: false })
  })

  it("should return null when the only satisfying assignment is outside the chunk", () => {
    // [["A"], ["B"]] is only satisfied by mask 3 -> { A: true, B: true }.
    const formula: Formula = [["A"], ["B"]]

    expect(solveChunk(formula, 0, 3)).toBeNull()
    expect(solveChunk(formula, 3, 4)).toEqual({ A: true, B: true })
  })

  it("should treat end as exclusive", () => {
    // mask 0 -> { A: false } (fails), mask 1 -> { A: true } (satisfies).
    expect(solveChunk([["A"]], 0, 1)).toBeNull()
    expect(solveChunk([["A"]], 1, 2)).toEqual({ A: true })
    expect(solveChunk([["A"]], 0, 2)).toEqual({ A: true })
  })

  it("should return null for an empty range", () => {
    expect(solveChunk([["A"]], 1, 1)).toBeNull()
    expect(solveChunk([["A"]], 2, 1)).toBeNull()
  })

  it("should return null for an unsatisfiable formula over the full range", () => {
    const formula: Formula = [["A"], ["!A"]]

    expect(solveChunk(formula, 0, 2)).toBeNull()
  })

  it("should return an empty assignment for an empty formula when the chunk is non-empty", () => {
    expect(solveChunk([], 0, 1)).toEqual({})
    expect(solveChunk([], 0, 0)).toBeNull()
  })

  it("should only return assignments that satisfy the formula", () => {
    const formula: Formula = [
      ["A", "B", "!C"],
      ["!A", "C"],
    ]

    const result = solveChunk(formula, 0, 8)

    expect(result).not.toBeNull()
    expect(evaluateFormula(formula, result!)).toBe(true)
  })

  it("should partition the search space without missing a solution", () => {
    const formula: Formula = [["A"], ["B"]]
    const firstHalf = solveChunk(formula, 0, 2)
    const secondHalf = solveChunk(formula, 2, 4)

    expect(firstHalf).toBeNull()
    expect(secondHalf).toEqual({ A: true, B: true })
    expect(solve(formula)).toEqual(secondHalf)
  })
})

