import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { resultsTable, studentsTable } from "../../db/schema";

export const newStudentSchema = createInsertSchema(studentsTable, {
  npm: t.String({
    minLength: 10,
    maxLength: 10,
    pattern: "^[0-9]+$",
    error: "NPM harus terdiri dari 10 digit angka",
  }),
  name: t.String({
    minLength: 1,
    maxLength: 128,
    error: "Nama tidak boleh kosong",
  }),
  email: t.Optional(
    t.Null(t.String({ format: "email", error: "Email tidak valid" }))
  ),
});
export const getStudentSchema = createSelectSchema(studentsTable);
export const updateStudentSchema = createUpdateSchema(studentsTable, {
  email: t.String({ format: "email", error: "Email tidak valid" }),
});

export const resultSchema = createSelectSchema(resultsTable);

export const npmSchema = t.Object({
  npm: t.String({
    minLength: 10,
    maxLength: 10,
    pattern: "^[0-9]+$",
    error: "NPM harus terdiri dari 10 digit angka",
  }),
});

export type NewStudentModel = typeof newStudentSchema.static;
export type StudentModel = typeof getStudentSchema.static;
export type UpdateStudentModel = typeof updateStudentSchema.static;
