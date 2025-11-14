import Elysia, { type ValidationError } from "elysia";
import type { FailResponseModel, ErrorResponseModel } from "../common/model";

function handleValidationError(error: Readonly<ValidationError>) {
  const data = error.all
    .filter((item) => "message" in item)
    .map((item) => ({
      field: item.path.slice(1),
      message: item.schema.error?.toString() ?? item.message,
    }));
  return data;
}

export const errorHandleMiddleware = new Elysia({
  name: "middleware/errorHandle",
})
  .onError(({ code, error, status }) => {
    if (code === "NOT_FOUND") {
      return status(404, "What yall lookin for?");
    }

    if (code === "PARSE") {
      return status(422, {
        status: "fail",
        data: [
          {
            field: "body",
            message: "Invalid request body",
          },
        ],
      } satisfies FailResponseModel);
    }

    if (code === "UNKNOWN") {
      return status(500, "Unknown error occurred");
    }

    if (code === "VALIDATION") {
      const data = handleValidationError(error);
      return status(422, {
        status: "fail",
        data,
      } satisfies FailResponseModel);
    }

    if (code === "INTERNAL_SERVER_ERROR") {
      const errMsg =
        error.message === "INTERNAL_SERVER_ERROR"
          ? "Terjadi sebuah kesalahan pada server, coba beberapa saat lagi"
          : error.message;
      return status(500, {
        status: "error",
        message: errMsg,
      } satisfies ErrorResponseModel);
    }

    if (typeof code === "number") {
      if (code >= 500) {
        const errMsg =
          (error.response as any) === "Internal Server Error"
            ? "Terjadi sebuah kesalahan pada server, coba beberapa saat lagi"
            : (error.response as any);
        return status(500, {
          status: "error",
          message: errMsg,
        } satisfies ErrorResponseModel);
      }

      if (code >= 400) {
        const val = error.response as unknown as FailResponseModel;
        return status(error.code, val);
      }
    }
  })
  .as("global");
