import Elysia, { NotFoundError, t, ValidationError } from "elysia";
import { StudentService } from "./service";
import { ResponseStatus } from "../../common/enum";
import {
  getStudentSchema,
  npmSchema,
  resultSchema,
  updateStudentSchema,
} from "./model";
import { responseSchema } from "../../common/model";

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
    "/:npm",
    async ({ params, status }) => {
      const student = await StudentService.getStudentInfo(params.npm);
      if (!student) {
        return status(404, {
          status: ResponseStatus.Fail,
          message: "Mahasiswa tidak ditemukan",
        });
      }

      console.log(student);

      return status(200, {
        status: ResponseStatus.Success,
        message: "Mahasiswa ditemukan",
        data: student,
      });
    },
    {
      params: npmSchema,
      response: {
        200: t.Object({
          ...responseSchema.properties,
          data: t.Object({
            ...getStudentSchema.properties,
            results: t.Array(resultSchema),
          }),
        }),
        404: responseSchema,
      },
    }
  )
  .put(
    "/:npm",
    async ({ params, body, status }) => {
      const newStudent = await StudentService.updateStudentInfo(
        params.npm,
        body
      );

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
      params: npmSchema,
      body: t.Pick(updateStudentSchema, ["email"], {
        error: "Properti email tidak ditemukan",
      }),
      response: {
        201: t.Object({
          ...responseSchema.properties,
          data: getStudentSchema,
        }),
        422: responseSchema,
      },
    }
  );
