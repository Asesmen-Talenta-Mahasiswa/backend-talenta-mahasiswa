import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";
import z from "zod";
import { DatabaseService } from "./db/service";
import { responseSchema } from "./common/model";
import { databaseHealthSchema } from "./db/model";
import { ResponseStatus } from "./common/enum";
import { version as apiVersion, author } from "../package.json";

const app = new Elysia()
  .use(
    openapi({
      mapJsonSchema: {
        zod: z.toJSONSchema,
      },
      path: "/docs",
    })
  )
  .get(
    "/",
    () => {
      const now = new Date().toISOString();
      const uptimeSeconds = Math.floor(process.uptime?.() ?? 0);

      return {
        status: ResponseStatus.Success,
        message: "Service metadata retrieved",
        data: {
          name: "CCED UNILA Assessment Backend API",
          version: apiVersion,
          author: author,
          description:
            "Backend API for the Center for Character and Ethics Development (CCED) University of Lampung assessment system.",
          environment: Bun.env.NODE_ENV ?? "development",
          docs: {
            ui: "/docs",
            json: "/docs/json",
          },
          runtime: {
            bun: Bun.version,
            platform: process.platform,
          },
          serverTime: now,
          uptimeSeconds,
        },
      };
    },
    {
      detail: {
        tags: ["System"],
        summary: "Get API Metadata",
        description:
          "Returns metadata and runtime information about this backend service, including version, environment, documentation endpoints, and uptime.",
      },
      response: {
        200: z.object({
          ...responseSchema.shape,
          data: z.object({
            name: z.string(),
            version: z.string(),
            description: z.string(),
            environment: z.string(),
            docs: z.object({ ui: z.string(), json: z.string() }),
            runtime: z.object({ bun: z.string(), platform: z.string() }),
            author: z.object({
              name: z.string(),
              email: z.email(),
            }),
            serverTime: z.string(),
            uptimeSeconds: z.number(),
          }),
        }),
      },
    }
  )
  .get(
    "/health",
    async () => {
      // health check for each component/service.
      // e.g. db connection, redis, etc.
      const dbResult = await DatabaseService.checkConnection();

      return {
        status: ResponseStatus.Success,
        message: "Health check successful",
        data: {
          database: dbResult,
        },
      };
    },
    {
      detail: {
        tags: ["System"],
        summary: "Service Health Check",
        description:
          "Returns the health status of each service used by this app.",
      },
      response: {
        200: z.object({
          ...responseSchema.shape,
          data: z.object({
            database: databaseHealthSchema,
          }),
        }),
      },
    }
  )
  .get(
    "/echo",
    () => {
      // echo service to test the API
      return "Hello world!";
    },
    {
      detail: {
        tags: ["System"],
        summary: "Echo",
        description: "A simple echo endpoint to test if the API is reachable.",
      },
      response: {
        200: z.string().default("Hello world!"),
      },
    }
  )
  .listen(Bun.env.PORT ?? 3000); // for fallback

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
