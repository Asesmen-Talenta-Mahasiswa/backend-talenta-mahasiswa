import Elysia, { t } from "elysia";
import {
  errorResponseModel,
  failResponseModel,
  successResponseModel,
} from "../../common/model";
import {
  newTestSubmissionAnswerModel,
  newTestSubmissionModel,
  newTestSubmissionResultModel,
  testSubmissionAnswerModel,
  testSubmissionModel,
  testSubmissionResultModel,
  updateTestSubmissionAnswerModel,
  updateTestSubmissionModel,
} from "../test/model";
import {
  testSubmissionParamsModel,
  testSubmissionWithAnswersModel,
} from "./model";
import { ResultService } from "./service";
import { ResponseStatus } from "../../common/constant";

export const resultEndpoint = new Elysia({
  prefix: "/results",
  tags: ["Result"],
})
  .get("", () => {})
  .get(
    "/test-submission/:submissionId",
    async ({ params, status }) => {
      const submission = await ResultService.getTestSubmission(
        params.submissionId,
      );

      if (!submission) {
        return status(404, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "submissionId",
              message: "Submisi tes tidak ditemukan",
            },
          ],
        });
      }

      return status(200, {
        status: ResponseStatus.Success,
        data: submission,
      });
    },
    {
      params: testSubmissionParamsModel,
      response: {
        200: t.Object({
          status: successResponseModel,
          data: testSubmissionWithAnswersModel,
        }),
        404: failResponseModel,
        422: failResponseModel,
        500: errorResponseModel,
      },
    },
  )
  .post(
    "/test-submission",
    async ({ body, status }) => {
      const result = await ResultService.createTestSubmission(body);

      if (!result) {
        return status(422, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "",
              message: "Submisi tes gagal dibuat",
            },
          ],
        });
      }

      return status(201, {
        status: ResponseStatus.Success,
        data: result,
      });
    },
    {
      body: newTestSubmissionModel,
      response: {
        201: t.Object({
          status: successResponseModel,
          data: testSubmissionModel,
        }),
        422: failResponseModel,
        500: errorResponseModel,
      },
    },
  )
  .post(
    "/test-submission/answer",
    async ({ body, status }) => {
      const result = await ResultService.createTestSubmissionAnswer(body);

      if (!result) {
        return status(422, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "",
              message: "Jawaban submisi tes gagal disimpan",
            },
          ],
        });
      }

      return status(201, {
        status: ResponseStatus.Success,
        data: result,
      });
    },
    {
      body: newTestSubmissionAnswerModel,
      response: {
        201: t.Object({
          status: successResponseModel,
          data: testSubmissionAnswerModel,
        }),
        422: failResponseModel,
        500: errorResponseModel,
      },
    },
  )
  .post(
    "/test-submission/result",
    async ({ body, status }) => {
      const result = await ResultService.createTestSubmissionResult(body);

      if (!result) {
        return status(422, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "",
              message: "Hasil submisi tes gagal disimpan",
            },
          ],
        });
      }

      return status(201, {
        status: ResponseStatus.Success,
        data: result,
      });
    },
    {
      body: newTestSubmissionResultModel,
      response: {
        201: t.Object({
          status: successResponseModel,
          data: testSubmissionResultModel,
        }),
        422: failResponseModel,
        500: errorResponseModel,
      },
    },
  )
  .patch(
    "/test-submission/:submissionId",
    async ({ params, body, status }) => {
      const result = await ResultService.updateTestSubmission(
        params.submissionId,
        body,
      );

      if (!result) {
        return status(422, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "",
              message: "Submisi tes gagal diperbarui",
            },
          ],
        });
      }

      return status(200, {
        status: ResponseStatus.Success,
        data: result,
      });
    },
    {
      params: testSubmissionParamsModel,
      body: updateTestSubmissionModel,
      response: {
        200: t.Object({
          status: successResponseModel,
          data: testSubmissionModel,
        }),
        422: failResponseModel,
        500: errorResponseModel,
      },
    },
  )

  .put(
    "/test-submission/:submissionId/answer",
    async ({ params, body, status }) => {
      const result = await ResultService.updateTestSubmissionAnswer(
        params.submissionId,
        body,
      );

      if (!result) {
        return status(422, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "",
              message: "Jawaban submisi tes gagal diperbarui",
            },
          ],
        });
      }

      return status(200, {
        status: ResponseStatus.Success,
        data: result,
      });
    },
    {
      params: testSubmissionParamsModel,
      body: updateTestSubmissionAnswerModel,
      response: {
        200: t.Object({
          status: successResponseModel,
          data: t.Array(testSubmissionAnswerModel),
        }),
        422: failResponseModel,
        500: errorResponseModel,
      },
    },
  );
// .patch(
//   "/test-submission/answer/:answerId",
//   async ({ params, body, status }) => {
//     const result = await ResultService.updateTestSubmissionAnswer(
//       params.answerId,
//       body,
//     );

//     if (!result) {
//       return status(422, {
//         status: ResponseStatus.Fail,
//         data: [
//           {
//             field: "",
//             message: "Jawaban submisi tes gagal diperbarui",
//           },
//         ],
//       });
//     }

//     return status(200, {
//       status: ResponseStatus.Success,
//       data: result,
//     });
//   },
//   {
//     params: testSubmissionAnswerParamsModel,
//     body: updateTestSubmissionAnswerModel,
//     response: {
//       200: t.Object({
//         status: successResponseModel,
//         data: testSubmissionAnswerModel,
//       }),
//       422: failResponseModel,
//       500: errorResponseModel,
//     },
//   },
// );
