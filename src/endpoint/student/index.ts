import Elysia, { t } from "elysia";
import { StudentService } from "./service";
import {
  newStudentModel,
  studentModel,
  studentParamsModel,
  studentQueryModel,
  studentResponseModel,
  updateStudentModel,
} from "./model";
import {
  errorResponseModel,
  failResponseModel,
  successResponseModel,
} from "../../common/model";
import { ResponseStatus } from "../../common/constant";

export const studentEndpoint = new Elysia({
  prefix: "/students",
  tags: ["Student"],
})
  .get(
    "",
    async ({ query, status }) => {
      const { pagination, students } = await StudentService.getStudents(
        query.page,
        query.pageSize,
        query.search,
        query.majorId,
        query.departmentId,
        query.facultyId,
        query.sortDirection,
      );

      return status(200, {
        status: ResponseStatus.Success,
        data: students,
        pagination,
      });
    },
    {
      query: studentQueryModel,
      response: {
        200: t.Object({
          status: successResponseModel,
          data: t.Array(studentResponseModel),
          pagination: t.Object({
            page: t.Number(),
            pageSize: t.Number(),
            totalItems: t.Number(),
            totalPages: t.Number(),
          }),
        }),
        422: failResponseModel,
        500: errorResponseModel,
      },
    },
  )
  .get(
    "/:npm",
    async ({ params, status }) => {
      const student = await StudentService.getStudent(params.npm);

      if (!student) {
        return status(404, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "npm",
              message: "Data mahasiswa tidak ditemukan",
            },
          ],
        });
      }

      return status(200, {
        status: ResponseStatus.Success,
        data: student,
      });
    },
    {
      params: studentParamsModel,
      response: {
        200: t.Object({
          status: successResponseModel,
          data: studentResponseModel,
        }),
        404: failResponseModel,
        422: failResponseModel,
        500: errorResponseModel,
      },
    },
  )
  .post(
    "",
    async ({ body, status }) => {
      const newStudent = await StudentService.createStudent(body);

      if (!newStudent) {
        return status(422, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "",
              message: "Data mahasiswa gagal dibuat",
            },
          ],
        });
      }

      return status(201, {
        status: ResponseStatus.Success,
        data: newStudent,
      });
    },
    {
      body: newStudentModel,
      response: {
        201: t.Object({
          status: successResponseModel,
          data: studentModel,
        }),
        422: failResponseModel,
        500: errorResponseModel,
      },
    },
  )
  .patch(
    "/:npm",
    async ({ params, body, status }) => {
      const newStudent = await StudentService.updateStudent(params.npm, body);

      if (!newStudent) {
        return status(422, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "",
              message: "Data mahasiswa gagal dibuat",
            },
          ],
        });
      }

      return status(201, {
        status: ResponseStatus.Success,
        message: "Data mahasiswa berhasil diperbarui",
        data: newStudent,
      });
    },
    {
      params: studentParamsModel,
      body: updateStudentModel,
      response: {
        201: t.Object({
          status: successResponseModel,
          data: studentModel,
        }),
        422: failResponseModel,
        500: errorResponseModel,
      },
    },
  );
