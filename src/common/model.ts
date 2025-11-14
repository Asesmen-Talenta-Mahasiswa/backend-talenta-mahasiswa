import { t } from "elysia";
import { ResponseStatus } from "./constant";

export const successResponseModel = t.Literal(ResponseStatus.Success);
export const failResponseModel = t.Object({
  status: t.Literal(ResponseStatus.Fail),
  data: t.Array(
    t.Object({
      field: t.String({ examples: ["error_field"] }),
      message: t.String(),
    }),
  ),
});
export const errorResponseModel = t.Object({
  status: t.Literal(ResponseStatus.Error),
  message: t.String(),
});

export const paginationModel = t.Object({
  page: t.Number(),
  pageSize: t.Number(),
  totalItems: t.Number(),
  totalPages: t.Number(),
});

export type FailResponseModel = typeof failResponseModel.static;
export type ErrorResponseModel = typeof errorResponseModel.static;
