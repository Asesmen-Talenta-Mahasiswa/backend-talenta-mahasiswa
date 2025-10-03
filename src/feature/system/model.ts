import z from "zod";
import { responseSchema } from "../../common/model";
import { databaseHealthSchema } from "../../db/model";

const systemInfoSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string(),
  environment: z.string(),
  docs: z.object({ ui: z.string(), json: z.string() }),
  runtime: z.object({
    bun: z.string(),
    platform: z.string(),
    isBun: z.boolean(),
  }),
  author: z.object({
    name: z.string(),
    email: z.email(),
  }),
  serverTime: z.string(),
  uptimeSeconds: z.number(),
});

export const getSystemInfoSchema = z.object({
  ...responseSchema.shape,
  data: systemInfoSchema,
});

export const getSystemHealthSchema = z.object({
  ...responseSchema.shape,
  data: z.object({
    database: databaseHealthSchema,
  }),
});

export const getSystemEchoSchema = z.literal("Hello world!");

export type SystemInfoModel = z.infer<typeof systemInfoSchema>;
