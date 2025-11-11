import Elysia, { t } from "elysia";
import { successResponseModel } from "../../common/model";
import { ServiceStatus } from "../../common/constant";

const systemInfoSchema = t.Object({
  status: successResponseModel,
  data: t.Object({
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
  }),
});

export const seedDatabaseSchema = t.Object(
  {
    user: t.Optional(t.Boolean({ error: "Invalid user flag" })),
    student: t.Optional(t.Boolean({ error: "Invalid student flag" })),
    test: t.Optional(t.Boolean({ error: "Invalid test flag" })),
    result: t.Optional(t.Boolean({ error: "Invalid result flag" })),
  },
  {
    error: "Invalid request",
  },
);

export const getSystemInfoSchema = t.Object({
  status: successResponseModel,
  data: systemInfoSchema,
});

export const getSystemHealthSchema = t.Object({
  status: successResponseModel,
  data: t.Object({
    database: t.Object({
      status: t.Enum(ServiceStatus),
      uptime: t.String(),
      message: t.String(),
    }),
  }),
});

export const systemModel = new Elysia({
  name: "model/system",
  seed: "model/system/RvdV2D",
}).model({
  "system.health": t.Literal("Healthy!"),
  "system.info": systemInfoSchema,
});

export type SystemInfoModel = typeof systemInfoSchema.static;
export type SeedDatabaseModel = typeof seedDatabaseSchema.static;
