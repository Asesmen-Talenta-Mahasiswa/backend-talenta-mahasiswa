import Elysia, { t } from "elysia";
import { TestService } from "./service";
import {
  newTestBodyModel,
  testBodyModel,
  testInstructionModel,
  testModel,
  testNoteModel,
  testParamsModel,
  testQueryModel,
  testQuestionModel,
  testQuestionOptionModel,
  updateTestBodyModel,
} from "./model";
import {
  errorResponseModel,
  failResponseModel,
  successResponseModel,
} from "../../common/model";
import { ResponseStatus } from "../../common/constant";

export const testEndpoint = new Elysia({ prefix: "/tests", tags: ["Test"] })
  .get(
    "",
    async ({ status, query }) => {
      const { pagination, tests } = await TestService.getTests(
        query.page,
        query.pageSize,
        query.search,
        query.showSubTest,
        query.sortDirection,
      );

      return status("OK", {
        status: ResponseStatus.Success,
        data: tests,
        pagination,
      });
    },
    {
      query: testQueryModel,
      response: {
        200: t.Object({
          status: successResponseModel,
          data: t.Array(testModel),
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
    "/:testId",
    async ({ params, status }) => {
      const test = await TestService.getTest(params.testId);

      if (test === undefined) {
        return status(404, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "testId",
              message: "Data tes tidak ditemukan",
            },
          ],
        });
      }

      return status(200, {
        status: ResponseStatus.Success,
        data: test,
      });
    },
    {
      params: testParamsModel,
      response: {
        200: t.Object({
          status: successResponseModel,
          data: testBodyModel,
        }),
        404: failResponseModel,
        422: failResponseModel,
        500: errorResponseModel,
      },
    },
  )
  .get(
    "/:testId/instructions",
    async ({ params, status }) => {
      const result = await TestService.getTestInstructions(params.testId);

      if (result === null) {
        return status(404, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "testId",
              message: "Data tes tidak ditemukan",
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
      params: testParamsModel,
      response: {
        200: t.Object({
          status: successResponseModel,
          data: t.Array(testInstructionModel),
        }),
        404: failResponseModel,
        422: failResponseModel,
        500: errorResponseModel,
      },
    },
  )
  .get(
    "/:testId/notes",
    async ({ params, status }) => {
      const result = await TestService.getTestNotes(params.testId);

      if (result === null) {
        return status(404, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "testId",
              message: "Data tes tidak ditemukan",
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
      params: testParamsModel,
      response: {
        200: t.Object({
          status: successResponseModel,
          data: t.Array(testNoteModel),
        }),
        404: failResponseModel,
        422: failResponseModel,
        500: errorResponseModel,
      },
    },
  )
  .get(
    "/:testId/questions",
    async ({ params, status }) => {
      const result = await TestService.getTestQuestions(params.testId);

      if (result === null) {
        return status(404, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "testId",
              message: "Data tes tidak ditemukan",
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
      params: testParamsModel,
      response: {
        200: t.Object({
          status: successResponseModel,
          data: t.Array(
            t.Object({
              ...testQuestionModel.properties,
              options: t.Array(testQuestionOptionModel),
            }),
          ),
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
      const created = await TestService.createTest(body);

      if (!created) {
        return status(422, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "",
              message: "Data tes gagal dibuat",
            },
          ],
        });
      }

      return status(201, {
        status: ResponseStatus.Success,
        data: {
          ...created.test,
          instructions: created.instructions,
          notes: created.notes,
          questions: created.questions,
          children: [],
        },
      });
    },
    {
      body: newTestBodyModel,
      response: {
        201: t.Object({
          status: successResponseModel,
          data: testBodyModel,
        }),
        422: failResponseModel,
        500: errorResponseModel,
      },
    },
  )
  .put(
    "/:testId",
    async ({ params, body, status }) => {
      const updated = await TestService.updateTest(params.testId, body);

      if (!updated) {
        return status(404, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "testId",
              message: "Data tes tidak ditemukan",
            },
          ],
        });
      }

      return status(200, {
        status: ResponseStatus.Success,
        data: updated,
      });
    },
    {
      params: testParamsModel,
      body: updateTestBodyModel,
      response: {
        200: t.Object({
          status: successResponseModel,
          data: testBodyModel,
        }),
        404: failResponseModel,
        422: failResponseModel,
        500: errorResponseModel,
      },
    },
  );
