import { t } from "elysia";
import { ResponseStatus } from "./enum";

export const successResponseModel = t.Literal(ResponseStatus.Success);
export const failResponseModel = t.Object({
  status: t.Literal(ResponseStatus.Fail),
  data: t.Array(
    t.Object({
      field: t.String({ examples: ["password"] }),
      message: t.String(),
    }),
  ),
});
export const errorResponseModel = t.Object({
  status: t.Literal(ResponseStatus.Error),
  message: t.String(),
});

export type FailResponseModel = typeof failResponseModel.static;
export type ErrorResponseModel = typeof errorResponseModel.static;
