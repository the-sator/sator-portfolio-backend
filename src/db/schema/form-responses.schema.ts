import { json, pgTable, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "../common";
import { formAttempts, formOptions, formQuestions } from ".";
import { relations } from "drizzle-orm";

export const formResponses = pgTable('form_responses', {
    id: uuid().defaultRandom().notNull().primaryKey(),
    metadata: json(),
    question_id: uuid().references(() => formQuestions.id, { onDelete: "cascade" }).notNull(),
    option_id: uuid().references(() => formOptions.id, { onDelete: "cascade" }).notNull(),
    attempt_id: uuid().references(() => formAttempts.id, { onDelete: "cascade" }).notNull(),
    ...timestamps,
})

export const formResponseRelations = relations(formResponses, ({ one }) => ({
    form_attempt: one(formAttempts, {
        fields: [formResponses.attempt_id],
        references: [formAttempts.id]
    }),
    form_question: one(formQuestions, {
        fields: [formResponses.question_id],
        references: [formQuestions.id]
    }),
    form_option: one(formOptions, {
        fields: [formResponses.option_id],
        references: [formOptions.id]
    })
}))
