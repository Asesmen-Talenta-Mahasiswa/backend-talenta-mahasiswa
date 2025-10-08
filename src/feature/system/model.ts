import { t } from "elysia";
import { responseSchema } from "../../common/model";
import { databaseHealthSchema } from "../../db/model";

const systemInfoSchema = t.Object({
  name: t.String(),
  version: t.String(),
  description: t.String(),
  environment: t.String(),
  docs: t.Object({ ui: t.String(), json: t.String() }),
  runtime: t.Object({
    bun: t.String(),
    platform: t.String(),
    isBun: t.Boolean(),
  }),
  author: t.Object({
    name: t.String(),
    email: t.String({ format: "email" }),
  }),
  serverTime: t.String(),
  uptimeSeconds: t.Number(),
});

export const getSystemInfoSchema = t.Object({
  ...responseSchema.properties,
  data: systemInfoSchema,
});

export const getSystemHealthSchema = t.Object({
  ...responseSchema.properties,
  data: t.Object({
    database: databaseHealthSchema,
  }),
});

export const getSystemEchoSchema = t.Literal("Hello world!");

export type SystemInfoModel = typeof systemInfoSchema.static;
