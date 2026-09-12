import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const jobs = pgTable("jobs", {
  id: text("id").primaryKey(),

  status: text("status").notNull(),

  formula: jsonb("formula").notNull(),
  formulaHash: text("formula_hash").notNull(),

  result: jsonb("result"),
  error: text("error"),

  totalChunks: integer("total_chunks").notNull(),
  completedChunks: integer("completed_chunks").notNull().default(0),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
})
