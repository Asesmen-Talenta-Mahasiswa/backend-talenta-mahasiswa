import { t } from "elysia";
import { ResponseStatus, ServiceStatus } from "./enum";
import { enumValuesAsNonEmptyTuple } from "../utils";

export const serviceStatusSchema = t.UnionEnum(enumValuesAsNonEmptyTuple(ServiceStatus));
export const responseStatusSchema = t.UnionEnum(
  enumValuesAsNonEmptyTuple(ResponseStatus)
);

export const commonResponseSchema = (examples: "success" | "fail" | "error") => {
  return t.Object({
    status: t.UnionEnum(enumValuesAsNonEmptyTuple(ResponseStatus), {
      examples: [examples],
    }),
    message: t.String(),
  });
};

const _commonResponseSchema = commonResponseSchema("success");

export type CommonResponseModel = typeof _commonResponseSchema.static;
export type ServiceStatusModel = typeof serviceStatusSchema.static;
export type ResponseStatusModel = typeof responseStatusSchema.static;
