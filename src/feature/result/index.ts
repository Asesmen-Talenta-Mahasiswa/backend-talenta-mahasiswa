import Elysia, { t } from "elysia";
import {
  newStudentAnswerSchema,
  newSubmissionResultSchema,
  newTestSubmissionSchema,
  studentAnswerParamsSchema,
  studentAnswerSchema,
  submissionResultSchema,
  testSubmissionParamsSchema,
  testSubmissionSchema,
  updateStudentAnswerSchema,
  updateTestSubmissionSchema,
} from "./model";
import { ResultService } from "./service";
import { commonResponseSchema } from "../../common/model";
import { ResponseStatus } from "../../common/enum";

export const resultEndpoint = new Elysia({ prefix: "/results", tags: ["Result"] })
  .get("", () => {})
  .post(
    "/test-submissions",
    async ({ body, status }) => {
      const result = await ResultService.createTestSubmission(body);

      if (!result) {
        return status(422, {
          status: ResponseStatus.Fail,
          message: "Submisi tes gagal dibuat",
        });
      }

      return status(201, {
        status: ResponseStatus.Success,
        message: "Submisi tes berhasil dibuat",
        data: result,
      });
    },
    {
      body: newTestSubmissionSchema,
      response: {
        201: t.Object({
          ...commonResponseSchema("success").properties,
          data: testSubmissionSchema,
        }),
        422: commonResponseSchema("fail"),
        500: commonResponseSchema("error"),
      },
    }
  )
  .post(
    "/student-answers",
    async ({ body, status }) => {
      const result = await ResultService.createStudentAnswer(body);

      if (!result) {
        return status(422, {
          status: ResponseStatus.Fail,
          message: "Jawaban gagal disimpan",
        });
      }

      return status(201, {
        status: ResponseStatus.Success,
        message: "Jawaban berhasil disimpan",
        data: result,
      });
    },
    {
      body: newStudentAnswerSchema,
      response: {
        201: t.Object({
          ...commonResponseSchema("success").properties,
          data: studentAnswerSchema,
        }),
        422: commonResponseSchema("fail"),
        500: commonResponseSchema("error"),
      },
    }
  )
  .post(
    "/submission-results",
    async ({ body, status }) => {
      const result = await ResultService.createSubmissionResult(body);

      if (!result) {
        return status(422, {
          status: ResponseStatus.Fail,
          message: "Hasil submisi gagal disimpan",
        });
      }

      return status(201, {
        status: ResponseStatus.Success,
        message: "Hasil submisi berhasil disimpan",
        data: result,
      });
    },
    {
      body: newSubmissionResultSchema,
      response: {
        201: t.Object({
          ...commonResponseSchema("success").properties,
          data: submissionResultSchema,
        }),
        422: commonResponseSchema("fail"),
        500: commonResponseSchema("error"),
      },
    }
  )
  .patch(
    "/test-submissions/:submissionId",
    async ({ params, body, status }) => {
      const result = await ResultService.updateTestSubmission(params.submissionId, body);

      if (!result) {
        return status(422, {
          status: ResponseStatus.Fail,
          message: "Submisi tes gagal diperbarui",
        });
      }

      return status(200, {
        status: ResponseStatus.Success,
        message: "Submisi tes berhasil diperbarui",
        data: result,
      });
    },
    {
      params: testSubmissionParamsSchema,
      body: updateTestSubmissionSchema,
      response: {
        200: t.Object({
          ...commonResponseSchema("success").properties,
          data: testSubmissionSchema,
        }),
        422: commonResponseSchema("fail"),
        500: commonResponseSchema("error"),
      },
    }
  )
  .patch(
    "/student-answers/:answerId",
    async ({ params, body, status }) => {
      const result = await ResultService.updateStudentAnswer(params.answerId, body);

      if (!result) {
        return status(422, {
          status: ResponseStatus.Fail,
          message: "Jawaban gagal diperbarui",
        });
      }

      return status(200, {
        status: ResponseStatus.Success,
        message: "Jawaban berhasil diperbarui",
        data: result,
      });
    },
    {
      params: studentAnswerParamsSchema,
      body: updateStudentAnswerSchema,
      response: {
        200: t.Object({
          ...commonResponseSchema("success").properties,
          data: studentAnswerSchema,
        }),
        422: commonResponseSchema("fail"),
        500: commonResponseSchema("error"),
      },
    }
  );
