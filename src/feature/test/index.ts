import Elysia, { NotFoundError, t } from "elysia";
import { TestService } from "./service";
import {
  testParamsSchema,
  testSchema,
  questionSchema,
  testInstructionSchema,
  testNoteSchema,
  optionSchema,
  newTestBodySchema,
  updateTestBodySchema,
  testQuerySchema,
} from "./model";
import { commonResponseSchema } from "../../common/model";
import { ResponseStatus } from "../../common/enum";

export const testEndpoint = new Elysia({ prefix: "/tests", tags: ["Test"] })
  .get(
    "",
    async ({ status, query }) => {
      const tests = await TestService.getTests(
        query.page,
        query.pageSize,
        query.search,
        query.showSubTest,
        query.sort
      );

      return status("OK", {
        status: ResponseStatus.Success,
        message: "Seluruh data test berhasil diambil",
        data: tests,
      });
    },
    {
      query: testQuerySchema,
      response: {
        200: t.Object({
          ...commonResponseSchema("success").properties,
          data: t.Array(t.Omit(testSchema, ["parentId"])),
        }),
        500: commonResponseSchema("error"),
      },
    }
  )
  .get(
    "/:testId",
    async ({ params, status }) => {
      const test = await TestService.getTest(params.testId);

      if (test === undefined) {
        return status(404, {
          status: ResponseStatus.Fail,
          message: "Test tidak ditemukan",
        });
      }

      return status(200, {
        status: ResponseStatus.Success,
        message: "Data tes berhasil diambil",
        data: test,
      });
    },
    {
      params: testParamsSchema,
      response: {
        200: t.Object({
          ...commonResponseSchema("success").properties,
          data: t.Object({
            ...testSchema.properties,
            instructions: t.Array(testInstructionSchema),
            notes: t.Array(testNoteSchema),
            questions: t.Array(
              t.Object({
                ...questionSchema.properties,
                options: t.Array(optionSchema),
              })
            ),
            children: t.Array(testSchema),
          }),
        }),
        404: commonResponseSchema("fail"),
        500: commonResponseSchema("error"),
      },
    }
  )
  .get(
    "/:testId/instructions",
    async ({ params, status }) => {
      const result = await TestService.getTestInstructions(params.testId);

      return status(200, {
        status: ResponseStatus.Success,
        message: "Data instruksi tes berhasil diambil",
        data: result,
      });
    },
    {
      params: testParamsSchema,
      response: {
        200: t.Object({
          ...commonResponseSchema("success").properties,
          data: t.Array(testInstructionSchema),
        }),
        422: commonResponseSchema("fail"),
        500: commonResponseSchema("error"),
      },
    }
  )
  .get(
    "/:testId/notes",
    async ({ params, status }) => {
      const result = await TestService.getTestNotes(params.testId);

      return status(200, {
        status: ResponseStatus.Success,
        message: "Data catatan tes berhasil diambil",
        data: result,
      });
    },
    {
      params: testParamsSchema,
      response: {
        200: t.Object({
          ...commonResponseSchema("success").properties,
          data: t.Array(testNoteSchema),
        }),
        422: commonResponseSchema("fail"),
        500: commonResponseSchema("error"),
      },
    }
  )
  .get(
    "/:testId/questions",
    async ({ params, status }) => {
      const result = await TestService.getTestQuestions(params.testId);

      return status(200, {
        status: ResponseStatus.Success,
        message: "Data pertanyaan berhasil diambil",
        data: result,
      });
    },
    {
      params: testParamsSchema,
      response: {
        200: t.Object({
          ...commonResponseSchema("success").properties,
          data: t.Array(
            t.Object({
              ...questionSchema.properties,
              options: t.Array(optionSchema),
            })
          ),
        }),
        422: commonResponseSchema("fail"),
        500: commonResponseSchema("error"),
      },
    }
  )
  .post(
    "",
    async ({ body, status }) => {
      const created = await TestService.createTest(body);

      if (!created) {
        return status(422, {
          status: ResponseStatus.Fail,
          message: "Data tes gagal dibuat",
        });
      }

      return status(201, {
        status: ResponseStatus.Success,
        message: "Data tes induk berhasil dibuat",
        data: created,
      });
    },
    {
      body: newTestBodySchema,
      response: {
        201: t.Object({
          ...commonResponseSchema("success").properties,
          data: t.Object({
            ...testSchema.properties,
            instructions: t.Optional(t.Array(testInstructionSchema)),
            notes: t.Optional(t.Array(testNoteSchema)),
            questions: t.Array(
              t.Object({
                ...questionSchema.properties,
                options: t.Array(optionSchema),
              })
            ),
          }),
        }),
        422: commonResponseSchema("fail"),
        500: commonResponseSchema("error"),
      },
    }
  )
  .put(
    "/:testId",
    async ({ params, body, status }) => {
      const updated = await TestService.updateTest(params.testId, body);

      if (!updated) {
        return status(404, {
          status: ResponseStatus.Fail,
          message: "Test tidak ditemukan",
        });
      }

      return status(200, {
        status: ResponseStatus.Success,
        message: "Data tes berhasil diperbarui",
        data: updated,
      });
    },
    {
      params: testParamsSchema,
      body: updateTestBodySchema,
      response: {
        200: t.Object({
          ...commonResponseSchema("success").properties,
          data: t.Object({
            ...testSchema.properties,
            instructions: t.Array(testInstructionSchema),
            notes: t.Array(testNoteSchema),
            questions: t.Array(
              t.Object({
                ...questionSchema.properties,
                options: t.Array(optionSchema),
              })
            ),
          }),
        }),
        404: commonResponseSchema("fail"),
        500: commonResponseSchema("error"),
      },
    }
  );
