import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const jobs = pgTable("jobs", {
  id: text("id").primaryKey(),

  status: text("status").notNull(),

  formula: jsonb("formula").notNull(),

  formulaHash: text("formula_hash").notNull(),

  result: jsonb("result"),

  error: text("error"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  completedAt: timestamp("completed_at"),
})
