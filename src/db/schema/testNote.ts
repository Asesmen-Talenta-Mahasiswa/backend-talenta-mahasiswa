import { integer, text, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { assessmentSchema } from "../mySchema";
import { randomUUIDv7 } from "bun";
import test from "./test";

export const testNote = assessmentSchema.table("test_note", {
    id: uuid("id")
        .primaryKey()
        .$default(() => randomUUIDv7()),
    text: text("text").notNull(),
    order: integer("order").notNull(),
    testId: integer("test_id")
        .notNull()
        .references(() => test.id, { onDelete: "cascade" }),
});

export const testNoteRelations = relations(testNote, ({ one }) => ({
    test: one(test, {
        fields: [testNote.testId],
        references: [test.id],
    }),
}));

export default testNote;
