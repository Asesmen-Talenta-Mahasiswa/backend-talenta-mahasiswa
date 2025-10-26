import Elysia, { NotFoundError, t } from "elysia";
import { TestService } from "./service";
import {
  testParamsSchema,
  testSchema,
  questionSchema,
  testInstructionSchema,
  testNoteSchema,
  optionSchema,
  newTestSchema,
  newTestBodySchema,
  testQuerySchema,
} from "./model";
import { commonResponseSchema } from "../../common/model";
import { QuestionType, ResponseStatus } from "../../common/enum";
import { enumValuesAsNonEmptyTuple } from "../../utils";

export const testEndpoint = new Elysia({ prefix: "/tests", tags: ["Test"] })
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
  .get("/:testId/instructions", () => {})
  .get("/:testId/notes", () => {})
  .get("/:testId/questions", () => {})
  .get("/:testId/questions/{questionId}", () => {})
  .get("/:testId/questions/{questionId}/options", () => {})
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
  );
