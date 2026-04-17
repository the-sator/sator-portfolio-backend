import { doublePrecision, json, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "../common";
import { formQuestions, formQuestionTypeEnum, formResponses } from ".";
import { FormQuestionTypeEnum } from "@/modules/form-question/model/form-question.enum";
import { relations } from "drizzle-orm";

export const formOptions = pgTable("form_options", {
  id: uuid().defaultRandom().notNull().primaryKey(),
  option_text: text().notNull(),
  type: formQuestionTypeEnum().default(FormQuestionTypeEnum.SINGLE_CHOICE),
  price: doublePrecision().array().notNull(),
  metadata: json(),
  question_id: uuid()
    .references(() => formQuestions.id, { onDelete: "cascade" })
    .notNull(),
  ...timestamps,
});

export const formOptionRelations = relations(formOptions, ({ one, many }) => ({
  form_question: one(formQuestions, {
    fields: [formOptions.question_id],
    references: [formQuestions.id],
  }),
  form_responses: many(formResponses),
}));
