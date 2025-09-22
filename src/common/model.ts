import z from "zod";
import { ResponseStatus, ServiceStatus } from "./enum";

export const serviceStatusSchema = z.enum(ServiceStatus);
export const responseStatusSchema = z.enum(ResponseStatus);

export const responseSchema = z.object({
  status: responseStatusSchema,
  message: z.string(),
});

export type ResponseModel = z.infer<typeof responseSchema>;
export type ServiceStatusModel = z.infer<typeof serviceStatusSchema>;
export type ResponseStatusModel = z.infer<typeof responseStatusSchema>;
