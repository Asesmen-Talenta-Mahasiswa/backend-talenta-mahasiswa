import { integer, text, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { assessmentSchema } from "../mySchema";
import { randomUUIDv7 } from "bun";
import testQuestion from "./testQuestion";

export const testQuestionOption = assessmentSchema.table(
  "test_question_option",
  {
    id: uuid("id")
      .primaryKey()
      .$default(() => randomUUIDv7()),
    text: text("text").notNull(),
    value: text("value").notNull(),
    order: integer("order").notNull(),
    testQuestionId: uuid("test_question_id")
      .notNull()
      .references(() => testQuestion.id, { onDelete: "cascade" }),
  },
);

export const testQuestionOptionRelations = relations(
  testQuestionOption,
  ({ one }) => ({
    question: one(testQuestion, {
      fields: [testQuestionOption.testQuestionId],
      references: [testQuestion.id],
    }),
  }),
);

export default testQuestionOption;
