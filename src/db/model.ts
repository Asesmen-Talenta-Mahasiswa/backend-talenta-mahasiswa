import { serviceStatusSchema } from "../common/model";
import { t } from "elysia";

export const databaseHealthSchema = t.Object({
  status: serviceStatusSchema,
  uptime: t.String(),
  message: t.String(),
});

export type DatabaseHealthModel = typeof databaseHealthSchema.static;
