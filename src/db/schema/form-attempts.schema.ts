import { boolean, doublePrecision, pgTable, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "../common";
import { formResponses, users } from ".";
import { relations } from "drizzle-orm";
export const formAttempts = pgTable('form_attempts', {
    id: uuid().defaultRandom().notNull().primaryKey(),
    quoted_price: doublePrecision().array().notNull().default([]),
    is_requested: boolean().default(false),
    user_id: uuid().references(() => users.id).notNull(),
    ...timestamps,
})

export const formAttemptRelations = relations(formAttempts, ({ one, many }) => ({
    user: one(users, {
        fields: [formAttempts.user_id],
        references: [users.id]
    }),
    form_responses: many(formResponses)
}))
