import Elysia, { NotFoundError, t } from "elysia";
import { StudentService } from "./service";
import { ResponseStatus } from "../../common/enum";
import {
  npmParamsSchema,
  studentQuerySchema,
  studentSchema,
  UpdateStudentModel,
  updateStudentSchema,
} from "./model";
import { commonResponseSchema } from "../../common/model";
import { cleanFalsyArray, hasAnyValue } from "../../utils";
import { submissionResultSchema, testSubmissionSchema } from "../result/model";
import { testSchema } from "../test/model";

export const studentEndpoint = new Elysia({
  prefix: "/students",
  tags: ["Student"],
})
  .all(
    "/",
    () => {
      throw new NotFoundError();
    },
    {
      detail: {
        hide: true,
      },
    }
  )
  .get(
    "",
    async ({ query, status }) => {
      const results = await StudentService.getStudents(
        query.page,
        query.pageSize,
        query.search,
        cleanFalsyArray<number>(query.year),
        cleanFalsyArray<string>(query.program),
        cleanFalsyArray<string>(query.faculty),
        cleanFalsyArray<string>(query.degree)
      );

      return status(200, {
        status: ResponseStatus.Success,
        message: "Data mahasiswa berhasil diambil",
        data: results.students,
        meta: results.meta,
      });
    },
    {
      query: studentQuerySchema,
      response: {
        200: t.Object({
          ...commonResponseSchema("success").properties,
          data: t.Array(
            t.Object({
              ...studentSchema.properties,
              submissions: t.Array(
                t.Object({
                  ...testSubmissionSchema.properties,
                  results: t.Array(
                    t.Object({
                      ...submissionResultSchema.properties,
                      test: testSchema,
                    })
                  ),
                })
              ),
            })
          ),
        }),
        500: commonResponseSchema("error"),
      },
    }
  )
  .get(
    "/:npm",
    async ({ params, status }) => {
      const student = await StudentService.getStudent(params.npm);

      if (!student) {
        return status(404, {
          status: ResponseStatus.Fail,
          message: "Mahasiswa tidak ditemukan",
        });
      }

      return status(200, {
        status: ResponseStatus.Success,
        message: "Mahasiswa ditemukan",
        data: student,
      });
    },
    {
      params: npmParamsSchema,
      response: {
        200: t.Object({
          ...commonResponseSchema("success").properties,
          data: t.Object({
            ...studentSchema.properties,
            submissions: t.Array(
              t.Object({
                ...testSubmissionSchema.properties,
                results: t.Array(
                  t.Object({
                    ...submissionResultSchema.properties,
                    test: testSchema,
                  })
                ),
              })
            ),
          }),
        }),
        404: commonResponseSchema("fail"),
        500: commonResponseSchema("error"),
      },
    }
  )
  .patch(
    "/:npm",
    async ({ params, body, status }) => {
      const isRequestBodyEmpty = hasAnyValue<UpdateStudentModel>(body);

      if (!isRequestBodyEmpty) {
        return status(400, {
          status: ResponseStatus.Fail,
          message: "Tidak ada data yang bisa diperbarui karena request body kosong",
        });
      }

      const newStudent = await StudentService.updateStudent(params.npm, body);

      if (!newStudent) {
        return status(422, {
          status: ResponseStatus.Fail,
          message: "Data mahasiswa gagal diperbarui",
        });
      }

      return status(201, {
        status: ResponseStatus.Success,
        message: "Data mahasiswa berhasil diperbarui",
        data: newStudent,
      });
    },
    {
      params: npmParamsSchema,
      body: t.Omit(updateStudentSchema, ["id", "npm", "createdAt", "updatedAt"], {
        error: "Request body tidak valid",
      }),
      response: {
        201: t.Object({
          ...commonResponseSchema("success").properties,
          data: studentSchema,
        }),
        400: commonResponseSchema("fail"),
        422: commonResponseSchema("fail"),
      },
    }
  );
