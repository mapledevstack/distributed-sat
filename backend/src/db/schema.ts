import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core"

export const jobs = pgTable("jobs", {
  id: text("id").primaryKey(),

  status: text("status").notNull(),

  formula: jsonb("formula").notNull(),
  formulaHash: text("formula_hash").notNull(),

  result: jsonb("result"),
  error: text("error"),

  totalChunks: integer("total_chunks").notNull(),
  completedChunks: integer("completed_chunks").notNull().default(0),

  totalAssignments: integer("total_assignments"),
  chunkSize: integer("chunk_size"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
})

export const chunks = pgTable(
  "chunks",
  {
    id: text("id").primaryKey(),

    jobId: text("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),

    chunkIndex: integer("chunk_index").notNull(),
    start: integer("start").notNull(),
    end: integer("end").notNull(),

    status: text("status").notNull().default("queued"),
    result: jsonb("result"),

    workerId: text("worker_id"),

    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
  },
  (table) => [index("chunks_job_id_idx").on(table.jobId)],
)

