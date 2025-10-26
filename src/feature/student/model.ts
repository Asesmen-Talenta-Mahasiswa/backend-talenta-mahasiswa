import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { studentsTable } from "../../db/schema";
import { Degree, Faculty, Program } from "../../common/enum";

export const studentSchema = createSelectSchema(studentsTable);

export const newStudentSchema = createInsertSchema(studentsTable, {
  npm: (schema) =>
    t.String({
      ...schema,
      minLength: 10,
      maxLength: 10,
      pattern: "^[0-9]+$",
      error: "NPM harus terdiri dari 10 digit angka",
      examples: ["2515061066", "2401234567", "2609876543"],
    }),
  name: (schema) =>
    t.String({
      ...schema,
      minLength: 1,
      error: "Nama tidak valid",
      examples: ["Budi Santoso", "Siti Aminah", "Agus Salim"],
    }),
  email: t.Optional(
    t.Union([
      t.String({
        format: "email",
        error: "Email tidak valid",
        examples: ["budi@example.com", "siti@example.com", "agus@example.com"],
      }),
      t.Null(),
    ])
  ),
  year: (schema) =>
    t.Number({
      ...schema,
      minimum: 1000,
      maximum: 9999,
      error: "Tahun masuk tidak valid, hanya boleh 1000 - 9999",
      examples: [2024, 2025, 2026],
    }),
  program: (schema) =>
    t.String({
      ...schema,
      minLength: 1,
      error: "Program studi tidak valid",
      examples: [
        Program.TeknikInformatika,
        Program.SistemInformasi,
        Program.IlmuKomputer,
      ],
    }),
  faculty: (schema) =>
    t.String({
      ...schema,
      minLength: 1,
      error: "Fakultas tidak valid",
      examples: [Faculty.FT, Faculty.FMIPA],
    }),
  degree: (schema) =>
    t.String({
      ...schema,
      minLength: 1,
      error: "Jenjang tidak valid",
      examples: [Degree.D3, Degree.D4, Degree.S1],
    }),
});

export const updateStudentSchema = createUpdateSchema(studentsTable, {
  npm: (schema) =>
    t.String({
      ...schema,
      minLength: 10,
      maxLength: 10,
      pattern: "^[0-9]+$",
      error: "NPM harus terdiri dari 10 digit angka",
      examples: ["2515061066", "2401234567", "2609876543"],
    }),
  name: (schema) =>
    t.String({
      ...schema,
      minLength: 1,
      error: "Nama tidak valid",
      examples: ["Budi Santoso", "Siti Aminah", "Agus Salim"],
    }),
  email: (schema) =>
    t.Optional(
      t.String({
        ...schema,
        format: "email",
        error: "Email tidak valid",
        examples: ["budi@example.com", "siti@example.com", "agus@example.com"],
      })
    ),
  year: (schema) =>
    t.Number({
      ...schema,
      minimum: 1000,
      maximum: 9999,
      error: "Tahun masuk tidak valid",
      examples: [2024, 2025, 2026],
    }),
  program: (schema) =>
    t.String({
      ...schema,
      minLength: 1,
      error: "Program studi tidak valid",
      examples: [
        Program.TeknikInformatika,
        Program.SistemInformasi,
        Program.IlmuKomputer,
      ],
    }),
  faculty: (schema) =>
    t.String({
      ...schema,
      minLength: 1,
      error: "Fakultas tidak valid",
      examples: [Faculty.FT, Faculty.FMIPA],
    }),
  degree: (schema) =>
    t.String({
      ...schema,
      minLength: 1,
      error: "Jenjang tidak valid",
      examples: [Degree.D3, Degree.D4, Degree.S1],
    }),
});

export const npmParamsSchema = t.Object(
  {
    npm: t.String({
      minLength: 10,
      maxLength: 10,
      pattern: "^[0-9]+$",
      error: "NPM harus terdiri dari 10 digit angka",
      examples: ["2515061066", "2401234567", "2609876543"],
    }),
  },
  { error: "Query tidak valid" }
);

export const studentQuerySchema = t.Object(
  {
    page: t.Optional(
      t.Number({ minimum: 1, error: "Halaman minimal 1", examples: [1, 2, 3] })
    ),
    pageSize: t.Optional(
      t.Number({
        minimum: 1,
        maximum: 100,
        error: "Ukuran halaman harus antara 1-100",
        examples: [1, 5, 10, 20, 50, 100],
      })
    ),
    search: t.Optional(
      t.String({
        error: "Pencarian tidak valid, harus berupa NPM atau nama",
        examples: ["2515061066", "Budi Santoso"],
      })
    ),
    year: t.Optional(
      t.Array(
        t.Number({
          minimum: 1000,
          maximum: 9999,
          error: "Tahun angkatan tidak valid, hanya boleh 1000 sampai 9999",
          examples: [2024, 2025, 2026],
        }),
        {
          error: "Filter angkatan harus terdiri dari tahun yang valid",
          examples: [[2024, 2025]],
        }
      )
    ),
    program: t.Optional(
      t.Array(
        t.String({
          error: "Program studi tidak valid",
          examples: [Program.TeknikInformatika, Program.SistemInformasi],
        }),
        {
          error: "Filter program studi harus terdiri dari program studi yang valid",
          examples: [[Program.TeknikInformatika, Program.SistemInformasi]],
        }
      )
    ),
    faculty: t.Optional(
      t.Array(
        t.String({
          error: "Fakultas tidak valid",
          examples: [Faculty.FT, Faculty.FMIPA],
        }),
        {
          error: "Filter fakultas harus terdiri dari fakultas yang valid",
          examples: [[Faculty.FT, Faculty.FMIPA]],
        }
      )
    ),
    degree: t.Optional(
      t.Array(
        t.String({
          error: "Jenjang tidak valid",
          examples: [Degree.D3, Degree.D4, Degree.S1],
        }),
        {
          error: "Filter jenjang harus terdiri dari jenjang yang valid",
          examples: [[Degree.D3, Degree.D4, Degree.S1]],
        }
      )
    ),
    sort: t.Optional(
      t.UnionEnum(["asc", "desc"], {
        error: "Opsi sorting tidak valid",
        default: "desc",
      })
    ),
  },
  { error: "Query tidak valid" }
);

export type StudentModel = typeof studentSchema.static;
export type NewStudentModel = typeof newStudentSchema.static;
export type UpdateStudentModel = typeof updateStudentSchema.static;
