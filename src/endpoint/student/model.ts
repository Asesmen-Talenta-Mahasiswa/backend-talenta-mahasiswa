import { t } from "elysia";
import { dbModel } from "../../db/model";
import { SortDirection } from "../../common/constant";
import { testModel, testSubmissionModel, testSubmissionResultModel } from "../test/model";

const selectStudent = dbModel.select.student;
const { id, updatedAt, createdAt, ...insertStudent } = dbModel.insert.student;

export const studentModel = t.Object({
  ...selectStudent,
});
export const newStudentModel = t.Object(
  {
    ...insertStudent,
  },
  {
    error: "Request body untuk mahasiswa baru tidak valid",
  }
);
export const updateStudentModel = t.Partial(
  t.Object(
    {
      ...insertStudent,
    },
    {
      minProperties: 1,
      error: "Request body untuk mengubah data mahasiswa tidak valid",
    }
  )
);

export const studentParamsModel = t.Object({
  npm: t.String({
    minLength: 10,
    maxLength: 10,
    pattern: "^[0-9]+$",
    error: "NPM harus terdiri dari 10 angka numeric",
    examples: ["2215061066"],
  }),
});

export const studentQueryModel = t.Object({
  page: t.Optional(
    t.Number({
      minimum: 1,
      error: "Halaman mahasiswa harus berupa angka dan tidak boleh negatif atau nol",
    })
  ),
  pageSize: t.Optional(
    t.Number({
      minimum: 1,
      maximum: 100,
      error: "Ukuran halaman mahasiswa harus berupa angka dan bernilai antara 1 - 100",
      examples: [1, 5, 10, 50, 100],
    })
  ),
  search: t.Optional(
    t.String({
      error: "Pencarian mahasiswa harus berupa text (bisa nama atau NPM)",
      examples: ["Jack Marlow", "2215061066"],
    })
  ),
  enrollmentYearId: t.Optional(
    t.Array(
      t.Number({
        error: "Tahun angkatan tidak valid",
        examples: [1],
      }),
      {
        error: "Filter tahun angkatan harus berupa kumpulan angka",
        examples: [[1, 2]],
      }
    )
  ),
  majorId: t.Optional(
    t.Array(
      t.Number({
        error: "Program studi tidak valid",
        examples: [1],
      }),
      {
        error: "Filter program studi harus berupa kumpulan angka",
        examples: [[1, 2]],
      }
    )
  ),
  facultyId: t.Optional(
    t.Array(
      t.Number({
        error: "Fakultas tidak valid",
        examples: [1],
      }),
      {
        error: "Filter fakultas harus berupa kumpulan angka",
        examples: [[1, 2]],
      }
    )
  ),
  degreeId: t.Optional(
    t.Array(
      t.Number({
        error: "Jenjang tidak valid",
        examples: [1],
      }),
      {
        error: "Filter jenjang harus berupa kumpulan angka",
        examples: [[1, 2]],
      }
    )
  ),
  sortDirection: t.Optional(
    t.Enum(SortDirection, {
      error: "Opsi pengurutan hanya bisa ascending atau descending",
      examples: [SortDirection.DESC, SortDirection.ASC],
    })
  ),
});

export const studentResponseModel = t.Object({
  ...studentModel.properties,
  submissions: t.Array(
    t.Object({
      ...testSubmissionModel.properties,
      results: t.Array(
        t.Object({
          ...testSubmissionResultModel.properties,
          test: t.Union([testModel, t.Null()]),
        })
      ),
    })
  ),
});

export type StudentModel = typeof studentModel.static;
export type NewStudentModel = typeof newStudentModel.static;
export type UpdateStudentModel = typeof updateStudentModel.static;
