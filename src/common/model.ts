import { t } from "elysia";
import { ResponseStatus, ServiceStatus } from "./enum";

export const serviceStatusSchema = t.Enum(ServiceStatus);
export const responseStatusSchema = t.Enum(ResponseStatus);

export const responseSchema = t.Object({
  status: responseStatusSchema,
  message: t.String(),
});

export type ResponseModel = typeof responseSchema.static;
export type ServiceStatusModel = typeof serviceStatusSchema.static;
export type ResponseStatusModel = typeof responseStatusSchema.static;
