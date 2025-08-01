import { pgTable, integer, text, jsonb, uuid, pgEnum, timestamp, primaryKey } from "drizzle-orm/pg-core"
import { usersSync as usersSyncTable } from "drizzle-orm/neon"

export type User = typeof usersSyncTable.$inferSelect
export type NewUser = typeof usersSyncTable.$inferInsert

export const supportCaseStatusEnum = pgEnum("support_case_status", [
	"open",
	"in_progress", 
	"resolved"
])

export const supportCase = pgTable(
	"support_case",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: text("user_id").notNull().references(() => usersSyncTable.id, { onDelete: "cascade" }),
		subject: text("subject").notNull(),
		status: supportCaseStatusEnum("status").default("open").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
)

export const supportCaseMessage = pgTable(
	"support_case_message",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		supportCaseId: uuid("support_case_id").notNull().references(() => supportCase.id, { onDelete: "cascade" }),
		userId: text("user_id").notNull().references(() => usersSyncTable.id, { onDelete: "cascade" }),
		message: text("message").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
)

export type SupportCase = typeof supportCase.$inferSelect
export type NewSupportCase = typeof supportCase.$inferInsert
export type SupportCaseMessage = typeof supportCaseMessage.$inferSelect
export type NewSupportCaseMessage = typeof supportCaseMessage.$inferInsert

