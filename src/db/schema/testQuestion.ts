import { integer, text, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { assessmentSchema } from "../mySchema";
import { randomUUIDv7 } from "bun";
import test from "./test";
import testQuestionOption from "./testQuestionOption";

export const testQuestion = assessmentSchema.table("test_question", {
    id: uuid("id")
        .primaryKey()
        .$default(() => randomUUIDv7()),
    text: text("text").notNull(),
    type: text("type").notNull(),
    order: integer("order").notNull(),
    testId: integer("test_id")
        .notNull()
        .references(() => test.id, { onDelete: "cascade" }),
});

export const testQuestionRelations = relations(
    testQuestion,
    ({ one, many }) => ({
        test: one(test, {
            fields: [testQuestion.testId],
            references: [test.id],
        }),
        options: many(testQuestionOption),
    }),
);

export default testQuestion;
