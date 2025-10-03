import { createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { resultsTable, studentsTable } from "../../db/schema";
import z from "zod";
import { responseSchema } from "../../common/model";

const studentSchema = createSelectSchema(studentsTable);
export const updateStudentSchema = createUpdateSchema(studentsTable, {
  email: z.email("Email tidak valid").nullable().optional(),
});

const resultSchema = createSelectSchema(resultsTable);

export const getStudentInfoSchema = z.object({
  ...responseSchema.shape,
  data: z.object({
    ...studentSchema.omit({ createdAt: true }).shape,
    results: z.array(resultSchema.omit({ id: true, studentId: true })),
  }),
});

export const putStudentInfoSchema = z.object({
  ...responseSchema.shape,
  data: updateStudentSchema.omit({ createdAt: true }),
});

export const npmSchema = z.object({
  npm: z
    .string()
    .length(10, "NPM harus terdiri dari 10 karakter")
    .regex(/^\d+$/, "NPM harus berupa angka"),
});

export type UpdateStudentModel = z.infer<typeof updateStudentSchema>;
