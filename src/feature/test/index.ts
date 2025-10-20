import Elysia, { NotFoundError, t } from "elysia";
import { TestService } from "./service";
import {
  testParamsSchema,
  testSchema,
  questionSchema,
  testInstructionSchema,
  testNoteSchema,
  optionSchema,
} from "./model";
import { commonResponseSchema } from "../../common/model";
import { ResponseStatus } from "../../common/enum";

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
    async ({ status }) => {
      const tests = await TestService.getTests();

      return status("OK", {
        status: ResponseStatus.Success,
        message: "Data tes berhasil diambil",
        data: tests,
      });
    },
    {
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
  );
