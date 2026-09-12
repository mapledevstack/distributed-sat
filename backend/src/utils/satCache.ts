import { redis } from "../redis.js"

import type { Assignment, Formula } from "../sat/types.js"
import { hashFormula } from "./hash.js"

export const UNSATISFIABLE_RESULT = { status: "unsatisfiable" } as const

const RESULT_KEY_PREFIX = "sat:result:"
const LOCK_KEY_PREFIX = "sat:lock:"
const SOLVE_LOCK_TTL_SECONDS = 300

export const buildResultCacheKey = (formulaHash: string): string =>
  `${RESULT_KEY_PREFIX}${formulaHash}`

export const buildSolveLockKey = (formulaHash: string): string =>
  `${LOCK_KEY_PREFIX}${formulaHash}`

export const hashAndBuildCacheKeys = (formula: Formula) => {
  const formulaHash = hashFormula(formula)

  return {
    formulaHash,
    resultCacheKey: buildResultCacheKey(formulaHash),
    solveLockKey: buildSolveLockKey(formulaHash),
  }
}

export const readCachedSatResult = async (
  resultCacheKey: string,
): Promise<string | null> => redis.get(resultCacheKey)

export const cacheSatSolution = async (
  resultCacheKey: string,
  solution: Assignment,
): Promise<void> => {
  await redis.set(resultCacheKey, JSON.stringify(solution))
}

export const cacheSatUnsatisfiable = async (
  resultCacheKey: string,
): Promise<void> => {
  await redis.set(resultCacheKey, JSON.stringify(UNSATISFIABLE_RESULT))
}

export const tryAcquireSolveLock = async (
  solveLockKey: string,
): Promise<boolean> => {
  const acquired = await redis.set(
    solveLockKey,
    "1",
    "EX",
    SOLVE_LOCK_TTL_SECONDS,
    "NX",
  )

  return acquired !== null
}

export const releaseSolveLock = async (solveLockKey: string) => {
  await redis.del(solveLockKey)
}
