import { pgTable, integer, text, jsonb, uuid, pgEnum, timestamp, primaryKey } from "drizzle-orm/pg-core"

// Enum for log types
export const logTypeEnum = pgEnum('log_type', ['info', 'warn', 'error', 'debug']);

// Applications table
export const applications = pgTable('applications', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull().unique(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull()
});

// Logs table
export const logs = pgTable('logs', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  message: text().notNull(),
  type: logTypeEnum().notNull(),
  context: jsonb(),
  applicationId: integer().references(() => applications.id).notNull(),
  correlationId: uuid().notNull(), // UUID for tracing logs and traces across requests/sessions
  createdAt: timestamp().defaultNow().notNull()
});

// Traces table  
export const traces = pgTable('traces', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  trace: text().notNull(),
  context: jsonb(),
  applicationId: integer().references(() => applications.id).notNull(),
  correlationId: uuid().notNull(), // Same UUID type for correlation with logs
  createdAt: timestamp().defaultNow().notNull()
});