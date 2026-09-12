import crypto from "node:crypto"

export const hashFormula = (formula: unknown) => {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(formula))
    .digest("hex")
}
